# Daily Work Platform - React & Capacitor Android App

Complete native Android & web application built for daily wage workers, contractors, and job providers.

## Automated Android APK Build
This repository includes GitHub Actions CI/CD (`.github/workflows/build-android.yml`).
Whenever code is pushed, GitHub automatically builds:
- **Debug Android APK**: Ready to install directly on Android phones.
- **Android App Bundle (.aab)**: Ready for Google Play Store upload.

### Download your APK:
1. Go to the **Actions** tab in this GitHub repository.
2. Click on the latest workflow run ("Build Android APK & AAB").
3. Scroll down to **Artifacts** to download `DailyWork-Debug-APK.zip`.
