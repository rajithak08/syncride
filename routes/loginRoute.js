const express = require('express');
const router = express.Router();
const {
    login,
    register,
    logout
} = require('../services/loginService');


router.post('/signup', async (req, res) => {
  const result = await register(req.body);
  return res.status(result.success ? 200 : 400).json(result);
});

router.post('/login', async (req, res) => {
  const result = await login(req.body);
  if (result.success) {
    req.session.username = result.username;
    req.session.email = result.email;
  }
  return res.status(result.success ? 200 : 400).json(result);
});


router.post('/logout', async (req, res) => {
  const result = await logout(req);
  res.clearCookie('connect.sid', { path: '/' });
  return res.status(result.success ? 200 : 400).json(result);
});

module.exports = router;
