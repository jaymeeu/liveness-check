import { Check, CircleCheck as CheckCircle, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LivenessCheckProps {
  onComplete: () => void;
  onCancel: () => void;
}


import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

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


export default function LivenessCheck({ onComplete, onCancel }: LivenessCheckProps) {



  const [videoSession, setVideoSession] = useState({
    "SessionId": "",
    "ClientToken": "",
    "expires_at": ""
  })
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
  }, [videoSession]); // Include  in dependency array

  const verifySession = async (id: string, token: string) => {

    console.log("sessionID :", id)
    console.log("clint token :", token)

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
    onComplete()
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

  const [isProcessing, setIsProcessing] = useState(false);

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.processingContainer}>
          <CheckCircle size={64} color="#16A34A" />
          <Text style={styles.processingTitle}>Processing...</Text>
          <Text style={styles.processingText}>
            Analyzing your liveness verification
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liveness Verification</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <View
          style={styles.camera}
        >
          <View style={styles.overlay}>
            <View style={styles.faceFrame} />
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.okButton} onPress={() => fetchSessionData()}>
          <Check size={20} color="#94a3b8" />
          <Text style={styles.okButtonText}>Verify Face</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 200,
    height: 250,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  currentInstruction: {
    alignItems: 'center',
  },
  instructionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  activeStep: {
    backgroundColor: '#1E40AF',
  },
  completedStep: {
    backgroundColor: '#16A34A',
  },
  progressStepText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  okButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#007400',
    borderRadius: 8,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 16,
  },
  processingText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});