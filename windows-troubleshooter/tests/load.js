'use strict';
/* Loads the knowledge base and engine into a Node global, mirroring the browser script order. */
const path = require('path');
const base = path.join(__dirname, '..');
['kb-core.js', 'kb-performance.js', 'kb-network.js', 'kb-windows.js', 'kb-av-devices.js', 'kb-m365-hardware.js', 'kb-meta.js'].forEach(f => require(path.join(base, f)));
module.exports = require(path.join(base, 'engine.js'));
module.exports.KB = globalThis.WT_KB;
