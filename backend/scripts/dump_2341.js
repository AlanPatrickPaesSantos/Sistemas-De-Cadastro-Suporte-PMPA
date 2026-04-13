const fs = require('fs');
const backup = JSON.parse(fs.readFileSync('backend/scripts/backup_bad_records.json'));
const s = backup.find(x => x.Id_cod === 2341);
if (s) {
  fs.writeFileSync('backend/scripts/diag_2341.txt', JSON.stringify(s, null, 2));
} else {
  fs.writeFileSync('backend/scripts/diag_2341.txt', 'OS 2341 not found in backup');
}
