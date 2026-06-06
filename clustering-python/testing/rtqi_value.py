from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA
import pandas as pd

df = pd.read_csv("../Generated_Clustering_Dataset.csv")
X = df.iloc[:, :6]

# Normalize the data
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

columns_to_negate = [1, 3]
X_scaled[:, columns_to_negate] *= -1

# Apply PCA
pca = PCA(n_components=1)
pc1 = pca.fit_transform(X_scaled).flatten()  # Flatten to 1D array

# Use quantile-based binning to ensure 10 levels
df["RTQI_PCA"] = pd.qcut(pc1, q=10, labels=range(1, 11)).astype(int)

# Save to CSV
df.to_csv("PCA_RTQI_Scored.csv", index=False)
