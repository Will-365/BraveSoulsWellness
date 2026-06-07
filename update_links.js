const fs = require('fs');

function replaceHrefs(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/href="#cta"/g, 'href="#apply"');
    // Also handle possible href="brave-souls-wellness.html#booking" if they want it to go to apply? 
    // Let's just do #cta.
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Replaced in ' + filePath);
}

replaceHrefs('personaltraining.html');
replaceHrefs('executivecoaching.html');
replaceHrefs('communitytraining.html');
