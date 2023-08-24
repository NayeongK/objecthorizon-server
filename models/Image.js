const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  dominantColor: {
    r: Number,
    g: Number,
    b: Number,
  },
});

module.exports = mongoose.model("Image", imageSchema);
