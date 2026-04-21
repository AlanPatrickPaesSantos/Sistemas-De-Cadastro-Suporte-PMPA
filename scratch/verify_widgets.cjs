const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const ServicoSchema = new mongoose.Schema({
  Data_Ent: Date,
  Serviço: String
}, { collection: 'servicos' });

const Servico = mongoose.model('VerifyServico', ServicoSchema);

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const yearStart = new Date('2026-01-01T00:00:00.000Z');

  const counts = await Promise.all([
    Servico.countDocuments({ Serviço: /^\s*PENDENTE\s*$/i, Data_Ent: { $gte: yearStart } }),
    Servico.countDocuments({ Serviço: /^\s*PRONTO\s*$/i, Data_Ent: { $gte: yearStart } }),
    Servico.countDocuments({ Serviço: /^\s*PENDENTE\s*$/i }),
    Servico.countDocuments({ Serviço: /^\s*PRONTO\s*$/i })
  ]);

  console.log('--- VERIFICAÇÃO 2026 ---');
  console.log('Pendentes 2026:', counts[0]);
  console.log('Prontos 2026:', counts[1]);
  console.log('Pendentes Total:', counts[2]);
  console.log('Prontos Total:', counts[3]);

  process.exit();
}

verify();
