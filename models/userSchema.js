const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: Buffer, required: true }  // Use Buffer to match bcrypt hashes
});

module.exports = mongoose.model('User', userSchema);
