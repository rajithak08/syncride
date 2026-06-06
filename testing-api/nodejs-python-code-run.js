const { spawn } = require("child_process");

const csvPath = "../clustering-python/weights/Clustering_dataset.csv";
const newData = [2, 4, 3, 8, 2, 1];

// Spawn Python process
const python = spawn("python", ['../clustering-python/clustering.py', csvPath, JSON.stringify(newData)]);

let output = "";

python.stdout.on("data", (data) => {
  output += data.toString();
});

python.stderr.on("data", (data) => {
  console.error(`Python error: ${data}`);
});

python.on("close", (code) => {
  if (code === 0) {
    try {
      const result = JSON.parse(output);
      console.log("✅ Python Result:", result);
    } catch (e) {
      console.error("❌ Failed to parse Python output:", e);
    }
  } else {
    console.error(`Python process exited with code ${code}`);
  }
});
