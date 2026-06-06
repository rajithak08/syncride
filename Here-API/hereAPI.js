/*  HERE API is Used for Getting the Below Values   */
const envKey = require('../config/environmentKeys');
const axios = require('axios');

const APIKEY = envKey.HERE_API;
const OPENWEATHER_APIKEY = envKey.OPENWEATHER_APIKEY;

const getPolylines = async (details) => {
    const {
        source_lat,   source_long,
        dest_lat,     dest_long,
        sourceLat,    sourceLng,
        destLat,      destLng
    } = details;

    const originLat  = source_lat  ?? sourceLat;
    const originLng  = source_long ?? sourceLng;
    const destLatVal = dest_lat    ?? destLat;
    const destLngVal = dest_long   ?? destLng;

    const polylinesArr = [];

    const params = {
      origin: `${originLat},${originLng}`,
      destination: `${destLatVal},${destLngVal}`,
      transportMode: 'car',
      lang: 'en-gb',
      return: 'polyline',
      alternatives: 3,
      apiKey: APIKEY,
    };

    try {
      const response = await axios.get('https://router.hereapi.com/v8/routes', { params });
      const routes = response.data.routes || [];

      const polyline = routes[0]?.sections[0]?.polyline;
      if (polyline) {
        polylinesArr.push(polyline);
      }
    } catch (error) {
      console.error('Error fetching polyline data:', error.message);
      return [];
    }

    return polylinesArr;
};


const getWeather = async (details) => {
    const {
        lat,
        long
    } = details;

    const params = {
      lat: lat,
      lon: long,
      appid: OPENWEATHER_APIKEY,
      units: "metric"
    };

    try {
      const response = await axios.get(
        'https://api.openweathermap.org/data/2.5/weather',
        { params }
      );

      // Visibility is returned in meters (0–10,000)
      const visibility = response.data.visibility;
      console.log("VISIBILITY FROM API:", visibility);

      // Return visibility in kilometers (rounded down)
      return visibility ? Math.floor(visibility / 1000) : 0;
    } catch (error) {
      console.error('Error fetching weather data:', error.message);
      return 0;
    }
};



const getTrafficFactor = async (details) => {
    const {
        sourceLat,
        sourceLng,
        destLat,
        destLng
    } = details;

    const routerUrl = 'https://router.hereapi.com/v8/routes';

    try {
      // 1. Get route summary
      const routeParams = {
        transportMode: 'car',
        origin: `${sourceLat},${sourceLng}`,
        destination: `${destLat},${destLng}`,
        return: 'summary',
        traffic: 'true',
        apiKey: APIKEY,
      };

      const routeResp = await axios.get(routerUrl, { params: routeParams });
      const section = routeResp.data.routes[0].sections[0];
      const { baseDuration, duration } = section.summary;

      const delay = duration - baseDuration;
      const congestionScore = baseDuration > 0 ? delay / baseDuration : 0;
      const congestionScore_0_10 = Math.min(Math.round(congestionScore * 10), 10);
      console.log("⏱️ Traffic Delay:", Math.floor(delay / 60), "min");
      console.log("📈 Congestion Score (0–10):", congestionScore_0_10);

      return {
        delay_minutes: delay / 60,
        congestion_score: congestionScore_0_10,
      };
    } catch (error) {
      console.error("❌ Error in getHereTrafficInfoWithJam:", error.message);
      return null;
    }
};


module.exports = {
    getPolylines,
    getTrafficFactor,
    getWeather
};