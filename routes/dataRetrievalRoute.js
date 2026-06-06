const express = require('express');
const router = express.Router();
const { retrieveData } = require('../services/dataRetrievalService');

router.post('/retrieve', async (req, res) => {
  const result = await retrieveData(req.body);
  return res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;