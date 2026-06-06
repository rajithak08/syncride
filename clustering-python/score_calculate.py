import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

def rtqi_Score(csv_path, new_data):

    # Load and clean data
    df = pd.read_csv(csv_path).dropna()

    # Append new data
    new_data_df = pd.DataFrame([new_data], columns=df.columns)
    df_combined = pd.concat([df, new_data_df], ignore_index=True)

    # Normalize the full dataset (including new data)
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(df_combined)
    
    # Invert negative features: [1] Potholes and [3] Traffic Congestion
    columns_to_negate = [1, 3]
    X_scaled[:, columns_to_negate] *= -1

    # Apply PCA to 1 component
    pca = PCA(n_components=1)
    pc1 = pca.fit_transform(X_scaled).flatten()  # 1D array

    # Use quantile-based binning for RTQI (1–10)
    df_combined["RTQI_PCA"] = pd.qcut(pc1, q=10, labels=range(1, 11)).astype(int)

    # Get RTQI score of the last (newly added) record
    predicted_rtqi = int(df_combined["RTQI_PCA"].iloc[-1])

    return {
        "predicted_rtqi": predicted_rtqi,
        "rtqi_distribution": df_combined["RTQI_PCA"].value_counts().sort_index().to_dict()
    }


if __name__ == "__main__":
    import sys
    import json

    # Receive command-line arguments
    csv = sys.argv[1]
    data = json.loads(sys.argv[2])  # new_data must be passed as JSON string

    result = rtqi_Score(csv, data)

    # Print result as JSON
    print(json.dumps(result, default=str))  # default=str to avoid issues with numpy types
    
    
    # csv = 'Generated_Clustering_Dataset.csv'
    # data = [2, 4, 3.5, 7, 4, 1]

    # result = rtqi_Score(csv, data)
    # print(result)