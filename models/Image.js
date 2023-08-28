const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  rgbColor: {
    r: { type: Number, required: true },
    g: { type: Number, required: true },
    b: { type: Number, required: true },
  },
  colorGroup: { type: Number, required: true },
});

module.exports = mongoose.model("Image", imageSchema);
