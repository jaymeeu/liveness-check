import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera, CircleCheck as CheckCircle, RotateCcw } from 'lucide-react-native';

interface LivenessCheckProps {
  onComplete: () => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');

const LIVENESS_STEPS = [
  { id: 1, instruction: 'Look straight at the camera', icon: '👀' },
  { id: 2, instruction: 'Nod your head up and down', icon: '👆👇' },
  { id: 3, instruction: 'Open your mouth wide', icon: '😮' },
  { id: 4, instruction: 'Turn your head left, then right', icon: '↔️' },
];

export default function LivenessCheck({ onComplete, onCancel }: LivenessCheckProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepCompleted, setStepCompleted] = useState<boolean[]>(new Array(LIVENESS_STEPS.length).fill(false));
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);

  const handleStepComplete = () => {
    const newCompleted = [...stepCompleted];
    newCompleted[currentStep] = true;
    setStepCompleted(newCompleted);

    if (currentStep < LIVENESS_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          'Verification Complete',
          'Liveness check passed successfully!',
          [{ text: 'OK', onPress: onComplete }]
        );
      }, 2000);
    }
  };

  
  useEffect(() => {
    if (currentStep < LIVENESS_STEPS.length) {
      const timer = setTimeout(() => {
        handleStepComplete();
      }, 3000); // Auto-complete each step after 3 seconds for demo

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#94a3b8" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to perform liveness verification for high-value transfers
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  const resetCheck = () => {
    setCurrentStep(0);
    setStepCompleted(new Array(LIVENESS_STEPS.length).fill(false));
    setIsProcessing(false);
  };

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
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.overlay}>
            <View style={styles.faceFrame} />
          </View>
        </CameraView>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.stepCounter}>
          Step {currentStep + 1} of {LIVENESS_STEPS.length}
        </Text>
        <View style={styles.currentInstruction}>
          <Text style={styles.instructionIcon}>
            {LIVENESS_STEPS[currentStep]?.icon}
          </Text>
          <Text style={styles.instructionText}>
            {LIVENESS_STEPS[currentStep]?.instruction}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        {LIVENESS_STEPS.map((step, index) => (
          <View
            key={step.id}
            style={[
              styles.progressStep,
              index === currentStep && styles.activeStep,
              stepCompleted[index] && styles.completedStep,
            ]}
          >
            {stepCompleted[index] ? (
              <CheckCircle size={16} color="#fff" />
            ) : (
              <Text style={styles.progressStepText}>{index + 1}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.resetButton} onPress={resetCheck}>
          <RotateCcw size={20} color="#94a3b8" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel Transfer</Text>
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
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  resetButtonText: {
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