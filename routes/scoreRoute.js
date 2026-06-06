const express = require("express");
const router = express.Router();
const { RTQI_Score, RealTimeRTQI_Score } = require("../services/scoreService");


router.post("/rtqi", async (req, res) => {
  try {
    const result = await RTQI_Score(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "RTQI calculation error" });
  }
});


router.post("/rtqi-v2", async (req, res) => {
  try {
    const { source, destination } = req.body;
    if (!Array.isArray(source) || !Array.isArray(destination) || source.length !== 2 || destination.length !== 2) {
      return res.status(400).json({ error: "Invalid source/destination format" });
    }
    const result = await RealTimeRTQI_Score({ source, destination });
    return res.status(200).json(result);
  } catch (err) {
    console.error("RTQI-v2 error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
