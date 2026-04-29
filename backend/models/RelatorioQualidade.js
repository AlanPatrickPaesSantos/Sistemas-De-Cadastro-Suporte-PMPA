const mongoose = require('mongoose');

const relatorioQualidadeSchema = new mongoose.Schema({
  unidade: {
    type: String,
    required: true
  },
  oficialResponsavel: {
    type: String,
    required: true
  },
  mesReferencia: {
    type: String, // ex: "2026-04"
    required: true
  },
  statusGeral: {
    type: String,
    enum: ['Excelente', 'Boa', 'Com falhas', 'Critica'],
    required: true
  },
  maiorNecessidade: {
    type: String,
    enum: ['Radios HT', 'Radios Moveis', 'Baterias', 'Repetidoras', 'Manutencao', 'Computadores', 'Nenhuma'],
    required: true
  },
  // Detalhes logísticos
  equipamentos: {
    radiosHT: { operantes: { type: Number, default: 0 }, inoperantes: { type: Number, default: 0 } },
    radiosMoveis: { operantes: { type: Number, default: 0 }, inoperantes: { type: Number, default: 0 } },
    computadores: { operantes: { type: Number, default: 0 }, inoperantes: { type: Number, default: 0 } },
    baterias: { operantes: { type: Number, default: 0 }, inoperantes: { type: Number, default: 0 } }
  },
  relatorioLivre: {
    type: String,
    default: ''
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  }
});

// Garantir que cada unidade só envie 1 relatório por mês
relatorioQualidadeSchema.index({ unidade: 1, mesReferencia: 1 }, { unique: true });

module.exports = mongoose.model('RelatorioQualidade', relatorioQualidadeSchema);
