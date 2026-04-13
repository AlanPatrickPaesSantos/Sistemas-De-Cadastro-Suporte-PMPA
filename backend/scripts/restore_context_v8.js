const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const RANKS = ['TEN', 'SD', 'SGT', 'VC', 'ST', 'CB', 'MAJ', 'CAP', 'TC'];

async function restoreContextV8() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const servicos = db.collection('servicos');

    const backupPath = path.join(__dirname, 'backup_bad_records.json');
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Backup não encontrado em:', backupPath);
      process.exit(1);
    }
    const backupData = fs.readFileSync(backupPath, 'utf8');
    const backup = JSON.parse(backupData);

    console.log(`📦 Analisando ${backup.length} registros no backup...`);
    let totalUpdated = 0;
    let errors = 0;

    for (const bRecord of backup) {
      try {
        if (!bRecord.Id_cod) continue;
        
        const doc = await servicos.findOne({ Id_cod: bRecord.Id_cod });
        if (!doc) continue;

        let up = {};
        let changed = false;

        // 1. Restaurar Contexto de Status
        // Se o original era PRONTO/PENDENTE e o atual está vazio
        const origDef = String(bRecord.Defeito_Recl || '').trim();
        const currentDef = String(doc.Defeito_Recl || '').trim();
        
        if (currentDef === "" && origDef !== "") {
          if (['PRONTO', 'PENDENTE', 'LAUDO', 'MANUTENÇÃO'].includes(origDef.toUpperCase())) {
            up.Defeito_Recl = `[${origDef}]`;
            changed = true;
          } else if (origDef.length > 2) {
             up.Defeito_Recl = origDef;
             changed = true;
          }
        }

        // 2. Recuperar Nomes/Ranks (Caso OS 2341)
        const origAna = String(bRecord.Analise_Tecnica || '').trim();
        const currentAna = String(doc.Analise_Tecnica || '').trim();
        const currentTec = String(doc.Tecnico || '').trim();
        
        if (currentAna === "" && origAna !== "") {
           // Se for um posto/graduação (Ex: VC ILZE)
           if (RANKS.some(r => origAna.toUpperCase().startsWith(r))) {
              if (!currentTec.toUpperCase().includes(origAna.toUpperCase())) {
                 if (currentTec && currentTec.length > 2) {
                    up.Tecnico = `${currentTec} / ${origAna}`;
                 } else {
                    up.Tecnico = origAna;
                 }
                 changed = true;
              }
           } else if (origAna.length > 2 && !['PRONTO', 'PENDENTE', 'LAUDO'].includes(origAna.toUpperCase())) {
              up.Analise_Tecnica = origAna;
              changed = true;
           }
        }

        if (changed) {
          await servicos.updateOne({ _id: doc._id }, { $set: up });
          totalUpdated++;
          if (bRecord.Id_cod === 2341) console.log('✅ OS 2341 Restaurada!');
        }
      } catch (loopErr) {
        errors++;
        console.error(`⚠️ Erro na OS ${bRecord.Id_cod}:`, loopErr.message);
      }
    }

    console.log(`\n✅ Restauração V8 concluída!`);
    console.log(`- Atualizados: ${totalUpdated}`);
    console.log(`- Erros: ${errors}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro crítico:', err);
    process.exit(1);
  }
}

restoreContextV8();
