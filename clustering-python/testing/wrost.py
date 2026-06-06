import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler

# Load data
df = pd.read_csv("PCA_RTQI_Scored.csv")
X = df.iloc[:, :6].values
y_true = df["RTQI_PCA"].values

# Scale
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Train model
model = LinearRegression()
model.fit(X_scaled, y_true)

# Predict
y_pred = model.predict(X_scaled)
residuals = y_true - y_pred

# Define threshold for error
threshold = np.std(residuals) * 1.5
fail_indices = np.where(np.abs(residuals) > threshold)[0]

# Extract failed cases
df_failed = df.iloc[fail_indices].copy()
df_failed["Predicted_RTQI"] = y_pred[fail_indices]
df_failed["Residual"] = residuals[fail_indices]

# Sort by absolute error and show
print(df_failed.sort_values(by="Residual", key=np.abs, ascending=False).head(50))
