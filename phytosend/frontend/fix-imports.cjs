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

// 1. Fix pages (they moved from src/components/Dir/ to src/pages/)
// This means:
// ../../api -> ../api
// ../../types -> ../types
// ../Common/WarningModal -> ../components/common/WarningModal
// ./PostList -> ../components/feed/PostList
// ./CreatePostForm -> ../components/feed/CreatePostForm
// ../Feed/PostCard -> ../components/feed/PostCard
// ../Feed/PostList -> ../components/feed/PostList
// ./PlantCard -> ../components/garden/PlantCard
// ./AddPlantModal -> ../components/garden/AddPlantModal
// ./DeletePlantModal -> ../components/garden/DeletePlantModal
// ./PlantDetailModal -> ../components/garden/PlantDetailModal
// ./PostsScrollModal -> ../components/garden/PostsScrollModal
// ./NotificationItem -> ../components/notifications/NotificationItem
// ./ProfileSettings -> ../components/profile/ProfileSettings

const pagesDir = 'src/pages';
fs.readdirSync(pagesDir).forEach(f => {
    if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        replaceInFile(path.join(pagesDir, f), [
            { from: /'\.\.\/\.\.\/api'/g, to: "'../api'" },
            { from: /'\.\.\/\.\.\/types'/g, to: "'../types'" },
            { from: /'\.\.\/Common\/WarningModal'/g, to: "'../components/common/WarningModal'" },
            { from: /'\.\/PostList'/g, to: "'../components/feed/PostList'" },
            { from: /'\.\/CreatePostForm'/g, to: "'../components/feed/CreatePostForm'" },
            { from: /'\.\.\/Feed\/PostCard'/g, to: "'../components/feed/PostCard'" },
            { from: /'\.\.\/Feed\/PostList'/g, to: "'../components/feed/PostList'" },
            { from: /'\.\/PlantCard'/g, to: "'../components/garden/PlantCard'" },
            { from: /'\.\/AddPlantModal'/g, to: "'../components/garden/AddPlantModal'" },
            { from: /'\.\/DeletePlantModal'/g, to: "'../components/garden/DeletePlantModal'" },
            { from: /'\.\/PlantDetailModal'/g, to: "'../components/garden/PlantDetailModal'" },
            { from: /'\.\/PostsScrollModal'/g, to: "'../components/garden/PostsScrollModal'" },
            { from: /'\.\/NotificationItem'/g, to: "'../components/notifications/NotificationItem'" },
            { from: /'\.\/ProfileSettings'/g, to: "'../components/profile/ProfileSettings'" },
        ]);
    }
});

// 2. Fix components (they moved from src/components/Dir/ to src/components/dir/)
// They are still 2 levels deep.
// ../Common/WarningModal -> ../common/WarningModal
// ../Feed/PostCard -> ../feed/PostCard

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

walkDir('src/components', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath, [
          { from: /'\.\.\/Common\/WarningModal'/g, to: "'../common/WarningModal'" },
          { from: /'\.\.\/Feed\/PostCard'/g, to: "'../feed/PostCard'" },
      ]);
  }
});
