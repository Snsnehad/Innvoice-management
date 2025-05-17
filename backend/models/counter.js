const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  role: { type: String, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", counterSchema);
