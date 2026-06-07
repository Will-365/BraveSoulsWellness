const fs = require('fs');

const files = [
  'personaltraining.html',
  'executivecoaching.html',
  'communitytraining.html',
  'sheisbraveelite.html'
];

const style = 'background: #c8942a !important; color: #ffffff !important; padding: 12px 24px !important; border-radius: 6px !important; box-shadow: 0 4px 12px rgba(200,148,42,0.4) !important; border: none !important; font-weight: bold !important; text-decoration: none !important;';

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find the top nav Apply Now button and replace it
  // Since we don't know exactly what class it has now, let's use a regex to find the href="#apply" inside the nav
  // Wait, I already changed them to href="#apply"
  
  // We can look for <nav ...> ... <a href="#apply" ...>Apply Now</a> ... </nav>
  // A simpler way: just replace the exact tags we know are there.
  
  if (file === 'executivecoaching.html') {
    content = content.replace(/<a href="#apply" class="btn btn-gold".*?>Apply Now<\/a>/, `<a href="#apply" class="btn btn-gold" style="${style}">Apply Now</a>`);
  } else if (file === 'personaltraining.html') {
    content = content.replace(/<a href="#apply" class="n-cta".*?>Apply Now<\/a>/, `<a href="#apply" class="n-cta" style="${style}">Apply Now</a>`);
  } else if (file === 'communitytraining.html') {
    content = content.replace(/<a href="#apply" class="ncta".*?>Apply Now<\/a>/, `<a href="#apply" class="ncta" style="${style}">Apply Now</a>`);
  } else if (file === 'sheisbraveelite.html') {
    // In sheisbraveelite.html it was `<a href="#apply" class="btn btn-gold nav-cta-desk">Apply Now</a>`
    content = content.replace(/<a href="#apply" class="btn btn-gold nav-cta-desk".*?>Apply Now<\/a>/, `<a href="#apply" class="btn btn-gold nav-cta-desk" style="${style}">Apply Now</a>`);
  }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
});
