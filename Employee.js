const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  task: { type: String },
  deadline: { type: Date },
  status: { type: String, default: 'incomplete' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
