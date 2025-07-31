import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Camera, QrCode, UserCheck, FileImage } from 'lucide-react-native';
import CameraFeature from '../components/CameraFeature';
import CameraPermissionRequest from '../components/CameraPermissionRequest';

export default function CameraDemoScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [showPermissionDemo, setShowPermissionDemo] = useState(false);
  const [cameraResult, setCameraResult] = useState<string | null>(null);

  const handleCameraComplete = (result: any) => {
    setShowCamera(false);
    setCameraResult('Camera feature completed successfully!');
    Alert.alert('Success', 'Camera feature completed!');
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const handlePermissionGranted = () => {
    setShowPermissionDemo(false);
    Alert.alert('Permission Granted', 'Camera permission has been granted!');
  };

  const handlePermissionDenied = () => {
    setShowPermissionDemo(false);
    Alert.alert('Permission Denied', 'Camera permission was denied.');
  };

  if (showCamera) {
    return (
      <CameraFeature
        onComplete={handleCameraComplete}
        onCancel={handleCameraCancel}
        title="Document Scanner"
        description="Scan your documents for verification"
      />
    );
  }

  if (showPermissionDemo) {
    return (
      <CameraPermissionRequest
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={handlePermissionDenied}
        title="Camera Access Required"
        description="We need camera access to scan documents and perform identity verification."
        buttonText="Enable Camera Access"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Camera Permission Demo</Text>
          <Text style={styles.subtitle}>
            This demo shows how to implement camera permission requests in your app
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permission Flow</Text>
          <Text style={styles.sectionDescription}>
            Test the camera permission request flow with different scenarios
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowPermissionDemo(true)}
          >
            <Camera size={20} color="#ffffff" />
            <Text style={styles.buttonText}>Test Permission Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camera Features</Text>
          <Text style={styles.sectionDescription}>
            Try different camera features with permission handling
          </Text>

          <View style={styles.featureGrid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => setShowCamera(true)}
            >
              <Camera size={32} color="#e06262" />
              <Text style={styles.featureTitle}>Document Scanner</Text>
              <Text style={styles.featureDescription}>
                Scan documents for verification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => Alert.alert('Coming Soon', 'QR Code scanner will be available soon!')}
            >
              <QrCode size={32} color="#e06262" />
              <Text style={styles.featureTitle}>QR Code Scanner</Text>
              <Text style={styles.featureDescription}>
                Scan QR codes for payments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => Alert.alert('Coming Soon', 'Identity verification will be available soon!')}
            >
              <UserCheck size={32} color="#e06262" />
              <Text style={styles.featureTitle}>Identity Verification</Text>
              <Text style={styles.featureDescription}>
                Verify your identity with camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => Alert.alert('Coming Soon', 'Photo capture will be available soon!')}
            >
              <FileImage size={32} color="#e06262" />
              <Text style={styles.featureTitle}>Photo Capture</Text>
              <Text style={styles.featureDescription}>
                Take photos for your profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {cameraResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Last Result</Text>
            <Text style={styles.resultText}>{cameraResult}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Implementation Guide</Text>
          <Text style={styles.sectionDescription}>
            How to use the camera permission components in your app:
          </Text>
          
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`// 1. Import the components
import CameraPermissionRequest from './components/CameraPermissionRequest';
import CameraFeature from './components/CameraFeature';

// 2. Use the permission request component
<CameraPermissionRequest
  onPermissionGranted={handleGranted}
  onPermissionDenied={handleDenied}
  title="Custom Title"
  description="Custom description"
/>

// 3. Use the camera feature component
<CameraFeature
  onComplete={handleComplete}
  onCancel={handleCancel}
  title="Feature Title"
  description="Feature description"
/>`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#e06262',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  resultSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: '#0369a1',
  },
  codeBlock: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  codeText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
}); 