// Create a file called copyAssets.js in your project root
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const assetsDir = path.join(__dirname, 'src/assets/navigation');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Source and destination paths
const srcDir = path.join(__dirname, 'node_modules/@react-navigation/elements/lib/commonjs/assets');
const destDir = assetsDir;

// Copy files
fs.readdirSync(srcDir)
  .filter(file => file.endsWith('.png'))
  .forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to src/assets/navigation/`);
  });

console.log('Navigation assets copied successfully');