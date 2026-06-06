import joblib
import numpy as np
import sys
import json

def rtqi_Score(model_path, new_data):
    """
    Predict RTQI class using a Random Forest Classifier.

    Args:
        model_path (str): Path to the saved .pkl model file.
        new_data (list): A list of 6 numerical input features.

    Returns:
        dict: Predicted RTQI class label.
    """
    # Load the classifier model
    model = joblib.load(model_path)

    # Convert input to 2D array
    input_data = np.array([new_data])

    # Predict class
    predicted_class = model.predict(input_data)[0]

    return {
        "predicted_rtqi": int(predicted_class)
    }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python score_predict_classifier.py <model_path> <json_data>"}))
        sys.exit(1)

    model_path = sys.argv[1]
    data_json = sys.argv[2]

    try:
        data = json.loads(data_json)
        if not isinstance(data, list) or len(data) != 6:
            raise ValueError("Input must be a list of 6 numerical features.")
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    result = rtqi_Score(model_path, data)
    print(json.dumps(result))
