import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Upload, FileText, CircleCheck as CheckCircle, X } from 'lucide-react-native';
// import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface DocumentUploadProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function DocumentUpload({ onComplete, onCancel }: DocumentUploadProps) {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadDocument = async () => {
    if (!selectedDocument) {
      Alert.alert('Error', 'Please select a document first');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      Alert.alert(
        'Success', 
        'Document uploaded and verified successfully!',
        [{ text: 'OK', onPress: onComplete }]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Verification Required</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        For transfers between $50 - $200, please upload your driver's license or international passport
      </Text>

      <View style={styles.uploadArea}>
        {selectedDocument ? (
          <View style={styles.selectedDocument}>
            <Image source={{ uri: selectedDocument.uri }} style={styles.documentImage} />
            <View style={styles.documentInfo}>
              <CheckCircle size={20} color="#16A34A" />
              <Text style={styles.documentName}>Document Selected</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Upload size={48} color="#94a3b8" />
            <Text style={styles.uploadText}>Tap to select document</Text>
            <Text style={styles.uploadSubtext}>
              Driver's License or International Passport
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.requirements}>
        <Text style={styles.requirementsTitle}>Requirements:</Text>
        <Text style={styles.requirementItem}>• Clear, readable image</Text>
        <Text style={styles.requirementItem}>• All corners visible</Text>
        <Text style={styles.requirementItem}>• Valid government-issued ID</Text>
        <Text style={styles.requirementItem}>• Not expired</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.uploadActionButton,
            (!selectedDocument || isUploading) && styles.disabledButton
          ]}
          onPress={uploadDocument}
          disabled={!selectedDocument || isUploading}
        >
          <Text style={styles.uploadActionButtonText}>
            {isUploading ? 'Uploading...' : 'Upload & Verify'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#1e293b',
    // borderRadius: 16,
    // padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#9eacc3',

    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  selectedDocument: {
    alignItems: 'center',
  },
  documentImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#16A34A',
    marginLeft: 8,
  },
  requirements: {
    
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#1e293b',

  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#e1e5ec',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: '#bac7d8',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  uploadActionButton: {
    backgroundColor: '#1E40AF',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  cancelButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  uploadActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});