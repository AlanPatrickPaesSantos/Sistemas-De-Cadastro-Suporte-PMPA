const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const EqSuporte = require('../models/EqSuporte');

const EQUIPAMENTOS = [
  "Nobreak Intelbras",
  "DESKTOP HP VERTICAL",
  "DESKTOP TORRE",
  "MINI PC DELL",
  "MINI PC CONNEC",
  "PC MINI ETECNET",
  "IMPRESSORA HP",
  "IMPRESSORA LEXMARK",
  "NOBREAK SMS",
  "NOTEBOOK PROOBOK 440",
  "NOTEBOOK ACER",
  "NOBREAK COLETEK",
  "NOTEBOOK DATEN",
  "DESKTOP HP",
  "MONITOR",
  "NOTEBOOK SANSUMG",
  "DESKTOP DELL",
  "TV DIGITAL",
  "NOTEBOOK DELL",
  "MINI PC THINK",
  "PROBOOK HP 445 G9",
  "PROBOOK HP 445 G8",
  "NOBREAK RAGTECH",
  "NOBREAK ENERMAX",
  "MONITOR HP",
  "CPU ITAUTEC",
  "TOCA CD PANASONIC",
  "AMPLIFICADOR DIGITAL",
  "ESTABILIZADOR DE TENSÃO",
  "CPU TITAN",
  "MONITOR DELL",
  "IMPRESSORA",
  "DATA SHOW",
  "NOBREAK",
  "DESKTOP DATEN",
  "MINITOR CHP",
  "CPU APPLE MAC PRO",
  "NOBREAK SAVE",
  "IMPRESSORA SAMSUNG",
  "DARUNA PC 400",
  "NOTEBOOK HP",
  "MONITOR ITAUTEC",
  "MONITOR SAMSUNG",
  "NOBREAK TS SHARA",
  "NOTEBOOK ASUS",
  "IMPRESSORA HP P2035",
  "TV SAMSUNG",
  "MICROFONE VOKAL",
  "CAMERA FOTOGRAFICA",
  "NOTEBOOK ITAUTEC",
  "MONITOR AOC",
  "MONITOR LG",
  "NOTEBOOK STI",
  "SCANNER HP",
  "TV SONY",
  "PROJETOR EPSON",
  "DVR INTELBRAS",
  "DESKTOP CCE",
  "TECLADO",
  "CAIXA DE SOM",
  "YUP-E",
  "CILINDRO DE IMPRESSORA",
  "COMPUTADOR AIO ACER",
  "DESKTOP ALL IN ONE ACER",
  "MONITOR ACER",
  "MONITOR CONNEC",
  "IMPRESSORA EPSON",
  "SWITCH INTELBRAS",
  "CPU MULTILASER",
  "NOTEBOOK POSITIVO",
  "SWITCH BASELINE",
  "TABLET SAMSUNG",
  "MINI PC LENOVO",
  "NOBREAK APC",
  "GABINETE",
  "DESKTOP DELL VOSTRO",
  "NOBREAK MAX POWER",
  "MINI PC ETECNET",
  "MODEM SMARTAX MT800",
  "MONITOR PHILIPS",
  "NOTEBOOK LENOVO",
  "TV_HQ 60'",
  "IMPRESSORA CANON",
  "PC DELL VOSTRO",
  "TABLETE RCA",
  "EPSON L14150",
  "DESKTOP ITAUTEC",
  "MECBOOK AIR",
  "Tablet YUNDAI",
  "Celular-Note",
  "Transformer",
  "Celular LG",
  "XIAOMI",
  "Celular_M",
  "DESKTOP_POSITIVO",
  "NOBREAK_Intel",
  "Tel_fixo_Intelb",
  "MONITOR DATEN",
  "SCAN AVISION",
  "Mini PC Daten",
  "DESKTOP LENOVO",
  "DESKTOP THINK",
  "NOBREAK JBR",
  "NOTEBOOK SONY",
  "HP OFFICEJET PTO 7740",
  "Tel_Fixo_Leucotron",
  "Tel_Fixo_Premium",
  "Tel_Fixo_Siemens",
  "Fax_Panasonic",
  "Micro-Ondas",
  "FAX INTELBRAS",
  "TEL_ELGIN",
  "DESKTOP ALL IN ONE DL",
  "MONITOR ASUS",
  "Bebedouro",
  "Monitor Positivo",
  "NOTEBOK PHILCO",
  "MONITOR INFOWAY",
  "DESKTOP ALLIN ONE HP"
].map(s => s.trim().toUpperCase()); // Converte tudo pra uppercase pra padronizar com a nova regra

async function migrate() {
  try {
    // Pegamos a URI seja root ou em ./backend
    const uri = process.env.MONGODB_URI || require('dotenv').config().parsed.MONGODB_URI;
    if (!uri) throw new Error("Sem URI do MONGODB_URI");

    await mongoose.connect(uri);
    console.log("Conectado ao DB para migração.");

    // Garante que a lista não tenha strings vazias e nem repetidas
    const listaUnica = [...new Set(EQUIPAMENTOS)].filter(e => e !== "");
    
    let contInseridos = 0;
    
    for (const eqName of listaUnica) {
      const existe = await EqSuporte.findOne({ EQUIPAMENTO: { $regex: new RegExp(`^\\s*${eqName}\\s*$`, 'i') } });
      if (!existe) {
        const last = await EqSuporte.findOne().sort({ ID_EQUIP: -1 });
        const nextId = last && last.ID_EQUIP ? last.ID_EQUIP + 1 : 1;
        
        await EqSuporte.create({ ID_EQUIP: nextId, EQUIPAMENTO: eqName });
        contInseridos++;
        console.log(`[+] Migrando: ${eqName} (ID: ${nextId})`);
      }
    }

    console.log(`\nMigração Completa! Foram inseridos ${contInseridos} registros do hardcode antigo para a nova collection 'eqsuportes'.`);
    process.exit(0);
  } catch (err) {
    console.error("Erro na migração:", err);
    process.exit(1);
  }
}

migrate();
