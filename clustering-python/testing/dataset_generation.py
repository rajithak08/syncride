import pandas as pd
import random

# === Helper Functions ===

def get_lane_width(lanes):
    if lanes == 0:
        return 0
    elif lanes == 1:
        return 3.75
    else:
        return 3.5

def get_lane_marking(lanes):
    return 1 if lanes > 0 else 0

# === Generate Dataset ===

data = []
for _ in range(308):  # You can increase this for larger datasets
    is_positive = random.random() > 0.5  # 50% chance

    if is_positive:
        # Positive scoring sample
        lanes = random.choice([1, 2, 3])
        potholes = random.randint(0, 4)
        traffic = random.randint(0, 4)
        light = random.randint(4, 10)
    else:
        # Negative scoring sample
        lanes = random.choice([0, 1])  # fewer or narrow lanes
        potholes = random.randint(6, 10)
        traffic = random.randint(6, 10)
        light = random.randint(1, 4)

    lane_width = get_lane_width(lanes)
    lane_marking = get_lane_marking(lanes)

    data.append([lanes, potholes, lane_width, traffic, light, lane_marking])

df = pd.DataFrame(data, columns=[
    "Number of Lanes", "Number of Potholes", "Lane Width (m)",
    "Traffic Congestion", "Lighting Condition", "Lane Marking"
])

# Add max and min ideal examples for clustering range reference
df = pd.concat([
    df,
    pd.DataFrame([[3, 0, 3.5, 0, 10, 1]], columns=df.columns),  # Max (ideal)
    pd.DataFrame([[0, 10, 0, 10, 1, 0]], columns=df.columns)   # Min (worst)
], ignore_index=True)

# Save to CSV
df.to_csv("Generated_Clustering_Dataset.csv", index=False)
print("✅ Dataset saved as 'Generated_Clustering_Dataset.csv'")
