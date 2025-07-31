eas build -p android --profile preview



./gradlew assembleRelease


adb logcat -s "LivenessApp" "LivenessActivity" "FaceLivenessModule"
