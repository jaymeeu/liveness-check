import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeModules } from 'react-native';

const { FaceLiveness } = NativeModules;


export default function AnalyticsScreen() {

  const doLiveness = async () => {
    const session = await fetch('https://your-api/start-session');
    const { sessionId } = await session.json();
  
    try {
      const result = await FaceLiveness.startLivenessSession(sessionId);
      console.log('✅ Liveness session success:', result);
    } catch (err) {
      console.error('❌ Liveness failed:', err);
    }
  };
  
  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
});