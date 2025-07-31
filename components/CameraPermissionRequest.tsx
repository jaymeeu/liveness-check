import { AlertCircle, Camera, Settings } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCameraPermission } from '../hooks/useCameraPermission';

interface CameraPermissionRequestProps {
  onPermissionGranted: () => void;
  onPermissionDenied?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  settingsButtonText?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CameraPermissionRequest({
  onPermissionGranted,
  onPermissionDenied,
  title = 'Camera Access Required',
  description = 'We need camera access to provide you with the best experience for this feature.',
  buttonText = 'Grant Permission',
  settingsButtonText = 'Open Settings',
}: CameraPermissionRequestProps) {
  const {
    granted,
    canAskAgain,
    loading,
    error,
    requestPermission,
    showSettingsAlert,
  } = useCameraPermission();

  React.useEffect(() => {
    if (granted) {
      onPermissionGranted();
    }
  }, [granted, onPermissionGranted]);

  const handleRequestPermission = async () => {
    if (canAskAgain) {
      await requestPermission();
    } else {
      showSettingsAlert();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#e06262" />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertCircle size={64} color="#ef4444" />
          </View>
          <Text style={styles.title}>Permission Error</Text>
          <Text style={styles.description}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!canAskAgain) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Settings size={64} color="#94a3b8" />
          </View>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.description}>
            Camera access is required for this feature. Please enable it in your device settings.
          </Text>
          <TouchableOpacity style={styles.button} onPress={showSettingsAlert}>
            <Text style={styles.buttonText}>{settingsButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Camera size={64} color="#e06262" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#e06262',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
}); 