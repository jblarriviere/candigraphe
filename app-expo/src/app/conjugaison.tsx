import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function ConjugaisonScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Conjugaison</Text>
        <Text style={styles.subtitle}>Bientôt disponible.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.burgundyDeep,
  },
  subtitle: {
    fontFamily: Fonts.serif,
    fontStyle: 'italic',
    fontSize: 15,
    color: Colors.inkSoft,
  },
});
