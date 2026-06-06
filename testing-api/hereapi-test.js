// testHereUtils.js

const {
  getPolylines,
  getTrafficFactor,
  getWeather
} = require('../Here-API/hereAPI'); // Replace with actual path

// Example coordinates: Bengaluru to Chennai
const sourceLat = 12.9716;
const sourceLng = 77.5946;
const destLat = 13.0827;
const destLng = 80.2707;

(async () => {
  console.log('📍 Testing getPolylines...');
  const polylines = await getPolylines({
    source_lat: sourceLat,
    source_long: sourceLng,
    dest_lat: destLat,
    dest_long: destLng
  });
  console.log('🚦 Number of Polylines received:', polylines.length);

  console.log('\n🌤️ Testing getWeather at destination...');
  const visibility = await getWeather({
    lat: destLat,
    long: destLng
  });
  console.log('🔭 Visibility (avg):', visibility);

  console.log('\n🛣️ Testing getTrafficFactor...');
  const trafficInfo = await getTrafficFactor({
    sourceLat,
    sourceLng,
    destLat,
    destLng
  });
  console.log('📊 Traffic Info:', trafficInfo);
})();
