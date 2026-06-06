import joblib
import numpy as np

# Load the regression model from .pkl file
model = joblib.load("../weights/rtqi-linear-regression.pkl")  # Replace with your .pkl filename

# Input features
input_features = np.array([[2, 4, 3.5, 7, 4, 1]])  # 2D array required for sklearn models

# Predict the score
predicted_score = model.predict(input_features)

print("Predicted Score:", min(round(predicted_score[0]), 10))
