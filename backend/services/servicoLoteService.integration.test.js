const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Servico = require('../models/Servico');
const { createBatch } = require('./servicoLoteService');

const uri = process.env.MONGODB_URI;
const describeIntegration = uri ? test : test.skip;
const databaseName = `cadastro_lote_integration_${process.pid}_${Date.now()}`;
const marker = `INTEGRATION-${process.pid}-${Date.now()}`;

const item = (suffix, overrides = {}) => ({
  dataEnt: '2026-09-13', unidade: 'DITEL', tecnico: 'Teste de integração',
  tEquipSuporte: 'Computador', analiseTecnica: marker, rp: `RP-${suffix}`,
  nSerie: `SERIAL-${suffix}`, servico: 'MANUTENCAO', ...overrides,
});

describeIntegration('cadastro em lote: integração MongoDB isolada', async (t) => {
  await mongoose.connect(uri, { dbName: databaseName });
  t.after(async () => {
    await Servico.deleteMany({ Analise_Tecnica: marker });
    await mongoose.disconnect();
  });

  await t.test('confirma todos os equipamentos em uma transação', async () => {
    const result = await createBatch([item('COMMIT-A'), item('COMMIT-B')], { papel: 'admin' });
    assert.equal(result.length, 2);
    const saved = await Servico.find({ Analise_Tecnica: marker }).sort({ RP: 1 }).lean();
    assert.equal(saved.length, 2);
    assert.notEqual(saved[0].Id_cod, saved[1].Id_cod);
  });

  await t.test('não deixa registros quando a inserção falha', async () => {
    const originalInsertMany = Servico.insertMany;
    Servico.insertMany = async () => { throw new Error('falha controlada para rollback'); };
    try {
      await assert.rejects(createBatch([item('ROLLBACK')], { papel: 'admin' }), /falha controlada/);
    } finally {
      Servico.insertMany = originalInsertMany;
    }
    assert.equal(await Servico.countDocuments({ Analise_Tecnica: marker, RP: 'RP-ROLLBACK' }), 0);
  });
});

