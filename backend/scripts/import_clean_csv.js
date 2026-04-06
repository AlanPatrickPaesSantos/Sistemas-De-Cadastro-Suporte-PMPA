const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse, isValid } = require('date-fns');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function importEquipment() {
    return new Promise((resolve) => {
        const results = [];
        fs.createReadStream(path.join(__dirname, '../data/Btl_Principal_v3.csv'), { encoding: 'utf8' })
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`\n--- Importando ${results.length} Equipamentos... ---`);
                let success = 0;
                let failed = 0;
                
                for (let row of results) {
                    try {
                        const id = parseInt(row['ID']);
                        if (isNaN(id)) continue;

                        const dataSaidaRaw = (row['Data Saida'] || "").trim();
                        const update = {
                            Defeito_Recl: (row['Defeito'] || "").trim(),
                            Analise_Tecnica: (row['Analise'] || "").trim(),
                            saidaEquip: dataSaidaRaw
                        };
                        
                        // Tenta converter Data de Saída para o objeto Date do MongoDB
                        if (dataSaidaRaw) {
                            // Tenta formato DD/MM/YYYY
                            let parsedDate = parse(dataSaidaRaw, 'd/M/yyyy', new Date());
                            if (!isValid(parsedDate)) {
                                // Tenta formato DD/MM/YY
                                parsedDate = parse(dataSaidaRaw, 'd/M/yy', new Date());
                            }

                            if (isValid(parsedDate)) {
                                update.Data_Saida = parsedDate;
                            }
                        }
                        
                        await Servico.updateOne({ Id_cod: id }, { $set: update });
                        success++;
                    } catch (err) {
                        console.error(`Erro no registro ID ${row['ID']}:`, err.message);
                        failed++;
                    }
                }
                console.log(`Sucesso: ${success}, Falhas: ${failed}`);
                resolve();
            });
    });
}

async function importMissions() {
    return new Promise((resolve) => {
        const results = [];
        fs.createReadStream(path.join(__dirname, '../data/Btl_Missions_v3.csv'), { encoding: 'utf8' })
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`\n--- Importando ${results.length} Missões... ---`);
                let success = 0;
                for (let row of results) {
                    try {
                        const os = parseInt(row['OS']);
                        if (isNaN(os)) continue;

                        const update = {
                            def_recla: (row['Defeito'] || "").trim(),
                            analise: (row['Analise'] || "").trim(),
                            solucao: (row['Solucao'] || "").trim(),
                            horario: (row['Horario'] || "").trim(),
                            relatorio: (row['Relatorio'] || "").trim()
                        };
                        await Missao.updateOne({ os: os }, { $set: update });
                        success++;
                    } catch (err) {
                        console.error(`Erro na Missão OS ${row['OS']}:`, err.message);
                    }
                }
                console.log(`Sucesso: ${success} missões.`);
                resolve();
            });
    });
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB para importação via CSV...');

        await importEquipment();
        await importMissions();

        mongoose.connection.close();
        console.log('\n>>> REPARO DE DADOS CONCLUÍDO! <<<');
    } catch (err) {
        console.error('Erro na conexão:', err.message);
    }
}

main();
