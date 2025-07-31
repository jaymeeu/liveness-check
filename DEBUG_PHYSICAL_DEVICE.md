# Debug Guide: Face Liveness on Physical Device

## Changes Made

### 1. Enhanced Error Handling
- Added detailed logging throughout the liveness flow
- Better error messages for common failure scenarios
- Network connectivity checks
- AWS credential validation

### 2. Network Configuration
- Fixed network security config to allow Metro bundler (localhost)
- Added proper AWS endpoint configuration
- Added additional network permissions

### 3. Validation Improvements
- Session ID format validation
- Region format validation
- Module availability checks

## Debugging Steps

### Step 1: Check Logs
Run this command to see detailed logs:
```bash
adb logcat -s "LivenessApp" "LivenessActivity" "FaceLivenessModule"
```

### Step 2: Look for These Key Log Messages

**✅ Success Indicators:**
- `✅ Amplify initialized successfully`
- `✅ AWS credentials are ready`
- `✅ Auth session fetched successfully`
- `🚀 Starting Face Liveness with Session ID`

**❌ Failure Indicators:**
- `❌ Failed to fetch auth session`
- `❌ AWS credentials failed`
- `❌ Failed to start the face liveness session`

### Step 3: Common Issues & Solutions

#### Issue 1: Network Connectivity
**Symptoms:** `network` or `timeout` errors
**Solution:** 
- Ensure stable internet connection
- Try switching between WiFi and mobile data
- Check if corporate firewall is blocking AWS endpoints

#### Issue 2: AWS Credential Issues
**Symptoms:** `AWS credentials failed` or `Authentication failed`
**Solution:**
- Verify Amplify configuration is correct
- Check if Identity Pool allows unauthenticated access
- Ensure region matches your AWS setup

#### Issue 3: Session ID Issues
**Symptoms:** `Invalid session ID format`
**Solution:**
- Verify your API is returning a valid session ID
- Check session ID is not empty or malformed

#### Issue 4: Device-Specific Issues
**Symptoms:** Works on emulator but not physical device
**Solution:**
- Check device date/time is correct
- Ensure device has sufficient storage
- Try on different physical device to isolate issue

### Step 4: Test Network Connectivity
```bash
# Test if device can reach AWS endpoints
adb shell ping cognito-identity.eu-west-1.amazonaws.com
adb shell ping rekognition.eu-west-1.amazonaws.com
```

### Step 5: Verify Permissions
Ensure these permissions are granted:
- Camera
- Internet access
- Network state access

## Next Steps

1. **Build and install** the updated app on your physical device
2. **Run the debug command** above while testing
3. **Share the logs** that show the specific error
4. **Try the solutions** based on the error patterns you see

The enhanced logging will help us pinpoint exactly where the failure occurs on your physical device.