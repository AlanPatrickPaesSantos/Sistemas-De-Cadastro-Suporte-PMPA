const mongoose = require('mongoose');
require('dotenv').config();
const Servico = require('./models/Servico');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const stats = await Servico.aggregate([
    { $match: { Data_Ent: { $gte: yearStart } } },
    { $group: { _id: "$Serviço", count: { $sum: 1 } } }
  ]);

  console.log("Status counts since the beginning of the year:");
  console.log(JSON.stringify(stats, null, 2));
  process.exit(0);
}

check();
