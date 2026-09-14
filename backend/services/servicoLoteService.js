const Servico = require('../models/Servico');

const normalize = value => String(value ?? '').trim().toLocaleLowerCase('pt-BR');
const required = ['dataEnt', 'unidade', 'tecnico', 'tEquipSuporte', 'analiseTecnica', 'rp', 'servico'];

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('O lote deve conter ao menos um equipamento.');
  const seenSerial = new Map();
  items.forEach((item, index) => {
    required.forEach(field => { if (!normalize(item[field])) throw new Error(`Equipamento ${index + 1}: campo obrigatório ausente (${field}).`); });
    if (String(item.analiseTecnica).length > 10000 || String(item.rp).length > 200 || String(item.nSerie).length > 200) throw new Error(`Equipamento ${index + 1}: campo excede o tamanho permitido.`);
    const serial = normalize(item.nSerie);
    if (serial && seenSerial.has(serial)) throw new Error(`Patrimônio repetido entre os equipamentos ${seenSerial.get(serial)} e ${index + 1}.`);
    if (serial) seenSerial.set(serial, index + 1);
  });
}

async function createBatch(items, user) {
  validateItems(items);
  const restricted = user && user.papel !== 'admin';
  const normalizedItems = items.map(item => ({ ...item, unidade: restricted ? user.unidadeVinculada : item.unidade }));
  const serials = normalizedItems.map(item => normalize(item.nSerie)).filter(Boolean);
  const conflictFilter = { $expr: { $or: [
    ...(serials.length ? [{ $in: [{ $toLower: { $trim: { input: { $ifNull: ['$Nº_Serie', ''] } } } }, serials] }] : []),
  ] } };
  const conflicts = await Servico.find(conflictFilter, 'Id_cod RP Nº_Serie').lean();
  if (conflicts.length) throw new Error(`RP ou patrimônio já cadastrado na O.S. ${conflicts[0].Id_cod}.`);
  const session = await Servico.startSession();
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const records = await session.withTransaction(async () => {
          const concurrentConflict = await Servico.findOne(conflictFilter, 'Id_cod RP Nº_Serie').session(session).lean();
          if (concurrentConflict) throw new Error(`RP ou patrimônio já cadastrado na O.S. ${concurrentConflict.Id_cod}.`);
          const last = await Servico.findOne({}, 'Id_cod').sort({ Id_cod: -1 }).session(session).lean();
          const first = (last?.Id_cod || 0) + 1;
          const docs = normalizedItems.map((item, offset) => ({ Id_cod: first + offset, Data_Ent: new Date(item.dataEnt), Tecnico: item.tecnico, Solicitante: item.solicitante || '', 'Nº_PAE': item.nPae || '', Defeito_Recl: item.defeitoRecl || '', Unidade: item.unidade, T_EquipSuporte: item.tEquipSuporte, Analise_Tecnica: item.analiseTecnica, RP: item.rp, 'Nº_Serie': item.nSerie || '', Serviço: item.servico === 'PRONTO' || item.servico === 'PENDENTE' ? item.servico : 'LAUDO', Seção_Ditel: 'SUPORTE' }));
          return Servico.insertMany(docs, { session, ordered: true });
        });
        return records.map(record => ({ os: record.Id_cod, rp: record.RP, nSerie: record['Nº_Serie'] }));
      } catch (error) { if (error?.code !== 11000 || attempt === 4) throw error; }
    }
  } finally { await session.endSession(); }
}

module.exports = { normalize, validateItems, createBatch };
