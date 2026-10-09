import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export interface BackButtonHandlers {
  hasOpenModal: () => boolean;
  closeTopModal: () => boolean;
  canGoBack: () => boolean;
  goBack: () => void;
}

let backButtonListenerAttached = false;

export const initCapacitor = async (handlers?: BackButtonHandlers) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Configure Android Status Bar to match app theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0F172A' });
  } catch (err) {
    console.warn('Status bar configuration error:', err);
  }

  try {
    // 2. Hide Splash Screen smoothly once UI is ready
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (err) {
    console.warn('Splash screen error:', err);
  }

  // 3. Android Hardware Back Button integration
  if (handlers && !backButtonListenerAttached) {
    backButtonListenerAttached = true;
    App.addListener('backButton', ({ canGoBack: capCanGoBack }) => {
      // First priority: close open modals / dialogs
      if (handlers.hasOpenModal()) {
        const closed = handlers.closeTopModal();
        if (closed) return;
      }

      // Second priority: navigate back in app screen history
      if (handlers.canGoBack()) {
        handlers.goBack();
        return;
      }

      // Third priority: if on home screen with no modals, exit app
      App.exitApp();
    });
  }
};
