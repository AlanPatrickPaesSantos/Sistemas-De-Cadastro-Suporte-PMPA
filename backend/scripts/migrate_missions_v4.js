const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrateMissions() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI não configurada.');

    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const Missao = db.collection('missoes');

    console.log('🔄 Migrando categorias de missões...');
    const all = await Missao.find({}).toArray();
    console.log(`📄 Analisando ${all.length} registros...`);
    
    let updated = 0;

    for (const doc of all) {
      try {
        let up = {};
        let changed = false;

        const currentServico = String(doc.servico || '').trim().toUpperCase();
        const currentCategoria = String(doc.categoria || '').trim();

        // Regra 1: Se servico for o tipo (INTERNO/EXTERNO)
        const types = ['INTERNO', 'EXTERNO', 'REMOTO'];
        if (types.includes(currentServico)) {
          up.categoria = currentServico.toLowerCase();
          up.servico = "PRONTO";
          changed = true;
        } else if (currentServico === "PENDENTE") {
          up.servico = "PENDENTE";
          if (!currentCategoria) up.categoria = "interno";
          changed = true;
        } else if (!currentServico && !currentCategoria) {
            // Default para vazios
            up.servico = "PRONTO";
            up.categoria = "interno";
            changed = true;
        }

        if (changed) {
          await Missao.updateOne({ _id: doc._id }, { $set: up });
          updated++;
          if (updated % 100 === 0) console.log(`  Progresso: ${updated} atualizados...`);
        }
      } catch (innerErr) {
        console.error(`⚠️ Erro na OS ${doc.os}:`, innerErr.message);
      }
    }

    console.log(`✅ Migração concluída: ${updated} missões atualizadas.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro crítico:', err.message);
    process.exit(1);
  }
}

migrateMissions();
