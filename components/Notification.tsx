import React, { useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNotification } from '../contexts/NotificationContext';

const Notification = () => {
  const { notification, hideNotification } = useNotification();
  const [visible, setVisible] = React.useState(false);
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (notification) {
      setVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      hideNotification();
      setVisible(false);
    });
  };

  if (!notification || !visible) return null;

  let backgroundColor = '#2563EB';
  if (notification.type === 'success') backgroundColor = '#16A34A';
  if (notification.type === 'error') backgroundColor = '#DC2626';

  return (
    <Animated.View style={[styles.container, { backgroundColor, transform: [{ translateY }] }]}> 
      <Text style={styles.message}>{notification.message}</Text>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    marginLeft: 16,
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 22,
  },
});

export default Notification; 