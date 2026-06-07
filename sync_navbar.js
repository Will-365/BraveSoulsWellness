const fs = require('fs');
const index = fs.readFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/index.html', 'utf8');
const contact = fs.readFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/contact.html', 'utf8');

// 1. Extract CSS from index.html
const startCssTag = '/* ══════════════════════════\r\n   NAVBAR';
const endCssTag = '/* Placeholder sections';
const startIndexCss = index.indexOf(startCssTag);
const endIndexCss = index.indexOf(endCssTag);
let navbarCss = index.substring(startIndexCss, endIndexCss);

const startResp = '/* ══════════════════════════\r\n   RESPONSIVE';
const endResp = '</style>';
const startRespIndex = index.indexOf(startResp);
const endRespIndex = index.indexOf(endResp);
const respCss = index.substring(startRespIndex, endRespIndex);

// 2. Extract HTML from index.html
const startHtmlTag = '<!-- ═══════ NAVBAR ═══════ -->';
const endHtmlTag = '<!-- ═══════ HERO ═══════ -->';
const startHtmlIndex = index.indexOf(startHtmlTag);
const endHtmlIndex = index.indexOf(endHtmlTag);
let navbarHtml = index.substring(startHtmlIndex, endHtmlIndex);

// fix links in navbarHtml since we are in contact.html
navbarHtml = navbarHtml.replace(/href="#about"/g, 'href="index.html#about"');
navbarHtml = navbarHtml.replace(/href="#programs"/g, 'href="index.html#programs"');
navbarHtml = navbarHtml.replace(/href="#corporate"/g, 'href="index.html#corporate"');
navbarHtml = navbarHtml.replace(/href="#testimonials"/g, 'href="index.html#testimonials"');
navbarHtml = navbarHtml.replace(/href="#team"/g, 'href="index.html#team"');
// change logo href to index.html
navbarHtml = navbarHtml.replace(/href="#" class="logo"/g, 'href="index.html" class="logo"');

let mobileJs = `
function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');
  const ham = document.getElementById('hamburger');
  if(!menu) return;
  menu.classList.toggle('active');
  overlay.classList.toggle('active');
  ham.classList.toggle('active');
  document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}
function closeMobile() {
  const menu = document.getElementById('mobileMenu');
  if(!menu) return;
  menu.classList.remove('active');
  document.getElementById('mobileOverlay').classList.remove('active');
  document.getElementById('hamburger').classList.remove('active');
  document.body.style.overflow = '';
}
const ham = document.getElementById('hamburger');
if(ham) ham.addEventListener('click', toggleMobile);
const mobileClose = document.getElementById('mobileClose');
if(mobileClose) mobileClose.addEventListener('click', closeMobile);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });
`;

// 3. Update contact.html
let newContact = contact;

// Replace old nav CSS
const oldCssStart = '/* ── NAV ── */';
const oldCssEnd = '/* ══════════════════════════════════════\r\n   HERO';
const oldCssStartIdx = newContact.indexOf(oldCssStart);
const oldCssEndIdx = newContact.indexOf(oldCssEnd);
newContact = newContact.substring(0, oldCssStartIdx) + navbarCss + '\n' + newContact.substring(oldCssEndIdx);

// Append Responsive CSS
const contactStyleEndIdx = newContact.indexOf('</style>');
newContact = newContact.substring(0, contactStyleEndIdx) + '\n' + respCss + '\n' + newContact.substring(contactStyleEndIdx);

// Replace old nav HTML
const oldHtmlStart = '<!-- ── NAV ── -->';
const oldHtmlEnd = '<!-- ══════════════════════════════════\r\n     HERO';
const oldHtmlStartIdx = newContact.indexOf(oldHtmlStart);
const oldHtmlEndIdx = newContact.indexOf(oldHtmlEnd);
newContact = newContact.substring(0, oldHtmlStartIdx) + navbarHtml + '\n' + newContact.substring(oldHtmlEndIdx);

// Add mobile JS before </body>
const bodyEndIdx = newContact.indexOf('</body>');
newContact = newContact.substring(0, bodyEndIdx) + '<script>\n' + mobileJs + '\n</script>\n' + newContact.substring(bodyEndIdx);

fs.writeFileSync('c:/Users/dev Hillary/Desktop/BraveSoulsWellness/contact.html', newContact);
console.log('contact.html updated with index navbar');
