import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/theme/colors';
import { useSubscriptionStore } from '@/store/subscription-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [fontsLoaded] = useFonts({
    'GoogleSans-Regular': require('@/assets/fonts/static/GoogleSans-Regular.ttf'),
    'GoogleSans-Medium': require('@/assets/fonts/static/GoogleSans-Medium.ttf'),
    'GoogleSans-SemiBold': require('@/assets/fonts/static/GoogleSans-SemiBold.ttf'),
    'GoogleSans-Bold': require('@/assets/fonts/static/GoogleSans-Bold.ttf'),
    'GoogleSans-Italic': require('@/assets/fonts/static/GoogleSans-Italic.ttf'),
    'GoogleSans-MediumItalic': require('@/assets/fonts/static/GoogleSans-MediumItalic.ttf'),
    'GoogleSans-SemiBoldItalic': require('@/assets/fonts/static/GoogleSans-SemiBoldItalic.ttf'),
    'GoogleSans-BoldItalic': require('@/assets/fonts/static/GoogleSans-BoldItalic.ttf'),
    Bangers: Bangers_400Regular,
  });

  useEffect(() => {
    useSubscriptionStore.getState().initialize();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="preview"
            options={{
              title: 'Preview',
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
