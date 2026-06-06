const envKey = {
    PORT: process.env.PORT || 4000,
    MONGODB_ATLAS_URL: process.env.MONGODB_URL,
    HERE_API: process.env.HERE_API_KEY,
    OPENWEATHER_APIKEY: process.env.OPENWEATHER_APIKEY,
    PASSWORD_SECRET_KEY: process.env.SESSION_SECRET,
    DATABASE_NAME: process.env.DATABASE_NAME || 'RTQI'
};

module.exports = envKey;