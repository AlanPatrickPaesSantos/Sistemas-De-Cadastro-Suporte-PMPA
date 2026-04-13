const fs = require('fs');
const path = require('path');

// Fix path: the previous script used a nested 'backend' folder by mistake
const backupPath = path.join(__dirname, 'backup_bad_records.json'); 
console.log('Checking backup at:', backupPath);

if (fs.existsSync(backupPath)) {
  const backup = JSON.parse(fs.readFileSync(backupPath));
  const s = backup.servicos.find(r => r.Id_cod === 2341);
  if (s) {
    console.log('--- BACKUP EQUIP ---');
    console.log('OS:', s.Id_cod);
    console.log('Original Defeito:', s.Defeito_Recl);
    console.log('Original Analise:', s.Analise_Tecnica);
    console.log('Original Serviço:', s.Serviço);
  } else {
    console.log('OS 2341 not found in backup services.');
  }
} else {
  console.log('Backup file not found.');
}
