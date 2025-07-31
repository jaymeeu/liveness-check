import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Camera } from 'expo-camera';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform, Pressable, StyleSheet, Text } from 'react-native';

const { FaceLiveness } = NativeModules;
// const livenessEvents = new NativeEventEmitter(FaceLiveness);

let livenessEvents: NativeEventEmitter | undefined = undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  if (FaceLiveness) {
    livenessEvents = new NativeEventEmitter(FaceLiveness);
  }
}

// Call this to start
const startSession = async (sessionId : string) => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status === 'granted') {
    FaceLiveness.startLivenessCheck(sessionId, 'eu-west-1');
  } else {
    alert('Camera permission is required for liveness check.');
  }

}



export default function HomeScreen() {

  const [videoSessionId, setVideoSessionId] = useState('')
  // Listen to events
useEffect(() => {
  if (!livenessEvents) {
    console.warn('Liveness events not available on this platform');
    return;
  }
  const sub = livenessEvents.addListener('LivenessComplete', () => {
    console.log(videoSessionId, 'Liveness check complete!');
    
  });

  const errorSub = livenessEvents.addListener('LivenessError', (err) => {
    console.error('Liveness failed:', err);
  });

  return () => {
    sub.remove();
    errorSub.remove();
  };
}, []);


const fetchSessionData = async () => {
  try {
    console.log('Starting liveness session request...');
    
    // Fetch session from your API
    const response = await fetch('https://dev-fraud-api.datamellonai.com/v1/auth/start-liveness-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "email": "thierry.boukanga@datamellon.com"
      })
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    
    const sessionId = data.data?.SessionId;
    
    setVideoSessionId(sessionId)
    console.log('Extracted session ID:', sessionId);
    console.log('Session ID type:', typeof sessionId);
    console.log('Session ID length:', sessionId?.length);
    
    if (!sessionId) {
      throw new Error('No session ID received from API');
    }
    
    // Add a small delay to ensure AWS credentials are ready
    console.log('Waiting for AWS credentials to be ready...');
    setTimeout(() => {
      startSession(sessionId);
    }, 1000);
  } catch (error) {
    console.error('Error starting liveness session:', error);
    alert(`Failed to start liveness session: ${error?.message}`);
  }
}

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
     

      <Pressable onPress={() => fetchSessionData()}>
        <Text style={{ color: '#990077', fontSize : 20, fontWeight: 'bold', textAlign :'center' }}>Test Liveness Check</Text>
      </Pressable>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
