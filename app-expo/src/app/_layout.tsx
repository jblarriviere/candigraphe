import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.burgundy,
          tabBarInactiveTintColor: Colors.inkSoft,
          tabBarStyle: { backgroundColor: Colors.paperElement, borderTopColor: Colors.rule },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Vocabulaire' }} />
        <Tabs.Screen name="conjugaison" options={{ title: 'Conjugaison' }} />
      </Tabs>
    </>
  );
}
