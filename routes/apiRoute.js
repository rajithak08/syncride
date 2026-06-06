const express = require('express');
const router = express.Router();
const { 
    getPolylines,
    getTrafficFactor,
    getWeather
} = require('../Here-API/hereAPI');

router.post('/getPolylines', async (req, res) => {
    const result = await getPolylines(req.body);
    const success = (result && result.length > 0);
    res.status(success ? 200 : 400).json(result);
});

router.post('/getWeather', async (req, res) => {
    const result = await getWeather(req.body);
    const success = (result !== 0);
    res.status(success ? 200 : 400).json(result);
});

router.post('/getTraffic', async (req, res) => {
    const result = await getTrafficFactor(req.body);
    const success = (result !== null);
    res.status(success ? 200 : 400).json(result);
});

module.exports = router;
