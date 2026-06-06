import joblib
import numpy as np

def rtqi_Score(model_path, new_data):
    
    # Load regression model
    model = joblib.load(model_path)

    # Ensure input is a 2D array for sklearn
    input_data = np.array([new_data])
    predicted_score = model.predict(input_data)

    # Clamp score between 1–10
    final_score = min(round(predicted_score[0]), 10)

    return {
        "predicted_rtqi": final_score
    }

if __name__ == "__main__":
    import sys
    import json

    # Receive command-line arguments
    csv = sys.argv[1]
    data = json.loads(sys.argv[2])  # new_data must be passed as JSON string

    result = rtqi_Score(csv, data)

    # Print result as JSON
    print(json.dumps(result, default=str))

    # Example:
    # python score_predict_regression.py "Generated_Clustering_Dataset.csv" "[2, 4, 3.5, 7, 4, 1]"
