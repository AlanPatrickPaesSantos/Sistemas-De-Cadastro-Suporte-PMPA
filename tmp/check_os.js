const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../moderniza-ui-magico/backend/.env') });

const Servico = require(path.join(__dirname, '../moderniza-ui-magico/backend/models/Servico'));
const Missao = require(path.join(__dirname, '../moderniza-ui-magico/backend/models/Missao'));

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI not found in .env');
        process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const osNumber = 2363;

    const servico = await Servico.findOne({ Id_cod: osNumber });
    if (servico) {
      console.log('--- SERVICO FOUND ---');
      console.log(JSON.stringify(servico, null, 2));
    } else {
      console.log('Servico 2363 not found');
    }

    const missao = await Missao.findOne({ os: osNumber });
    if (missao) {
      console.log('--- MISSAO FOUND ---');
      console.log(JSON.stringify(missao, null, 2));
    } else {
      console.log('Missao 2363 not found');
    }

  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
