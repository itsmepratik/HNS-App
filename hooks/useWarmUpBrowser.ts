import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    if (Platform.OS !== 'android') return;
      
    void WebBrowser.warmUpAsync();
    return () => {
      if (Platform.OS !== 'android') return;
      void WebBrowser.coolDownAsync();
    };
  }, []);
};
