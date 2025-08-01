import Notification from '@/components/Notification';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PushNotification from "react-native-push-notification";


// Test function to trigger a local notification
export const testNotification = () => {
  PushNotification.localNotification({
    title: "Test Notification",
    message: "This is a test notification with sound!",
    playSound: true,
    soundName: 'default',
    channelId: "default-channel",
    importance: "high",
    priority: "high",
    vibrate: true,
    vibration: 300,
    actions: ["View"],
    invokeApp: true,
  });
};


// Create notification channel
PushNotification.createChannel(
  {
    channelId: "default-channel", // (required)
    channelName: "Default Channel", // (required)
    channelDescription: "A default channel for notifications", // (optional) default: undefined.
    playSound: true, // (optional) default: true
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log("TOKEN:", token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);

    // If the notification is received in foreground, show it as a local notification
    if (notification.foreground) {
      PushNotification.localNotification({
        title: notification?.title || "New Notification",
        message: notification.message || notification.body || "You have a new message",
        playSound: true,
        soundName: 'default',
        channelId: "default-channel",
        importance: "high",
        priority: "high",
        vibrate: true,
        vibration: 300,
        actions: ["View"],
        invokeApp: true,
        userInfo: notification.data || {},
      });
    }

    // process the notification
    if (notification.finish) {
      notification.finish('backgroundFetchResultNoData');
    }
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log("ACTION:", notification.action);
    console.log("NOTIFICATION:", notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function(err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});

 function RootLayout() {
  useFrameworkReady();

  return (
    <NotificationProvider>
      <Notification />
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
    </NotificationProvider>

  );
}

export default RootLayout
