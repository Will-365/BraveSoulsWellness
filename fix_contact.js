const fs = require('fs');
let contact = fs.readFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/contact.html', 'utf8');

const badStart = '/* ── HERO ── */';
const badEnd = '/* ══════════════════════════════════════\r\n   HERO — EDITORIAL SPLIT';
const startIdx = contact.indexOf(badStart);
const endIdx = contact.indexOf(badEnd);

if(startIdx !== -1 && endIdx !== -1) {
  contact = contact.substring(0, startIdx) + contact.substring(endIdx);
  fs.writeFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/contact.html', contact);
  console.log('Removed imported non-nav CSS.');
} else {
  console.log('Could not find bounds: ', startIdx, endIdx);
}
