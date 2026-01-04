import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/theme/colors';

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
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
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
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
