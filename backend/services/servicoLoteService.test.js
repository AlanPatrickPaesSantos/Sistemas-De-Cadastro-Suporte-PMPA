const test = require('node:test');
const assert = require('node:assert/strict');
const { normalize, validateItems } = require('./servicoLoteService');

const item = (overrides = {}) => ({ dataEnt: '2026-09-14', unidade: '15 BPM', tecnico: 'ALAN', tEquipSuporte: 'COMPUTADOR', analiseTecnica: 'ok', servico: 'LAUDO', rp: '123', nSerie: 'ABC', ...overrides });

test('normaliza espaços e caixa para comparação', () => assert.equal(normalize('  AbC  '), 'abc'));
test('aceita lote completo', () => assert.doesNotThrow(() => validateItems([item(), item({ rp: '124', nSerie: 'ABD' })])));
test('aceita patrimônio ausente no lote', () => assert.doesNotThrow(() => validateItems([item({ nSerie: '' })])));
test('bloqueia RP repetido', () => assert.throws(() => validateItems([item(), item({ nSerie: 'ABD' })]), /RP repetido/));
test('bloqueia patrimônio repetido', () => assert.throws(() => validateItems([item(), item({ rp: '124' })]), /Patrimônio repetido/));
test('bloqueia campos vazios', () => assert.throws(() => validateItems([item({ rp: '  ' })]), /campo obrigatório/));
