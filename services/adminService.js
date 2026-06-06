const RTQI = require('../models/RTQI-Schema');
const { RTQI_Score } = require('./scoreService');
const {
    getPolylines,
    getTrafficFactor,
    getWeather
} = require('../Here-API/hereAPI');

const retrieveRTQIData = async () => {
    try {
        const allDocs = await RTQI.find();
        const updatedDocs = [];

        for (const doc of allDocs) {
            const {
                source,
                destination,
                email,
                data: rawData = {}
            } = doc;

            const [sourceLat, sourceLng] = source;
            const [destLat, destLng] = destination;

            // ✅ Sanitize fields using Math.abs
            const Number_of_Lanes = Math.abs(Number(rawData.Number_of_Lanes || 0));
            const Potholes = Math.abs(Number(rawData.Potholes || 0));
            const Lane_width = Math.abs(Number(rawData.Lane_width || 0));
            const lane_marking = Math.abs(Number(rawData.lane_marking || 0));

            // ✅ Get or regenerate polyline
            let polylineStr = doc.polyline;
            if (!polylineStr) {
                try {
                    const polylineSet = await getPolylines({
                        source_lat: sourceLat,
                        source_long: sourceLng,
                        dest_lat: destLat,
                        dest_long: destLng
                    });

                    if (polylineSet.length > 0) {
                        polylineStr = polylineSet[0];
                    }
                } catch (err) {
                    console.error(`❌ Error fetching polyline for ${email}:`, err.message);
                    continue;
                }
            }

            // ✅ Get traffic and weather
            let trafficScore = 0;
            let lightingCondition = 0;
            try {
                const traffic = await getTrafficFactor({ sourceLat, sourceLng, destLat, destLng });
                trafficScore = Math.abs(Number(traffic.congestion_score || 0));

                const weather = await getWeather({ lat: destLat, long: destLng });
                lightingCondition = Math.abs(Number(weather || 0));
            } catch (err) {
                console.error(`❌ Error fetching traffic/weather for ${email}:`, err.message);
            }

            // ✅ Compute RTQI
            const rtqi_input = {
                no_of_lanes: Number_of_Lanes,
                no_of_potholes: Potholes,
                lane_width: Lane_width,
                traffic_congestion: trafficScore,
                lighting_condition: lightingCondition,
                lane_marking: lane_marking
            };

            let predictedScore = 0;
            try {
                const scoreResult = await RTQI_Score(rtqi_input);
                predictedScore = Math.abs(Number(scoreResult.predicted_rtqi || 0));
            } catch (err) {
                console.error(`❌ Error calculating RTQI for ${email}:`, err.message);
            }

            // ✅ Update document
            doc.polyline = polylineStr;
            doc.data = {
                Number_of_Lanes,
                Potholes,
                Lane_width,
                Traffic_Congestion: trafficScore,
                Lighting_Condition: lightingCondition,
                lane_marking
            };
            doc.RTQI = predictedScore;

            const updated = await doc.save();
            updatedDocs.push(updated);
        }

        console.log('✅ Done sending the RTQI Data.');

        return {
            success: true,
            count: updatedDocs.length,
            data: updatedDocs
        };

    } catch (err) {
        console.error("❌ Error in retrieveRTQIData:", err.message);
        return {
            success: false,
            message: 'Internal server error'
        };
    }
};

module.exports = {
    retrieveRTQIData
};
