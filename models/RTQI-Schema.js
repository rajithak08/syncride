const mongoose = require('mongoose');

const rtqiSchema = new mongoose.Schema({
  source:       { type: [Number], required: true },  // [lat, lng]
  destination:  { type: [Number], required: true },  // [lat, lng]
  polyline:     { type: String, required: true },
  email:        { type: String },
  data: {
    Number_of_Lanes:      { type: Number },
    Potholes:             { type: Number },
    Lane_width:           { type: Number },
    Traffic_Congestion:   { type: Number },
    Lighting_Condition:   { type: Number },
    lane_marking:         { type: Number }
  },
  RTQI:         { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('RTQI', rtqiSchema);
