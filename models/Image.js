const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  next: { type: mongoose.Schema.ObjectId, ref: "Image" },
  prev: { type: mongoose.Schema.ObjectId, ref: "Image" },
});

module.exports = mongoose.model("Image", imageSchema);
