const mongoose = require('mongoose');
require('dotenv').config();
const Servico = require('./models/Servico');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const overlap = await Servico.countDocuments({
    Data_Ent: { $gte: yearStart },
    Serviço: { $regex: /^\s*PENDENTE\s*$/i },
    Laudo_Tecnico: { $ne: "", $exists: true }
  });

  console.log(`Equipamentos marcados como PENDENTE que já possuem Laudo Técnico preenchido: ${overlap}`);
  process.exit(0);
}

check();
