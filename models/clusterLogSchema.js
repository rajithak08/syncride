const mongoose = require('mongoose');

const clusterLogSchema = new mongoose.Schema({
  email:    { type: String },
  input:    { type: [Number] },  // [lanes, potholes, width, traffic, lighting, marking]
  result:   { type: Number },    // predicted_rtqi
  at:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClusterLog', clusterLogSchema);
