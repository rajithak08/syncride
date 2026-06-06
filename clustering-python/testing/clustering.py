import pandas as pd
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import MinMaxScaler

def hierarchical_clustering_with_rtqi(csv_path, new_data):
    """
    Perform hierarchical clustering and RTQI prediction.

    Parameters:
    - csv_path (str): Path to the dataset CSV file.
    - new_data (list): Input data for RTQI prediction.

    Returns:
    - dict: A dictionary containing clustering results and predicted RTQI for the new data.
    """
    # Load and preprocess the dataset
    df = pd.read_csv(csv_path).dropna()

    if df.shape[0] < 2:
        raise ValueError("Dataset must have at least 2 rows for clustering.")

    scaler = MinMaxScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df), columns=df.columns)

    # Adjust specific columns to negative values as per requirement
    columns_to_negate = [1, 3]
    df_scaled.iloc[:, columns_to_negate] *= -1
    df

    # Perform hierarchical clustering
    hierarchical = AgglomerativeClustering(n_clusters=10)
    hierarchical_labels = hierarchical.fit_predict(df_scaled)
    df_scaled['Cluster'] = hierarchical_labels

    # Optional: Compute silhouette score (useful for debugging)
    silhouette = silhouette_score(df_scaled.iloc[:, :-1], hierarchical_labels)

    # Define RTQI mapping
    rtqi_mapping = {0: 9, 1: 6, 2: 10, 3: 5, 4: 4, 5: 2, 6: 1, 7: 8, 8: 7, 9: 3}
    df_scaled['RTQI'] = df_scaled['Cluster'].map(rtqi_mapping)

    # Predict RTQI for new data
    new_data_scaled = scaler.transform([new_data])
    new_data_scaled[0, columns_to_negate] *= -1

    # Convert to NumPy and combine
    X_existing = df_scaled.iloc[:, :-2].to_numpy()
    all_data = np.vstack([X_existing, new_data_scaled])

    # Final check for NaNs before clustering
    if np.isnan(all_data).any():
        raise ValueError("❌ NaN detected in input data before clustering!")

    predicted_cluster = hierarchical.fit_predict(all_data)[-1]
    predicted_rtqi = rtqi_mapping.get(predicted_cluster, "Unknown Cluster")

    return {
        "predicted_cluster": int(predicted_cluster),
        "predicted_rtqi": predicted_rtqi
    }



if __name__ == "__main__":
    import sys
    import json

    # Receive command-line arguments
    csv = sys.argv[1]
    data = json.loads(sys.argv[2])  # new_data must be passed as JSON string

    result = hierarchical_clustering_with_rtqi(csv, data)

    # Print result as JSON
    print(json.dumps(result, default=str))  # default=str to avoid issues with DataFrame or numpy types
