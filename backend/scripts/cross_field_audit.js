const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function crossFieldAudit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('--- BUSCANDO REGISTROS COM DADOS DUPLICADOS/TROCADOS NOS CAMPOS ---');
    const sDocs = await db.collection('servicos').find({}).toArray();
    let count = 0;

    for (const doc of sDocs) {
      const def = String(doc.Defeito_Recl || '').trim().toUpperCase();
      const ana = String(doc.Analise_Tecnica || '').trim().toUpperCase();

      const rp = String(doc.RP || '').trim().toUpperCase();
      const sol = String(doc.Solicitante || '').trim().toUpperCase();
      const uni = String(doc.Unidade || '').trim().toUpperCase();
      const sec = String(doc.Seção_Ditel || '').trim().toUpperCase();

      let issues = [];

      // Verificar se o defeito é igual a outros campos (e não é vazio)
      if (def !== "" && def.length > 2) {
        if (def === rp) issues.push(`Defeito == RP [${rp}]`);
        if (def === sol) issues.push(`Defeito == Solicitante [${sol}]`);
        if (def === uni) issues.push(`Defeito == Unidade [${uni}]`);
        if (def === sec) issues.push(`Defeito == Seção [${sec}]`);
      }

      // Verificar se a análise técnico é igual a outros campos
      if (ana !== "" && ana.length > 2) {
        if (ana === rp) issues.push(`Analise == RP [${rp}]`);
        if (ana === uni) issues.push(`Analise == Unidade [${uni}]`);
      }

      if (issues.length > 0) {
        count++;
        if (count <= 15) {
          console.log(`OS ${doc.Id_cod}: ${issues.join(' | ')}`);
        }
      }
    }

    console.log(`\nTotal de registros com duplicidade/troca detectada: ${count}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

crossFieldAudit();
