import re
import sys

def inject_form(file_path, program_name):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # CSS to inject right before </style>
    css_to_inject = """
/* ── APPLY FORM CSS ── */
.apply { padding: 130px 0; background: var(--cream); position: relative; overflow: hidden; }
.apply::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(200,148,42,0.15) 0%, transparent 70%); top: -200px; right: -200px; border-radius: 50%; pointer-events: none; }
.apply-inner { max-width: 800px; margin: 0 auto; text-align: center; position: relative; z-index: 2; }
.apply-crown { display: inline-flex; width: 80px; height: 80px; background: var(--white); border-radius: 50%; align-items: center; justify-content: center; box-shadow: var(--shadow); margin-bottom: 24px; position: relative; }
.apply-crown::after { content: ''; position: absolute; inset: -10px; border: 1px dashed rgba(200,148,42,0.4); border-radius: 50%; animation: spin 20s linear infinite; }
.apply-crown img { width: 44px; height: 44px; object-fit: contain; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.apply-title { font-family: 'Cormorant Garamond', serif; font-size: 3.2rem; font-weight: 700; color: var(--green-deep); margin-bottom: 16px; letter-spacing: -0.5px; }
.apply-title em { font-style: italic; color: var(--gold); display: block; }
.apply-sub { font-size: 1rem; line-height: 1.85; color: var(--text-muted); margin-bottom: 56px; }
.apply-form { background: var(--white); padding: 48px; border-radius: var(--radius); box-shadow: 0 20px 60px rgba(0,0,0,0.06); text-align: left; max-width: 700px; margin: 0 auto; position: relative; z-index: 2; }
.apply-form-title { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; font-weight: 700; color: var(--green-deep); margin-bottom: 8px; }
.apply-form-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 36px; }
.form-row { display: flex; gap: 20px; margin-bottom: 20px; }
.fg { flex: 1; margin-bottom: 20px; }
.fg label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.fg input, .fg select, .fg textarea { width: 100%; padding: 14px 18px; border: 1.5px solid #eaeaea; border-radius: 8px; font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--text-dark); background: #fafafa; transition: var(--transition); outline: none; }
.fg textarea { height: 120px; resize: vertical; }
.fg input:focus, .fg select:focus, .fg textarea:focus { border-color: var(--gold); background: var(--white); box-shadow: 0 0 0 4px rgba(200,148,42,0.1); }
.apply-notice { background: rgba(200,148,42,0.08); border-left: 4px solid var(--gold); padding: 16px 20px; font-size: 13px; color: var(--text-dark); line-height: 1.6; border-radius: 0 8px 8px 0; margin-top: 24px; }
.apply-notice strong { color: var(--gold); }
@media (max-width: 768px) { .form-row { flex-direction: column; gap: 0; } .apply-form { padding: 36px; } .apply-title { font-size: 2.6rem; } }
@media (max-width: 480px) { .apply-form { padding: 26px 20px; } }
"""
    if "/* ── APPLY FORM CSS ── */" not in content:
        content = re.sub(r'</style>', css_to_inject + '\n</style>', content, 1)

    # HTML to inject right before <footer class="footer">
    html_to_inject = f"""
<!-- ═══════ APPLY ═══════ -->
<section class="apply" id="apply">
  <div class="container">
    <div class="apply-inner">
      <span class="apply-crown"><img src="images/crown.png" alt="Golden Crown"></span>
      <h2 class="apply-title">Are You Ready<em>to Transform?</em></h2>
      <p class="apply-sub">We accept a limited number of clients each month to ensure every participant receives the attention, coaching, and accountability they deserve. Apply today.</p>
    </div>
    <div class="apply-form reveal">
      <div class="apply-form-title">Apply for {program_name}</div>
      <p class="apply-form-sub">Complete this form and our team will be in touch within 24–48 hours to schedule your consultation.</p>
      <div class="form-row">
        <div class="fg"><label>First Name</label><input type="text" id="progFirstName" placeholder="Your first name"></div>
        <div class="fg"><label>Last Name</label><input type="text" id="progLastName" placeholder="Your last name"></div>
      </div>
      <div class="form-row">
        <div class="fg"><label>Email Address</label><input type="email" id="progEmail" placeholder="your@email.com"></div>
        <div class="fg"><label>WhatsApp Number</label><input type="tel" id="progWhatsapp" placeholder="+250 7XX XXX XXX"></div>
      </div>
      <div class="fg" style="display:none;">
        <label>Your Primary Goal</label>
        <select id="progProgram">
          <option value="{program_name}" selected>{program_name}</option>
        </select>
      </div>
      <div class="fg">
        <label>Biggest Challenge Right Now</label>
        <textarea id="progChallenge" placeholder="Tell us the main challenge you're facing — physically, mentally, or in your daily lifestyle. Be honest. This is where transformation begins…"></textarea>
      </div>
      <div class="fg">
        <label>How Did You Hear About Us?</label>
        <select id="progSource">
          <option value="">Select an option…</option>
          <option>Instagram / Social Media</option>
          <option>Referral from a friend or client</option>
          <option>Brave Souls Wellness website</option>
          <option>WhatsApp / Community group</option>
          <option>Other</option>
        </select>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-gold" style="flex:1" onclick="handleApply(this)">Submit My Application →</button>
        <a href="https://wa.me/250788675638?text=Hi!%20I%20want%20to%20apply%20for%20{program_name}"
           target="_blank" class="btn btn-green" style="flex:1">💬 Apply via WhatsApp</a>
      </div>
    </div>
  </div>
</section>
"""
    if '<!-- ═══════ APPLY ═══════ -->' not in content:
        content = re.sub(r'<footer class="footer">', html_to_inject + '\n<footer class="footer">', content, 1)

    # JS to inject right before </script>
    js_to_inject = """
// IMPORTANT: Paste your Google Apps Script Web App URL below
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxqkpI5myxmD7YkeYi7DYs17ZoTvhBgQERRnWdFAt8SBNwVSQpj123khXTTeX80ES31aQ/exec";

/* ── Apply form ── */
function handleApply(btn) {
  if (!SCRIPT_URL) {
    alert("Please set the SCRIPT_URL in the HTML file first!");
    return;
  }

  const data = {
    firstName: document.getElementById('progFirstName').value,
    lastName: document.getElementById('progLastName').value,
    email: document.getElementById('progEmail').value,
    whatsapp: document.getElementById('progWhatsapp').value,
    program: document.getElementById('progProgram').value,
    challenge: document.getElementById('progChallenge').value,
    source: document.getElementById('progSource').value
  };

  const orig = btn.innerHTML;
  btn.innerHTML = 'Sending...';
  btn.disabled = true;

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data)
  }).then(() => {
    btn.innerHTML = '✓ Application Received — We\\'ll be in touch soon!';
    btn.style.background = 'var(--green-light)';
    
    // Clear inputs
    document.getElementById('progFirstName').value = '';
    document.getElementById('progLastName').value = '';
    document.getElementById('progEmail').value = '';
    document.getElementById('progWhatsapp').value = '';
    document.getElementById('progChallenge').value = '';
    document.getElementById('progSource').value = '';

    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 4500);
  }).catch((error) => {
    console.error('Error!', error.message);
    btn.innerHTML = 'Error. Try Again.';
    btn.disabled = false;
  });
}
"""
    if "function handleApply(btn)" not in content:
        content = re.sub(r'</script>', js_to_inject + '\n</script>', content, 1)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {file_path}")

inject_form(r'c:\Users\dev Hillary\Desktop\BraveSoulsWellness\personaltraining.html', 'Personal Coaching')
inject_form(r'c:\Users\dev Hillary\Desktop\BraveSoulsWellness\executivecoaching.html', 'Executive Coaching')
inject_form(r'c:\Users\dev Hillary\Desktop\BraveSoulsWellness\communitytraining.html', 'Community Programs')
