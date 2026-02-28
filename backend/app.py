from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import requests
import io
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables for model and data
model = None
label_encoder = None
feature_columns = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']

DATASET_URL = "https://drive.google.com/uc?export=download&id=10GwlXu0VdRvjtaK7x34qr6YrQTrMUDyS"

def download_and_train():
    global model, label_encoder
    try:
        # Check if already trained to avoid redundant hits
        if model is not None:
            return True
            
        print("Downloading dataset...")
        response = requests.get(DATASET_URL)
        if response.status_code != 200:
            print("Failed to download dataset")
            return False
        
        df = pd.read_csv(io.StringIO(response.text))
        
        # Preprocessing
        label_encoder = LabelEncoder()
        df['RiskLevel'] = label_encoder.fit_transform(df['RiskLevel'])
        
        # The user wants 0-150 range now, but model was trained on 15-50.
        # We will allow the input but warn or clip for model consistency if needed.
        # df['Age'] = df['Age'].clip(15, 50) 
        
        X = df[feature_columns]
        y = df['RiskLevel']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = xgb.XGBClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            objective='multi:softprob',
            num_class=len(label_encoder.classes_)
        )
        model.fit(X_train, y_train)
        
        print("Model trained and cached.")
        return True
    except Exception as e:
        print(f"Error in training: {e}")
        return False

# Trigger training on start
with app.app_context():
    download_and_train()

@app.route('/predict', methods=['POST'])
def predict():
    global model, label_encoder
    if model is None:
        download_and_train()
            
    data = request.json
    try:
        # Extract features
        age_input = float(data.get('Age'))
        # If age is in months (e.g. 0.1), it handles it
        
        features = [
            age_input,
            float(data.get('SystolicBP')),
            float(data.get('DiastolicBP')),
            float(data.get('BS')),
            float(data.get('BodyTemp')),
            float(data.get('HeartRate'))
        ]
        
        input_df = pd.DataFrame([features], columns=feature_columns)
        probs = model.predict_proba(input_df)[0]
        prediction_idx = np.argmax(probs)
        risk_level = label_encoder.inverse_transform([prediction_idx])[0]
        confidence = float(probs[prediction_idx]) * 100
        
        importance = model.feature_importances_
        feature_importance = dict(zip(feature_columns, [float(i) for i in importance]))
        
        return jsonify({
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "feature_importance": feature_importance,
            "top_feature": feature_columns[np.argmax(importance)],
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/train', methods=['GET'])
def train():
    if download_and_train():
        return jsonify({"message": "Model trained successfully"})
    else:
        return jsonify({"error": "Training failed"}), 500

if __name__ == '__main__':
    # Initial training
    # download_and_train()
    app.run(port=5000, debug=True)
