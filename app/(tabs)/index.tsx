import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform, Pressable, StyleSheet, Text } from 'react-native';

const { FaceLiveness } = NativeModules;
// const livenessEvents = new NativeEventEmitter(FaceLiveness);

let livenessEvents: NativeEventEmitter | undefined = undefined;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  if (FaceLiveness) {
    console.log('🔧 Creating NativeEventEmitter for FaceLiveness module');
    livenessEvents = new NativeEventEmitter(FaceLiveness);
    console.log('✅ NativeEventEmitter created successfully');
  } else {
    console.error('❌ FaceLiveness module not found!');
  }
} else {
  console.warn('⚠️ Platform not supported for FaceLiveness');
}

// Call this to start
const startSession = async (sessionId: string) => {
  // Camera permission is now handled by the native module
  FaceLiveness.startLivenessCheck(sessionId, 'eu-west-1');
}



export default function HomeScreen() {

  const [videoSession, setVideoSession] = useState({
    "SessionId": "",
    "ClientToken": "",
    "expires_at": ""
  })
  const [videoSessionId, setVideoSessionId] = useState('')
  // Listen to events
  useEffect(() => {
    if (!livenessEvents) {
      console.warn('Liveness events not available on this platform');
      return;
    }
    const sub = livenessEvents.addListener('LivenessComplete', (data) => {
      setTimeout(() => {
      verifySession(videoSession.SessionId, videoSession.ClientToken)
      }, 5000);
      alert('Liveness check completed successfully!');
    });

    const errorSub = livenessEvents.addListener('LivenessError', (err) => {
      console.error('❌ LivenessError event received!');
      console.error('💥 Error details:', err);
      console.log('🔑 Session ID when error occurred:', videoSessionId);
      console.error('Liveness failed:', err);

      // Show user-friendly error
      alert(`Liveness check failed: ${err}`);
    });

    console.log('✅ Event listeners set up successfully');

    return () => {
      console.log('🧹 Cleaning up event listeners...');
      sub.remove();
      errorSub.remove();
    };
  }, [videoSession]); // Include videoSessionId in dependency array

  const verifySession = async (id : string, token : string) =>{

    console.log( "sessionID :", id)
    console.log( "clint token :", token)

    const response = await fetch(`https://dev-fraud-api.datamellonai.com/v1/auth/liveness-result/${id}?email=dummyEmail@gmail.com&client_token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Verication API Error response:', errorText);
      throw new Error(`Verication HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('📋 Verication Full API Response:', JSON.stringify(data, null, 2));

  }

  const fetchSessionData = async () => {
    try {
      console.log('🚀 Starting liveness session request...');
      console.log('📱 Platform:', Platform.OS);
      console.log('🔧 Platform Version:', Platform.Version);

      // Check if FaceLiveness module is available
      if (!FaceLiveness) {
        throw new Error('FaceLiveness module not available');
      }
      console.log('✅ FaceLiveness module is available');

      // Fetch session from your API
      const response = await fetch('https://dev-fraud-api.datamellonai.com/v1/auth/start-liveness-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "email": "dummyEmail@gmail.com"
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Full API Response:', JSON.stringify(data, null, 2));


      setVideoSession(data.data)

      const sessionId = data.data?.SessionId;

      if (!sessionId) {
        throw new Error('No session ID received from API');
      }

      // Validate session ID format
      if (typeof sessionId !== 'string' || sessionId.length < 10) {
        throw new Error(`Invalid session ID format: ${sessionId}`);
      }

      setTimeout(() => {
        console.log('🚀 Starting liveness session now...');
        startSession(sessionId);
      }, 2000); // Increased delay for physical devices
    } catch (error) {
      console.error('💥 Error starting liveness session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      alert(`Failed to start liveness session: ${errorMessage}`);
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
        <Text style={{ color: '#990077', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Test Liveness Check</Text>
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