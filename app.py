"""
============================================================
  app.py — Flask API for Hybrid Sugarcane Disease Detection
  Updated for new model (sugarcane_hybrid_final.h5):
    - 11 stem features (one per class) instead of 3
    - Uses load_model() directly — no need to rebuild arch
    - Cleaner error handling and response format
============================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import io
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image

app = Flask(__name__)
CORS(app)

# ── CONFIGURATION ─────────────────────────────────────────
MODEL_PATH = 'sugarcane_hybrid_final.h5'   # best checkpoint saved during training
IMG_SIZE   = 224
NUM_STEM_FEATURES = 11   # one binary answer per disease class

CLASS_LABELS = [
    'Banded Chlorosis', 'Brown Spot', 'BrownRust', 'Dried Leaves',
    'Grassy shoot', 'Healthy Leaves', 'Pokkah Boeng', 'Sett Rot',
    'Viral Disease', 'Yellow Leaf', 'smut'
]

# 5 stem-only questions shown to the farmer (frontend maps these → 11 model inputs)
STEM_QUESTIONS = [
    {"class": "smut",         "question": "Do you see a whip-like black growth emerging from the top of the stalk?"},
    {"class": "Sett Rot",     "question": "When cut open, is the inside of the cane reddish, hollow, or foul-smelling?"},
    {"class": "Grassy shoot", "question": "Are there excessive thin, grass-like shoots sprouting from the base of the plant?"},
    {"class": "Pokkah Boeng", "question": "Is the growing tip of the stalk twisted, bent, or deformed?"},
    {"class": "Dried Leaves", "question": "Is the stalk drying out, becoming brittle, or collapsing?"},
]
# ──────────────────────────────────────────────────────────

# ── GPU MEMORY GROWTH (prevents VRAM crash) ───────────────
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"✅ GPU memory growth enabled for {len(gpus)} GPU(s)")
    except RuntimeError as e:
        print(f"⚠️  GPU config warning: {e}")

# ── LOAD MODEL ONCE AT STARTUP ────────────────────────────
model = None

# Custom wrapper to handle TensorFlow version compatibility
class DepthwiseConv2DCompat(tf.keras.layers.DepthwiseConv2D):
    """Compatibility wrapper for DepthwiseConv2D to ignore 'groups' parameter"""
    def __init__(self, *args, **kwargs):
        kwargs.pop('groups', None)  # Remove unsupported parameter
        super().__init__(*args, **kwargs)

def load_hybrid_model():
    global model
    try:
        # Load with custom object scope to handle TF version compatibility
        with tf.keras.utils.custom_object_scope({'DepthwiseConv2D': DepthwiseConv2DCompat}):
            model = load_model(MODEL_PATH, compile=False)
        print(f"✅ Model loaded from '{MODEL_PATH}'")
        print(f"   Inputs  : {[inp.name for inp in model.inputs]}")
        print(f"   Output  : {model.output_shape}")
    except Exception as e:
        print(f"❌ FATAL — Could not load model: {e}")
        model = None

load_hybrid_model()


# ─────────────────────────────────────────────────────────
# ROUTE 1: /questions
#   Returns the list of stem symptom questions so the
#   frontend can render them dynamically.
# ─────────────────────────────────────────────────────────
@app.route('/questions', methods=['GET'])
def get_questions():
    """
    Returns the 5 stem-only questions shown to the farmer.
    Frontend maps these 5 answers → 11 model inputs before calling /predict.
    """
    return jsonify({
        "num_questions" : len(STEM_QUESTIONS),
        "questions"     : STEM_QUESTIONS
    })


# ─────────────────────────────────────────────────────────
# ROUTE 2: /predict
#   Accepts:
#     - leaf_image  : image file (multipart/form-data)
#     - stem_data   : comma-separated 11 binary values
#                     e.g. "0,1,0,0,0,0,0,0,0,0,0"
#   Returns:
#     - prediction, confidence, top_3 predictions
# ─────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded on server. Check server logs.'}), 500

    # ── Validate inputs ──────────────────────────────────
    leaf_file    = request.files.get("leaf_image")
    stem_data_str = request.form.get("stem_data")

    if not leaf_file:
        return jsonify({'error': 'Missing field: leaf_image'}), 400
    if not stem_data_str:
        return jsonify({'error': 'Missing field: stem_data'}), 400

    try:
        # ── 1. Process leaf image ────────────────────────
        img_bytes  = leaf_file.read()
        img        = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img        = img.resize((IMG_SIZE, IMG_SIZE))
        img_array  = keras_image.img_to_array(img) / 255.0
        leaf_array = np.expand_dims(img_array, axis=0)   # (1, 224, 224, 3)

        # ── 2. Process stem answers ──────────────────────
        stem_values = [v.strip() for v in stem_data_str.split(",")]

        if len(stem_values) != NUM_STEM_FEATURES:
            return jsonify({
                'error': (
                    f'stem_data must have exactly {NUM_STEM_FEATURES} values '
                    f'(got {len(stem_values)}). '
                    f'Send one 0/1 answer per class in this order: {CLASS_LABELS}'
                )
            }), 400

        # Validate each value is 0 or 1
        stem_list = []
        for i, v in enumerate(stem_values):
            if v not in ('0', '1'):
                return jsonify({
                    'error': f'stem_data value at index {i} must be 0 or 1, got "{v}"'
                }), 400
            stem_list.append(float(v))

        stem_array = np.array(stem_list, dtype=np.float32).reshape(1, NUM_STEM_FEATURES)

        # ── 3. Run hybrid prediction ─────────────────────
        scores = model.predict(
            {"leaf_input": leaf_array, "stem_input": stem_array},
            verbose=0
        )[0]   # shape: (11,)

        # ── 4. Build result ──────────────────────────────
        predicted_index  = int(np.argmax(scores))
        predicted_class  = CLASS_LABELS[predicted_index]
        confidence       = float(scores[predicted_index])

        # Top 3 predictions for transparency
        top3_indices = scores.argsort()[-3:][::-1]
        top_3 = [
            {
                "disease"           : CLASS_LABELS[i],
                "confidence_percent": f"{scores[i] * 100:.2f}%",
                "raw_score"         : float(scores[i])
            }
            for i in top3_indices
        ]

        return jsonify({
            'prediction'        : predicted_class,
            'confidence_percent': f'{confidence * 100:.2f}%',
            'raw_confidence'    : confidence,
            'top_3'             : top_3
        })

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


# ─────────────────────────────────────────────────────────
# ROUTE 3: /health
#   Quick check — is the server and model ready?
# ─────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status'            : 'ok' if model is not None else 'model_not_loaded',
        'model_loaded'      : model is not None,
        'num_classes'       : len(CLASS_LABELS),
        'num_stem_features' : NUM_STEM_FEATURES,
        'classes'           : CLASS_LABELS
    })


# ─────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("🚀 Starting Flask API on http://0.0.0.0:5000")
    print(f"   Model path      : {MODEL_PATH}")
    print(f"   Classes         : {len(CLASS_LABELS)}")
    print(f"   Stem features   : {NUM_STEM_FEATURES}")
    app.run(host='0.0.0.0', port=5000, debug=False)