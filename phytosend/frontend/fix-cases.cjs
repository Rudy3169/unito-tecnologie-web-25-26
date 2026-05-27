const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (let r of replacements) {
        content = content.replace(r.from, r.to);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed imports in ' + filePath);
    }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
        walkDir(dirPath, callback);
    } else {
        callback(dirPath);
    }
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath, [
          { from: /'\.\.\/Notifications\//g, to: "'../notifications/" },
          { from: /'\.\.\/Feed\//g, to: "'../feed/" },
          { from: /'\.\.\/MyGarden\//g, to: "'../garden/" },
          { from: /'\.\.\/Profile\//g, to: "'../profile/" },
          { from: /'\.\.\/Common\//g, to: "'../common/" }
      ]);
  }
});
