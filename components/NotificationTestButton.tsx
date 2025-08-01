import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { testNotification } from '../app/_layout';

const NotificationTestButton = () => {
  return (
    <TouchableOpacity style={styles.button} onPress={testNotification}>
      <Text style={styles.buttonText}>Test Notification</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationTestButton;