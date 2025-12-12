const config = {
  appId: 'com.mundial2026.app',
  appName: 'Mundial 2026',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

module.exports = config;

