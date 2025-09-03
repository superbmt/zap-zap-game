# 🔄 Zap Zap Math Game - Versioning Guide

## 📋 Version Management System

Your app now has a comprehensive versioning system with automated tools and clear workflows.

### 🎯 Current Version Structure

```json
{
  "version": "1.0.0",           // Semantic version (user-facing)
  "ios.buildNumber": "1",       // iOS internal build number
  "android.versionCode": 1      // Android internal version code
}
```

---

## 🛠️ Version Management Commands

### **Check Current Version**
```bash
npm run version:current
```

### **Increment Version**
```bash
# Bug fixes and small improvements
npm run version:patch    # 1.0.0 → 1.0.1

# New features (backward compatible)
npm run version:minor    # 1.0.0 → 1.1.0

# Major changes or breaking changes
npm run version:major    # 1.0.0 → 2.0.0
```

---

## 📱 Platform-Specific Versioning

### **iOS (App Store)**
- **Version**: `1.0.0` (user-facing, semantic)
- **Build Number**: `1, 2, 3...` (internal, auto-incremented)
- **Bundle ID**: `com.superbmt.zapzapmath`

### **Android (Play Store)**
- **Version Name**: `1.0.0` (user-facing, semantic)
- **Version Code**: `1, 2, 3...` (internal, auto-incremented)
- **Package**: `com.superbmt.zapzapmath`

### **Web (PWA)**
- **Version**: `1.0.0` (in manifest)
- **Cache Busting**: Automatic with Expo export

---

## 🚀 Release Workflow

### **1. Development → Testing**
```bash
# Make your changes...
npm run version:patch      # Update version
npm run build:android      # Build APK for testing
npm run build:web         # Build web version
```

### **2. Feature Release**
```bash
# Add new features...
npm run version:minor      # Update version
git add .
git commit -m "feat: add new difficulty levels"
git tag v1.1.0            # Tag release
```

### **3. Production Release**
```bash
# Final testing done...
npm run version:patch      # or minor/major
eas build --platform all --profile production
eas submit --platform all # Submit to stores
```

---

## 📝 Semantic Versioning Guidelines

### **PATCH (1.0.X)**
- 🐛 Bug fixes
- 🔧 Performance improvements
- 📝 UI text updates
- 🎨 Minor UI improvements

**Example**: Fix streak counting bug → `1.0.1`

### **MINOR (1.X.0)**
- ✨ New features
- 🎮 New game modes
- 🏆 Leaderboard enhancements
- 📱 Platform support additions

**Example**: Add new difficulty level → `1.1.0`

### **MAJOR (X.0.0)**
- 💥 Breaking changes
- 🔄 Complete redesign
- 🏗️ Architecture changes
- 📱 Minimum OS version changes

**Example**: Complete UI redesign → `2.0.0`

---

## 🔄 Auto-Increment Configuration

### **EAS Build Settings** (`eas.json`):
```json
{
  "build": {
    "preview": {
      "distribution": "internal"    // For testing
    },
    "production": {
      "autoIncrement": "version"    // Auto-increment build numbers
    }
  }
}
```

### **Benefits**:
- ✅ **Automatic build number increment** for app stores
- ✅ **No manual tracking** of internal version codes
- ✅ **Consistent versioning** across platforms

---

## 📊 Version Tracking

### **Where Versions Are Used**:

1. **App Stores**: User downloads see semantic version
2. **Build Services**: EAS uses build numbers for tracking
3. **Analytics**: Track feature usage by version
4. **Support**: Identify user issues by version
5. **Updates**: OTA updates use version comparison

### **Version Display in App**:
You can show version in your app:
```javascript
import Constants from 'expo-constants';

// Show in settings or about screen
const appVersion = Constants.expoConfig.version;
const buildNumber = Constants.expoConfig.ios?.buildNumber;
```

---

## 🎯 Best Practices

### **1. Always Update CHANGELOG.md**
```bash
npm run version:patch
# Edit CHANGELOG.md with changes
git add .
git commit -m "chore: release v1.0.1"
```

### **2. Tag Releases**
```bash
git tag v1.0.1
git push origin v1.0.1
```

### **3. Test Before Releasing**
```bash
# Test all platforms
npm run build:web
npm run build:android
# Test thoroughly before version bump
```

### **4. Document Breaking Changes**
For major versions, always document:
- What changed
- Migration steps
- New requirements

---

## 🚨 Emergency Hotfixes

For critical bugs in production:

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug
# Fix the bug...
npm run version:patch
git commit -m "fix: critical gameplay bug"
git tag v1.0.1-hotfix
# Deploy immediately
```

---

## 📈 Future Considerations

### **When to Version Bump**:
- **Every store submission** requires version increment
- **Significant features** warrant minor version
- **User-facing changes** should be documented
- **Breaking changes** require major version

### **Version Strategy**:
- Start conservative with patches
- Reserve majors for big milestones
- Keep versions meaningful to users
- Document everything in CHANGELOG.md
