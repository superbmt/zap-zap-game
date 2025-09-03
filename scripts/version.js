#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read current app.json
const appJsonPath = path.join(__dirname, '../app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Version management functions
function getCurrentVersion() {
  return appJson.expo.version;
}

function incrementVersion(type) {
  const version = getCurrentVersion();
  const [major, minor, patch] = version.split('.').map(Number);
  
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      throw new Error('Invalid version type. Use: major, minor, or patch');
  }
  
  // Update version
  appJson.expo.version = newVersion;
  
  // Increment build numbers
  if (appJson.expo.ios?.buildNumber) {
    appJson.expo.ios.buildNumber = String(Number(appJson.expo.ios.buildNumber) + 1);
  }
  
  if (appJson.expo.android?.versionCode) {
    appJson.expo.android.versionCode = Number(appJson.expo.android.versionCode) + 1;
  }
  
  // Write back to file
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  
  console.log(`✅ Version updated: ${version} → ${newVersion}`);
  console.log(`📱 iOS Build: ${appJson.expo.ios?.buildNumber || 'N/A'}`);
  console.log(`🤖 Android Version Code: ${appJson.expo.android?.versionCode || 'N/A'}`);
  
  return newVersion;
}

// CLI interface
const command = process.argv[2];
const versionType = process.argv[3];

switch (command) {
  case 'current':
    console.log(`Current version: ${getCurrentVersion()}`);
    break;
  case 'bump':
    if (!versionType) {
      console.error('Please specify version type: major, minor, or patch');
      process.exit(1);
    }
    incrementVersion(versionType);
    break;
  default:
    console.log(`
Zap Zap Math Game - Version Manager

Usage:
  node scripts/version.js current        - Show current version
  node scripts/version.js bump patch     - Increment patch version (1.0.0 → 1.0.1)
  node scripts/version.js bump minor     - Increment minor version (1.0.0 → 1.1.0)
  node scripts/version.js bump major     - Increment major version (1.0.0 → 2.0.0)

Examples:
  Bug fixes:     npm run version:patch
  New features:  npm run version:minor
  Breaking changes: npm run version:major
    `);
}
