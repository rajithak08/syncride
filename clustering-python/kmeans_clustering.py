def kmeans_clustering_with_rtqi(csv_path, new_data, use_pca=False):
    import pandas as pd
    import numpy as np
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.decomposition import PCA

    # Load and clean data
    df = pd.read_csv(csv_path).dropna()
    if df.shape[0] < 2:
        raise ValueError("Dataset must have at least 2 rows for clustering.")

    # Normalize
    scaler = MinMaxScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df), columns=df.columns)

    # Optional: Negate specific columns
    columns_to_negate = [1, 3]
    df_scaled.iloc[:, columns_to_negate] *= -1

    # Optional: PCA
    if use_pca:
        pca = PCA(n_components=0.95)
        X = pca.fit_transform(df_scaled)
    else:
        X = df_scaled.values

    # === FIXED: Use k=10 ===
    fixed_k = 10
    kmeans = KMeans(n_clusters=fixed_k, random_state=42)
    labels = kmeans.fit_predict(X)

    # Assign to DataFrame
    df_scaled["Cluster"] = labels

    # Compute silhouette score (optional info)
    silhouette = silhouette_score(X, labels)

    # === FIXED: Use your provided RTQI mapping ===
    rtqi_mapping = {0: 4, 1: 9, 2: 3, 3: 7, 4: 5, 5: 2, 6: 6, 7: 10, 8: 8, 9: 1}

    # Apply RTQI mapping
    df_scaled["RTQI"] = df_scaled["Cluster"].map(rtqi_mapping)

    # Transform new data
    new_data_df = pd.DataFrame([new_data], columns=df.columns)
    new_data_scaled = scaler.transform(new_data_df)
    new_data_scaled[0, columns_to_negate] *= -1
    if use_pca:
        new_data_scaled = pca.transform(new_data_scaled)

    # Predict cluster for new data
    predicted_cluster = kmeans.predict(new_data_scaled)[0]
    predicted_rtqi = rtqi_mapping.get(predicted_cluster, "Unknown Cluster")

    return {
        "predicted_cluster": int(predicted_cluster),
        "predicted_rtqi": predicted_rtqi,
        "silhouette_score": round(silhouette, 4),
        "best_k": fixed_k,
        "rtqi_mapping": rtqi_mapping
    }


if __name__ == "__main__":
    import sys
    import json

    # Receive command-line arguments
    csv = sys.argv[1]
    data = json.loads(sys.argv[2])  # new_data must be passed as JSON string

    result = kmeans_clustering_with_rtqi(csv, data)

    # Print result as JSON
    print(json.dumps(result, default=str))  # default=str to avoid issues with numpy types
