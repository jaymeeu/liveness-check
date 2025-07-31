import { useState, useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

export interface CameraPermissionState {
  granted: boolean;
  canAskAgain: boolean;
  loading: boolean;
  error: string | null;
}

export const useCameraPermission = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<CameraPermissionState>({
    granted: false,
    canAskAgain: true,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (permission) {
      setState({
        granted: permission.granted,
        canAskAgain: permission.canAskAgain,
        loading: false,
        error: null,
      });
    }
  }, [permission]);

  const requestCameraPermission = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await requestPermission();
      
      if (!result.granted) {
        setState({
          granted: false,
          canAskAgain: result.canAskAgain,
          loading: false,
          error: 'Camera permission denied',
        });

        if (!result.canAskAgain) {
          showSettingsAlert();
        }
      } else {
        setState({
          granted: true,
          canAskAgain: true,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({
        granted: false,
        canAskAgain: true,
        loading: false,
        error: 'Failed to request camera permission',
      });
    }
  };

  const showSettingsAlert = () => {
    Alert.alert(
      'Camera Permission Required',
      'Camera access is required for this feature. Please enable it in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const checkPermissionStatus = () => {
    if (!permission) {
      setState(prev => ({ ...prev, loading: true }));
      return;
    }

    if (!permission.granted) {
      if (!permission.canAskAgain) {
        showSettingsAlert();
      } else {
        requestCameraPermission();
      }
    }
  };

  return {
    ...state,
    requestPermission: requestCameraPermission,
    checkPermissionStatus,
    showSettingsAlert,
  };
}; 