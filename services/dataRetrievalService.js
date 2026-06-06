const RTQI = require('../models/RTQI-Schema');
const { RTQI_Score } = require('./scoreService');
const {
    getPolylines,
    getTrafficFactor,
    getWeather
} = require('../Here-API/hereAPI');


const retrieveData = async (details) => {
    const {
        source,
        destination,
        email,
        Number_of_Lanes,
        Potholes,
        Lane_width,
        lane_marking
    } = details;

    const [sourceLat, sourceLng] = source;
    const [destLat, destLng] = destination;

    // ✅ Get polyline
    let polylinesSet = [];
    try {
        polylinesSet = await getPolylines({
            source_lat: sourceLat,
            source_long: sourceLng,
            dest_lat: destLat,
            dest_long: destLng
        });

        if (!polylinesSet || polylinesSet.length === 0) {
            return {
                success: false,
                message: "Failed to retrieve polyline: empty result"
            };
        }
    } catch (err) {
        console.error("❌ Error fetching polylines:", err.message);
        return { success: false, message: "Error while fetching polyline" };
    }

    // ✅ Get traffic and weather
    let traffic = { congestion_score: 0 };
    let weather = "Unknown";
    try {
        traffic = await getTrafficFactor({ sourceLat, sourceLng, destLat, destLng });
        weather = await getWeather({ lat: destLat, long: destLng });
    } catch (err) {
        console.error("❌ Error fetching traffic or weather:", err.message);
    }

    // ✅ Calculate RTQI score
    const retrieved_data = {
        no_of_lanes: Number_of_Lanes,
        no_of_potholes: Potholes,
        lane_width: Lane_width,
        traffic_congestion: traffic.congestion_score,
        lighting_condition: weather,
        lane_marking: lane_marking
    };

    const rtqi_result = await RTQI_Score(retrieved_data);
    const predictedScore = rtqi_result.predicted_rtqi;

    // 🔄 Update or Insert
    try {
        const result = await RTQI.findOneAndUpdate(
            { source: source, destination: destination },
            {
                $set: {
                    email: email,
                    polyline: polylinesSet[0],
                    data: {
                        Number_of_Lanes: Number_of_Lanes,
                        Potholes: Potholes,
                        Lane_width: Lane_width,
                        Traffic_Congestion: traffic.congestion_score,
                        Lighting_Condition: weather,
                        lane_marking: lane_marking
                    },
                    RTQI: predictedScore
                }
            },
            { new: true, upsert: true } // upsert = insert if not found
        );

        const action = result ? 'updated' : 'created';
        console.log(`✅ Data for this route has been ${action}`);
        return {
            success: true,
            message: `Data for this route has been ${action}`
        };
    } catch (err) {
        console.error("❌ Error saving/updating data:", err.message);
        return { success: false, message: "Failed to save or update data" };
    }
};


module.exports = {
    retrieveData
};