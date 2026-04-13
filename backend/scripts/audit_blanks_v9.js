const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function auditBlanks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const servicos = db.collection('servicos');

    const backupPath = path.join(__dirname, 'backup_bad_records.json');
    if (!fs.existsSync(backupPath)) {
       console.log('Backup not found');
       process.exit(1);
    }
    const backup = JSON.parse(fs.readFileSync(backupPath));

    const currentBlanks = await servicos.find({ Defeito_Recl: '', Analise_Tecnica: '' }).toArray();
    console.log(`Total de OS atualmente em branco no sistema: ${currentBlanks.length}`);

    let report = [];
    currentBlanks.forEach(doc => {
      const b = backup.find(x => x.Id_cod === doc.Id_cod);
      if (b) {
        report.push({
          id: doc.Id_cod,
          original_def: b.Defeito_Recl,
          original_ana: b.Analise_Tecnica,
          current_tecnico: doc.Tecnico
        });
      }
    });

    console.log('\n--- AMOSTRA DE DADOS ORIGINAIS NO BACKUP ---');
    report.slice(0, 15).forEach(r => {
      console.log(`OS ${r.id}:`);
      console.log(`  Original Defeito: [${r.original_def}]`);
      console.log(`  Original Análise: [${r.original_ana}]`);
      console.log(`  ---`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

auditBlanks();
