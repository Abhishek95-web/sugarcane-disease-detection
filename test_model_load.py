"""Quick test to see if model loads"""
import tensorflow as tf
from tensorflow.keras.models import load_model
import h5py

print(f"TensorFlow version: {tf.__version__}")

# Custom wrapper to ignore 'groups' parameter in DepthwiseConv2D
class DepthwiseConv2DCompat(tf.keras.layers.DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        # Remove 'groups' if present (not supported in newer TF versions)
        kwargs.pop('groups', None)
        super().__init__(*args, **kwargs)

print("Attempting to load model with custom object scope...")

try:
    with tf.keras.utils.custom_object_scope({'DepthwiseConv2D': DepthwiseConv2DCompat}):
        model = load_model('sugarcane_hybrid_final.h5', compile=False)
    print("✅ Model loaded successfully!")
    print(f"Model inputs: {[inp.name for inp in model.inputs]}")
    print(f"Model output shape: {model.output_shape}")
except Exception as e:
    print(f"❌ Error loading model: {type(e).__name__}")
    print(f"   Details: {e}")
