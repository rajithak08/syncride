const { spawn } = require("child_process");
const path = require("path");
const RTQI = require('../models/RTQI-Schema');
// const { longestCommonSubstring } = require("../utils/lcs");
const { distance } = require('fastest-levenshtein');
const {
    getPolylines,
    getTrafficFactor,
    getWeather
} = require('../Here-API/hereAPI');

async function runClustering(newData) {
  // const csvPath = path.resolve(__dirname, "../clustering-python/weights/Generated_Clustering_Dataset.csv");
  const csvPath = path.resolve(__dirname, "../clustering-python/weights/RTQI_Prediction_Model.pkl");
  const scriptPath = path.resolve(__dirname, "../clustering-python/score_calculate_randomforest.py");

  return new Promise((resolve, reject) => {
    const python = spawn("python", [scriptPath, csvPath, JSON.stringify(newData)]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (err) {
          reject(`Failed to parse Python output: ${err}`);
        }
      } else {
        reject(`Python exited with code ${code}. Error: ${errorOutput}`);
      }
    });
  });
}

const RTQI_Score = async (details) => {
  const {
    no_of_lanes,
    no_of_potholes,
    lane_width,
    traffic_congestion,
    lighting_condition,
    lane_marking
  } = details;

  const data = [no_of_lanes, no_of_potholes, lane_width, traffic_congestion, lighting_condition, lane_marking];

  try {
    const result = await runClustering(data);
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
};


// function fastMatchScore(polylineA, polylineB) {
//   if (!polylineA || !polylineB) return 0;

//   // Quick filter
//   if (polylineA.includes(polylineB.slice(0, 30))) return 1.0;

//   if (polylineB.includes(polylineA.slice(0, 30))) return 0.9;

//   // Partial match fallback
//   const overlap = longestCommonSubstring(polylineA, polylineB);
//   const normalized = overlap / Math.min(polylineA.length, polylineB.length);
//   return normalized;
// }

function fastMatchScore(polylineA, polylineB) {
  if (!polylineA || !polylineB) return 0;

  // Full polyline comparison, no length check
  const dist = distance(polylineA, polylineB);
  const maxLen = Math.max(polylineA.length, polylineB.length);

  const similarity = 1 - (dist / maxLen); // normalized score in [0,1]
  return similarity;
}

const RealTimeRTQI_Score = async (details) => {
  const {
    source,
    destination
  } = details;

  const [sourceLat, sourceLng] = source;
  const [destLat, destLng] = destination;
  // const polylinesSet = await getPolylines({
  //   source_lat: sourceLat,
  //   source_long: sourceLng,
  //   dest_lat: destLat,
  //   dest_long: destLng
  // });
  // console.log(`Polylines Set: ${polylinesSet}`);
  // if (!polylinesSet?.length) {
  //   throw new Error("Polyline data is invalid or empty");
  // }
  const delta = 0.2; // ~20km range
  const filteredRecords = await RTQI.find({
    'source.0': { $gte: sourceLat - delta, $lte: sourceLat + delta },
    'source.1': { $gte: sourceLng - delta, $lte: sourceLng + delta },
    'destination.0': { $gte: destLat - delta, $lte: destLat + delta },
    'destination.1': { $gte: destLng - delta, $lte: destLng + delta }
  });
  let bestRTQIInput = null;
  let predictedScore = null;
  let previous = false;
  for (const polyline of filteredRecords) {
    let bestRecord = null;
    let bestScore = 0;
        
    for (const record of filteredRecords) {
      const score = fastMatchScore(polyline.polyline, record.polyline);
      if (score > bestScore) {
        bestScore = score;
        bestRecord = record;
      }
    }
    if (bestScore < 0.3) {
      throw new Error("No matching route found");
    }
    
    if (!bestRecord) continue;
    let traffic = null;
    let weather = null;
    try {
      // traffic = await getTrafficFactor({ sourceLat, sourceLng, destLat, destLng });
      weather = await getWeather({ lat: destLat, long: destLng });
      traffic = { congestion_score: 2 };
    } catch (err) {
      console.error("❌ Error fetching traffic or weather:", err.message);
    }
    let data;
    if (traffic && weather) {
      data = {
        no_of_lanes: filteredRecords[0].data.Number_of_Lanes,
        no_of_potholes: filteredRecords[0].data.Potholes,
        lane_width: filteredRecords[0].data.Lane_width,
        traffic_congestion: traffic.congestion_score,
        lighting_condition: weather,
        lane_marking: filteredRecords[0].data.lane_marking
      };
      previous = false;
    } else {
      data = {
        no_of_lanes: bestRecord.data.Number_of_Lanes,
        no_of_potholes: bestRecord.data.Potholes,
        lane_width: bestRecord.data.Lane_width,
        traffic_congestion: bestRecord.data.Traffic_Congestion,
        lighting_condition: bestRecord.data.Lighting_Condition,
        lane_marking: bestRecord.data.lane_marking
      };
      previous = true;
    }
    bestRTQIInput = data;
    const result = await RTQI_Score(data);
    predictedScore = result.predicted_rtqi;
    console.log(`predictedScore: ${predictedScore}`);
    // break after first successful result (optional)
    break;
  }
  if (!bestRTQIInput || predictedScore === null) {
    throw new Error("No suitable record found or RTQI prediction failed");
  }
  return {
    success: true,
    message: "RTQI-v2 processed successfully",
    previous,
    coordinates: { source, destination },
    polylines_set: filteredRecords[0].polyline,
    num_polylines: 1,
    rtqi_set: {
      no_of_lanes: bestRTQIInput.no_of_lanes,
      potholes: bestRTQIInput.no_of_potholes,
      lane_width: bestRTQIInput.lane_width,
      traffic_congestion: bestRTQIInput.traffic_congestion,
      lighting_condition: bestRTQIInput.lighting_condition,
      lane_marking: bestRTQIInput.lane_marking
    },
    rtqi_score: predictedScore
  };
};

module.exports = {
  RTQI_Score,
  RealTimeRTQI_Score
};
