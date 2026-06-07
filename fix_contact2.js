const fs = require('fs');
let contact = fs.readFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/contact.html', 'utf8');

const badRespStart = '/* ══════════════════════════\r\n   RESPONSIVE — 1100px';
const badRespEnd = '</style>';

const startIdx = contact.indexOf(badRespStart);
// find the first </style> after startIdx
const endIdx = contact.indexOf(badRespEnd, startIdx);

if(startIdx !== -1 && endIdx !== -1) {
  const cleanResp = `/* ══════════════════════════
   RESPONSIVE — NAVBAR ONLY
══════════════════════════ */
@media (max-width: 1100px) {
  .nav-links > li > a { padding: 0 10px; font-size: 10.5px; letter-spacing: 0.8px; }
  .nav-cta { padding: 10px 18px; font-size: 10px; }
  .logo-image { height: 48px; }
}

@media (max-width: 960px) {
  .nav-links { display: none !important; }
  .nav-cta { display: none !important; }
  .hamburger { display: flex !important; }

  .navbar .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .nav-right { padding-left: 0; }
  .logo { padding-right: 0; }
  .logo-image { height: 48px; }
}

@media (max-width: 768px) {
  .navbar .container { height: 58px; }
  .logo-image { height: 42px; }
}

@media (max-width: 560px) {
  .navbar .container { height: 52px; }
  .logo-image { height: 36px; }
}
`;
  contact = contact.substring(0, startIdx) + cleanResp + contact.substring(endIdx);
  fs.writeFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/contact.html', contact);
  console.log('Fixed responsive CSS');
} else {
  console.log('Could not find bounds for responsive CSS block.');
}
