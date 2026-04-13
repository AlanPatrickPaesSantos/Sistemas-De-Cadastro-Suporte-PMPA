const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const servicos = db.collection('servicos');
    const missoes = db.collection('missoes');

    const s = await servicos.findOne({Id_cod: 2341});
    if (s) {
      console.log('--- EQUIPAMENTO ---');
      console.log(JSON.stringify(s, null, 2));
    }

    const m = await missoes.findOne({os: 2341});
    if (m) {
      console.log('--- MISSAO ---');
      console.log(JSON.stringify(m, null, 2));
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
