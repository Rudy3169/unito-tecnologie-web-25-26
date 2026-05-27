const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';
fs.readdirSync(pagesDir).forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const filePath = path.join(pagesDir, f);
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = content
            .replace(/import '\.\/PlantDetail\.css';/g, "import './PlantDetailPage.css';")
            .replace(/import '\.\/MyGarden\.css';/g, "import './MyGardenPage.css';")
            .replace(/import '\.\/Profile\.css';/g, "import './ProfilePage.css';")
            .replace(/import '\.\/AdminPanel\.css';/g, "import './AdminPage.css';")
            .replace(/import '\.\/HomeFeed\.css';/g, "import './HomePage.css';");
        if (content !== updated) {
            fs.writeFileSync(filePath, updated);
            console.log('Fixed css import in ' + filePath);
        }
    }
});
