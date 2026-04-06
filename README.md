# 🌿 AgroScan Lab — Sugarcane Disease Detection

![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=flat-square)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square)
![Accuracy](https://img.shields.io/badge/Accuracy-92.3%25-brightgreen?style=flat-square)
![Classes](https://img.shields.io/badge/Disease%20Classes-11-yellow?style=flat-square)
![License](https://img.shields.io/badge/License-Academic-lightgrey?style=flat-square)

> A hybrid AI system that diagnoses sugarcane plant diseases using leaf image analysis (CNN) combined with stem symptom questionnaire inputs.

---

## 📌 Overview

AgroScan Lab is a **TY Sem 1 Mini Project** built to help farmers and agronomists detect sugarcane diseases early and accurately. Instead of relying on a single image-based model, it uses a **hybrid approach** — combining deep learning on leaf images with structured stem symptom inputs — to deliver a more reliable diagnosis.

The system detects **11 disease classes** with a validation accuracy of **92.3%**.

---

## 🧠 How It Works

```
Farmer uploads leaf image
        ↓
CNN (MobileNetV2) analyses the leaf
        ↓
Farmer answers 5 stem symptom questions
        ↓
Frontend maps 5 answers → 11 model inputs
        ↓
Hybrid model combines both signals
        ↓
Final diagnosis + confidence + treatment advice
```

### Why Hybrid?
A pure image model can misclassify diseases that look visually similar on leaves (e.g. Yellow Leaf vs Banded Chlorosis). Adding stem symptom data gives the model a second signal, significantly reducing false positives.

---

## 🦠 Detectable Diseases

| # | Disease | Type |
|---|---------|------|
| 1 | Banded Chlorosis | Nutritional |
| 2 | Brown Spot | Fungal |
| 3 | Brown Rust | Fungal |
| 4 | Dried Leaves | Environmental |
| 5 | Grassy Shoot | Phytoplasma |
| 6 | Healthy Leaves | — |
| 7 | Pokkah Boeng | Fungal |
| 8 | Sett Rot | Fungal |
| 9 | Viral Disease | Viral |
| 10 | Yellow Leaf | Viral |
| 11 | Smut | Fungal |

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- Custom CSS (botanical dark theme)

**Backend**
- Python + Flask
- Flask-CORS

**ML Model**
- TensorFlow / Keras
- MobileNetV2 (transfer learning, fine-tuned from layer 90)
- Trained on 6,748 images across 11 classes
- Data augmentation: rotation, zoom, shear, horizontal flip

---

## 📁 Project Structure

```
sugarcane-disease-detection/
│
├── app.py                          # Flask API backend
├── sugarcane_app_ml_code.ipynb     # Model training notebook
│
├── src/
│   ├── pages/
│   │   ├── Landing.jsx / .css
│   │   ├── Upload.jsx  / .css
│   │   ├── Questions.jsx / .css
│   │   └── Results.jsx / .css
│   ├── App.jsx
│   └── index.js
│
├── public/
├── package.json
├── vite.config.js
└── .gitignore
```

---

## ⚙️ Setup & Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip

### 1. Clone the repo
```bash
git clone https://github.com/Abhishek95-web/sugarcane-disease-detection.git
cd sugarcane-disease-detection
```

### 2. Download the trained model

The `.h5` model file is too large for GitHub (>25MB).

👉 **[Download sugarcane_hybrid_final.h5 from Google Drive](https://drive.google.com/drive/folders/1Qi3BXUXE1RmL-onmngcVcYw6zpD3aMPU?usp=sharing)**

Place it in the project root:
```
sugarcane-disease-detection/
└── sugarcane_hybrid_final.h5   ← here
```

### 3. Start the Flask backend
```bash
pip install flask flask-cors tensorflow pillow
python app.py
```
Backend runs at `http://localhost:5000`

### 4. Start the React frontend
```bash
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check if server and model are ready |
| GET | `/questions` | Get the 5 stem symptom questions |
| POST | `/predict` | Submit leaf image + stem data, get diagnosis |

### `/predict` request format
```
Content-Type: multipart/form-data

leaf_image  : <image file>
stem_data   : "0,1,0,0,0,0,0,0,0,0,0"   ← 11 binary values
```

---

## 📊 Model Performance

| Metric | Value |
|--------|-------|
| Validation Accuracy | **92.3%** |
| Architecture | MobileNetV2 + Dense layers |
| Training Images | 6,748 |
| Disease Classes | 11 |
| Fine-tuned from layer | 90 |
| Optimizer | Adam (lr=5e-5) |
| Regularization | Dropout 0.6 |

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| Abhishek Nilkanth | ML Model + Flask Backend + Frontend |
| Akshad Kurundwade | Dataset Collection + Testing |
| Prasad Gawali | Dataset Collection + Documentation |
| Satyam Patil | Model Evaluation + Testing |

**Institution:** Kolhapur Institute of Technology
**Course:** B.Tech AI/ML — TY Semester 1 Mini Project

---

## ⚠️ Disclaimer

This tool is intended to assist farmers and agronomists — not replace professional consultation. Always verify AI-assisted diagnoses with a qualified agronomist before taking treatment action.

---

## 📄 License

This project is for academic purposes. Feel free to fork and build on it.
