const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('==> Building static portfolio into:', distDir);

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

const copyList = [
  'index.html',
  '404.html',
  'hero.html',
  'favicon.svg',
  'css',
  'js',
  'data',
  'img',
  'audio'
];

for (const item of copyList) {
  const src = path.join(rootDir, item);
  const dest = path.join(distDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`  ✓ Copied ${item}`);
  } else {
    console.warn(`  ! Skipped missing ${item}`);
  }
}

console.log('==> Build completed successfully!');
