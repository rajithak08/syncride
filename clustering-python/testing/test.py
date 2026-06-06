# from clustering import hierarchical_clustering_with_rtqi

# print(f"{hierarchical_clustering_with_rtqi('weights/Generated_Clustering_dataset.csv', [1, 0, 3.75, 6, 8, 1])}")


# w = [0.15, 0.2, 0.15, 0.2, 0.15, 0.15]

# def score_sample(x, max_potholes=10, max_lighting=10):
#     score = 0
#     score += (x[0] / 3) * w[0]                                   # lanes
#     score += (1 - (x[1] / max_potholes)) * w[1]                  # potholes (negative)
#     score += (1 * w[2]) if x[2] in [3.5, 3.75] else 0            # lane width
#     score += (1 - (x[3] / 10)) * w[3]                            # traffic (negative)
#     score += ((x[4] - 1) / (max_lighting - 1)) * w[4]            # lighting (1-max)
#     score += x[5] * w[5]                                         # lane marking
#     return round(score * 10, 2)                                  # scale to 0–10

# # Example
# data = [0, 10, 0, 10, 1, 0]
# print(f"Score Calculated: {score_sample(data)}")



# from kmeans_clustering import kmeans_clustering_with_rtqi

# print(f"{kmeans_clustering_with_rtqi('weights/Generated_Clustering_dataset.csv', [1, 0, 3.75, 6, 8, 1])}")


import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Load dataset
df = pd.read_csv("weights/Generated_Clustering_dataset.csv").dropna()
X = df.iloc[:, :6].copy()

# Normalize features
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)
X_scaled[:, [1, 3]] *= -1  # Negate potholes and lighting

# Apply PCA
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)

# Apply KMeans
kmeans = KMeans(n_clusters=10, random_state=42)
labels = kmeans.fit_predict(X_pca)

# Silhouette Score
score = silhouette_score(X_pca, labels)
print("Silhouette Score with PCA (k=10):", round(score, 4))


from sklearn.cluster import AgglomerativeClustering, DBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score

# Agglomerative Clustering
agglo_model = AgglomerativeClustering(n_clusters=10)
agglo_labels = agglo_model.fit_predict(X_pca)
silhouette_agglo = silhouette_score(X_pca, agglo_labels)

# Gaussian Mixture Model
gmm_model = GaussianMixture(n_components=10, random_state=42)
gmm_labels = gmm_model.fit_predict(X_pca)
silhouette_gmm = silhouette_score(X_pca, gmm_labels)

# DBSCAN
dbscan_model = DBSCAN(eps=0.5, min_samples=5)
dbscan_labels = dbscan_model.fit_predict(X_pca)
silhouette_dbscan = silhouette_score(X_pca, dbscan_labels) if len(set(dbscan_labels)) > 1 else "Too few clusters"

# Print results
print(f"Agglomerative Clustering Silhouette: {silhouette_agglo:.4f}")
print(f"Gaussian Mixture Model Silhouette: {silhouette_gmm:.4f}")
print(f"DBSCAN Silhouette: {silhouette_dbscan}")
