const mongoose = require('mongoose');

const EqSuporteSchema = new mongoose.Schema({
  ID_EQUIP: { type: Number, unique: true, index: true },
  EQUIPAMENTO: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'eqsuportes'
});

module.exports = mongoose.model('EqSuporte', EqSuporteSchema);
