const mongoose = require('mongoose');
require('dotenv').config();

const UnidadeSchema = new mongoose.Schema({
  UNIDADE: { type: String, unique: true, index: true }
}, { collection: 'unidades' });

const Unidade = mongoose.model('Unidade', UnidadeSchema);

async function addCCC() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const exists = await Unidade.findOne({ UNIDADE: 'CCC' });
    if (exists) {
      console.log('⚠️ A unidade CC já existe no sistema.');
    } else {
      await Unidade.create({ UNIDADE: 'CCC' });
      console.log('✅ Unidade CCC adicionada com sucesso!');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

addCCC();
