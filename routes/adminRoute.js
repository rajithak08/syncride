const express = require('express');
const router = express.Router();
const { retrieveRTQIData } = require('../services/adminService');

router.get('/export', async (req, res) => {
  const result = await retrieveRTQIData();
  return res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;