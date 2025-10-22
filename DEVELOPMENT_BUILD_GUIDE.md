# Development Build Guide for Real AdMob

## 🚨 The Issue: Native Module Error

The error `'RNGoogleMobileAdsModule' could not be found` occurs because:

- **AdMob requires native code** that's not available in Expo Go
- **You need a development build** to use native modules
- **Expo Go only supports** JavaScript-only packages

## ✅ Solution: Create Development Build

### **Step 1: Install Development Client**

```bash
npx expo install expo-dev-client
```

### **Step 2: Build for iOS (Mac required)**

```bash
npx expo run:ios
```

### **Step 3: Build for Android**

```bash
npx expo run:android
```

## 🔧 Alternative: Use EAS Build (Recommended)

### **Step 1: Install EAS CLI**

```bash
npm install -g @expo/eas-cli
```

### **Step 2: Login to Expo**

```bash
eas login
```

### **Step 3: Configure EAS**

```bash
eas build:configure
```

### **Step 4: Build Development Version**

```bash
# For iOS
eas build --platform ios --profile development

# For Android
eas build --platform android --profile development
```

## 📱 What Happens After Building

### **Development Build Features:**

- ✅ **Native AdMob support** - real ads will work
- ✅ **All your native modules** - camera, sensors, etc.
- ✅ **Hot reloading** - same development experience
- ✅ **Debugging** - same debugging tools

### **How to Use:**

1. **Install the development build** on your device
2. **Run `npx expo start --dev-client`**
3. **Scan QR code** with your development build app
4. **Test real AdMob ads** on your device

## 🎯 Quick Start (Choose One)

### **Option A: Local Build (Fastest)**

```bash
# Install development client
npx expo install expo-dev-client

# Build for your device
npx expo run:ios        # For iPhone
npx expo run:android    # For Android

# Start development server
npx expo start --dev-client
```

### **Option B: EAS Build (Most Reliable)**

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login and configure
eas login
eas build:configure

# Build development version
eas build --platform ios --profile development
eas build --platform android --profile development

# Start development server
npx expo start --dev-client
```

## 🔧 Configuration Files

### **app.json (Already Configured)**

```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-6244419407881612~4333756041",
        "iosAppId": "ca-app-pub-6244419407881612~6898094220"
      }
    ]
  ]
}
```

### **eas.json (Auto-generated)**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

## 📱 Testing Real AdMob

### **After Building:**

1. **Install development build** on your device
2. **Run `npx expo start --dev-client`**
3. **Open development build app** (not Expo Go)
4. **Scan QR code** to load your app
5. **Test real AdMob ads** - they should work!

### **What You'll See:**

- ✅ **Real banner ads** at bottom of screen
- ✅ **Real interstitial ads** after user actions
- ✅ **Console logs** showing ad loading status
- ✅ **Fallback ads** if real ads fail to load

## 🐛 Troubleshooting

### **Build Fails:**

1. **Check Xcode** is installed (for iOS)
2. **Check Android Studio** is installed (for Android)
3. **Check device** is connected and recognized
4. **Check network** connection

### **Ads Still Don't Show:**

1. **Verify device** - must be real device, not simulator
2. **Check network** - needs internet connection
3. **Check AdMob account** - ensure it's approved
4. **Check console logs** - look for error messages

### **Development Build Issues:**

1. **Clear cache**: `npx expo start --dev-client --clear`
2. **Restart Metro**: Stop and restart development server
3. **Rebuild**: Delete build and rebuild if needed

## 💡 Pro Tips

### **Development Workflow:**

1. **Use development build** for testing AdMob
2. **Use Expo Go** for quick JavaScript-only changes
3. **Switch between** as needed during development

### **Performance:**

- **Development builds** are larger than Expo Go
- **First build** takes longer (compiles native code)
- **Subsequent builds** are faster (incremental)

### **Team Development:**

- **Share development builds** with team members
- **Use EAS Build** for consistent builds across team
- **Test on multiple devices** before release

## 🎯 Next Steps

### **Immediate:**

1. **Choose build method** (local or EAS)
2. **Create development build** for your device
3. **Test real AdMob integration**
4. **Verify ads show correctly**

### **Before Production:**

1. **Test on multiple devices**
2. **Create production build** with EAS
3. **Submit to app stores**
4. **Monitor AdMob performance**

## 🎉 You're Ready!

Once you create a development build:

- ✅ **Real AdMob ads** will work
- ✅ **All native features** will work
- ✅ **Same development experience** as Expo Go
- ✅ **Ready for production** deployment

**The development build gives you the best of both worlds: native module support with the Expo development experience!**


