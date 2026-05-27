const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';
fs.readdirSync(pagesDir).forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const filePath = path.join(pagesDir, f);
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = content.replace(/'\.\.\/\.\.\/assets/g, "'../assets");
        if (content !== updated) {
            fs.writeFileSync(filePath, updated);
            console.log('Fixed assets in ' + filePath);
        }
    }
});
