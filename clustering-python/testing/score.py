'''     Kmeans and PCA     '''
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import pandas as pd

# Load your data
df = pd.read_csv("weights/Generated_Clustering_Dataset.csv")
X = df.iloc[:, :6]

# Normalize features
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Apply PCA
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)

# Apply KMeans on PCA output
kmeans = KMeans(n_clusters=10, random_state=42)
labels = kmeans.fit_predict(X_pca)

# Calculate silhouette score
score = silhouette_score(X_pca, labels)
print(f"KMeans + PCA Silhouette Score: {score:.4f}")


'''     Hierarchial and PCA     '''
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics import silhouette_score

# Load your dataset
df = pd.read_csv("weights/Generated_Clustering_Dataset.csv")
X = df.iloc[:, :6]  # Use the first 6 features

# Normalize
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Apply PCA
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)

# Apply Hierarchical Clustering
hc = AgglomerativeClustering(n_clusters=10)
labels = hc.fit_predict(X_pca)

# Calculate Silhouette Score
score = silhouette_score(X_pca, labels)
print(f"Hierarchical Clustering + PCA Silhouette Score: {score:.4f}")


'''     GMM and PCA     '''
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score

# Load your dataset
df = pd.read_csv("weights/Generated_Clustering_Dataset.csv")
X = df.iloc[:, :6]  # Use the first 6 features

# Normalize
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Apply PCA
pca = PCA(n_components=0.95)
X_pca = pca.fit_transform(X_scaled)

# Apply Gaussian Mixture Model
gmm = GaussianMixture(n_components=10, random_state=42)
gmm_labels = gmm.fit_predict(X_pca)

# Calculate Silhouette Score
score = silhouette_score(X_pca, gmm_labels)
print(f"GMM + PCA Silhouette Score: {score:.4f}")


from sklearn.cluster import SpectralClustering

spectral = SpectralClustering(n_clusters=10, affinity='nearest_neighbors', random_state=42)
spectral_labels = spectral.fit_predict(X_pca)

spectral_score = silhouette_score(X_pca, spectral_labels)
print(f"Spectral Clustering + PCA Silhouette Score: {spectral_score:.4f}")


from sklearn.cluster import OPTICS

optics = OPTICS(min_samples=5)
optics_labels = optics.fit_predict(X_pca)

if len(set(optics_labels)) > 1 and -1 in optics_labels:
    mask = optics_labels != -1
    optics_score = silhouette_score(X_pca[mask], optics_labels[mask])
else:
    optics_score = silhouette_score(X_pca, optics_labels)

print(f"OPTICS + PCA Silhouette Score: {optics_score}")


from sklearn.cluster import DBSCAN

# Apply DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=5)
dbscan_labels = dbscan.fit_predict(X_pca)

# Filter out noise (-1) if present
if len(set(dbscan_labels)) > 1 and -1 in dbscan_labels:
    mask = dbscan_labels != -1
    dbscan_score = silhouette_score(X_pca[mask], dbscan_labels[mask])
else:
    dbscan_score = "Too few clusters"

print(f"DBSCAN + PCA Silhouette Score: {dbscan_score}")


from sklearn.metrics import silhouette_score
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
import pandas as pd

# Load your data
df = pd.read_csv("weights/Generated_Clustering_Dataset.csv")
X = df.iloc[:, :6]

# Normalize
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# PCA
pca = PCA(n_components=1)
pc1 = pca.fit_transform(X_scaled).flatten()

# Binning into 10 RTQI levels
df["RTQI_PCA"] = pd.qcut(pc1, q=10, labels=range(1, 11)).astype(int)

# Calculate silhouette score using RTQI_PCA as cluster labels
score = silhouette_score(X_scaled, df["RTQI_PCA"])
print("Silhouette Score:", round(score, 4))
