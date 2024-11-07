const { QuickDB } = require("quick.db");
const fs = require("fs");
const pinoms = require('pino-multi-stream');

const db = new QuickDB();
exports.db = db;

globalThis.logger = pinoms(pinoms.multistream([{stream: fs.createWriteStream('log.log')},{stream: pinoms.prettyStream()}]));