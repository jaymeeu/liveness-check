package com.jaymeeu.livenesscheck.liveness

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.amplifyframework.ui.liveness.ui.FaceLivenessDetector
// import com.amplifyframework.ui.liveness.ui.theme.LivenessColorScheme
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import androidx.activity.ComponentActivity
import android.os.Bundle
import androidx.activity.compose.setContent
import com.jaymeeu.livenesscheck.BuildConfig
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.activity.result.contract.ActivityResultContracts

class FaceLivenessModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        var sharedReactContext: ReactApplicationContext? = null
    }

    init {
        sharedReactContext = reactContext
    }

    override fun getName(): String = "FaceLiveness"

    @ReactMethod
    fun startLivenessCheck(sessionId: String, region: String) {
        Log.d("FaceLivenessModule", "startLivenessCheck called with sessionId: $sessionId, region: $region")
        
        val activity = currentActivity
        if (activity == null) {
            Log.e("FaceLivenessModule", "Current activity is null, cannot start liveness check")
            sendEvent("LivenessError", "Activity not available")
            return
        }
        
        Log.d("FaceLivenessModule", "Current activity: ${activity.javaClass.simpleName}")
        
        try {
            val intent = Intent(activity, LivenessActivity::class.java)
            intent.putExtra("sessionId", sessionId)
            intent.putExtra("region", region)
            Log.d("FaceLivenessModule", "Starting LivenessActivity with intent")
            activity.startActivity(intent)
            Log.d("FaceLivenessModule", "LivenessActivity started successfully")
        } catch (e: Exception) {
            Log.e("FaceLivenessModule", "Failed to start liveness check", e)
            sendEvent("LivenessError", "Failed to start liveness check: ${e.message}")
        }
    }

    private fun sendEvent(eventName: String, data: String?) {
        try {
            Log.d("FaceLivenessModule", "📡 Attempting to send event: $eventName with data: $data")
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, data)
            Log.d("FaceLivenessModule", "✅ Event sent successfully: $eventName")
        } catch (e: Exception) {
            Log.e("FaceLivenessModule", "❌ Failed to send event: $eventName", e)
        }
    }

    // Add these methods to support NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String) {
        Log.d("FaceLivenessModule", "🎧 JS requested to add listener for event: $eventName")
        // Required for RN event emitter, can be left empty
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        Log.d("FaceLivenessModule", "🧹 JS requested to remove $count listeners")
        // Required for RN event emitter, can be left empty
    }
}

class LivenessActivity : ComponentActivity() {
    private lateinit var sessionId: String
    private lateinit var region: String
    
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Log.d("LivenessActivity", "✅ Camera permission granted")
            // Verify AWS credentials before starting liveness check
            checkAwsCredentialsAndStartLiveness(sessionId, region)
        } else {
            Log.e("LivenessActivity", "❌ Camera permission denied")
            sendEvent("LivenessError", "Camera permission is required for liveness check")
            finish()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        Log.d("LivenessActivity", "onCreate called")
        
        sessionId = intent.getStringExtra("sessionId") ?: ""
        region = intent.getStringExtra("region") ?: ""
        
        Log.d("LivenessActivity", "Starting liveness with sessionId: $sessionId, region: $region")
        
        if (sessionId.isEmpty() || region.isEmpty()) {
            Log.e("LivenessActivity", "Missing sessionId or region")
            sendEvent("LivenessError", "Missing sessionId or region")
            finish()
            return
        }
        
        // Check and request camera permission first
        checkCameraPermission()
    }
    
    private fun checkCameraPermission() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                Log.d("LivenessActivity", "✅ Camera permission already granted")
                // Permission already granted, proceed with liveness check
                checkAwsCredentialsAndStartLiveness(sessionId, region)
            }
            else -> {
                Log.d("LivenessActivity", "📱 Requesting camera permission")
                // Request camera permission
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }
    
    private fun checkAwsCredentialsAndStartLiveness(sessionId: String, region: String) {
        try {
            Log.d("LivenessActivity", "🔍 Checking AWS credentials for sessionId: $sessionId")
            Log.d("LivenessActivity", "🌍 Target region: $region")
            Log.d("LivenessActivity", "📱 Device model: ${android.os.Build.MODEL}")
            Log.d("LivenessActivity", "📱 Android version: ${android.os.Build.VERSION.RELEASE}")
            
            // Check if we have valid AWS credentials
            com.amplifyframework.core.Amplify.Auth.fetchAuthSession(
                { session ->
                    Log.d("LivenessActivity", "✅ Auth session fetched successfully")
                    Log.d("LivenessActivity", "🔐 Is signed in: ${session.isSignedIn}")
                    Log.d("LivenessActivity", "📋 Session type: ${session.javaClass.simpleName}")
                    
                    // Try to get AWS credentials to verify they're available
                    try {
                        if (session is com.amplifyframework.auth.cognito.AWSCognitoAuthSession) {
                            val awsCredentials = session.awsCredentialsResult
                            Log.d("LivenessActivity", "🔑 AWS Credentials status: ${awsCredentials.type}")
                            
                            when (awsCredentials.type) {
                                com.amplifyframework.auth.result.AuthSessionResult.Type.SUCCESS -> {
                                    Log.d("LivenessActivity", "✅ AWS credentials are valid")
                                    Log.d("LivenessActivity", "🚀 Starting Face Liveness with Session ID: $sessionId, Region: $region")
                                    startFaceLivenessDetector(sessionId, region)
                                }
                                com.amplifyframework.auth.result.AuthSessionResult.Type.FAILURE -> {
                                    val credError = awsCredentials.error
                                    Log.e("LivenessActivity", "❌ AWS credentials failed: ${credError?.message}")
                                    sendEvent("LivenessError", "AWS credentials not available: ${credError?.message}")
                                    finish()
                                }
                                else -> {
                                    Log.w("LivenessActivity", "⚠️ AWS credentials status unknown, attempting to proceed")
                                    startFaceLivenessDetector(sessionId, region)
                                }
                            }
                        } else {
                            Log.w("LivenessActivity", "⚠️ Non-Cognito auth session, attempting to proceed")
                            startFaceLivenessDetector(sessionId, region)
                        }
                    } catch (credError: Exception) {
                        Log.e("LivenessActivity", "❌ Error checking AWS credentials", credError)
                        sendEvent("LivenessError", "Error verifying AWS credentials: ${credError.message}")
                        finish()
                    }
                },
                { error ->
                    val errorMsg = "❌ Failed to fetch auth session: ${error.message}"
                    Log.e("LivenessActivity", errorMsg, error)
                    Log.e("LivenessActivity", "❌ Error type: ${error.javaClass.simpleName}")
                    Log.e("LivenessActivity", "❌ Error cause: ${(error as? Throwable)?.cause?.message ?: "No cause available"}")
                    
                    // Provide more specific error messages
                    val userFriendlyError = when {
                        error.message?.contains("network", ignoreCase = true) == true -> 
                            "Network connection issue. Please check your internet connection."
                        error.message?.contains("timeout", ignoreCase = true) == true -> 
                            "Connection timeout. Please try again."
                        error.message?.contains("ssl", ignoreCase = true) == true -> 
                            "SSL/TLS connection issue. Please check your network settings."
                        else -> "Authentication failed: ${error.message}"
                    }
                    
                    sendEvent("LivenessError", userFriendlyError)
                    finish()
                }
            )
        } catch (e: Exception) {
            val errorMsg = "❌ Exception during AWS credential check: ${e.message}"
            Log.e("LivenessActivity", errorMsg, e)
            Log.e("LivenessActivity", "❌ Exception type: ${e.javaClass.simpleName}")
            Log.e("LivenessActivity", "❌ Stack trace: ${e.stackTrace.take(5).joinToString("\n")}")
            sendEvent("LivenessError", "Initialization error: ${e.message}")
            finish()
        }
    }
    
    private fun startFaceLivenessDetector(sessionId: String, region: String) {
        // Ensure we're on the main UI thread
        runOnUiThread {
            try {
                Log.d("LivenessActivity", "🚀 Initializing FaceLivenessDetector on UI thread")
                Log.d("LivenessActivity", "📱 Build type: ${if (BuildConfig.DEBUG) "DEBUG" else "RELEASE"}")
                Log.d("LivenessActivity", "🔑 Session ID: $sessionId")
                Log.d("LivenessActivity", "🌍 Region: $region")
                Log.d("LivenessActivity", "📱 Device: ${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}")
                Log.d("LivenessActivity", "🔧 API Level: ${android.os.Build.VERSION.SDK_INT}")
                
                // Validate session ID format
                if (sessionId.isBlank() || sessionId.length < 10) {
                    Log.e("LivenessActivity", "❌ Invalid session ID format: '$sessionId'")
                    sendEvent("LivenessError", "Invalid session ID format")
                    finish()
                    return@runOnUiThread
                }
                
                // Validate region format
                if (!region.matches(Regex("^[a-z]{2}-[a-z]+-\\d+$"))) {
                    Log.e("LivenessActivity", "❌ Invalid region format: '$region'")
                    sendEvent("LivenessError", "Invalid region format")
                    finish()
                    return@runOnUiThread
                }
                
                setContent {
                    Log.d("LivenessActivity", "🎨 Setting Compose content for FaceLivenessDetector")
                    FaceLivenessDetector(
                        sessionId = sessionId,
                        region = region,
                        onComplete = {
                            Log.d("LivenessActivity", "✅ Liveness completed successfully")
                            sendEvent("LivenessComplete", "Success")
                            finish()
                        },
                        onError = { error ->
                            Log.e("LivenessActivity", "❌ FaceLivenessDetector error: ${error.message}")
                            Log.e("LivenessActivity", "❌ Error type: ${error.javaClass.simpleName}")
                            Log.e("LivenessActivity", "❌ Error cause: ${(error as? Throwable)?.cause?.message ?: "No cause available"}")
                            
                            // Provide more specific error messages based on common issues
                            val userFriendlyError = when {
                                error.message?.contains("Failed to start the face liveness session", ignoreCase = true) == true -> {
                                    Log.e("LivenessActivity", "❌ Session start failure - possible causes:")
                                    Log.e("LivenessActivity", "   - Invalid session ID: $sessionId")
                                    Log.e("LivenessActivity", "   - Network connectivity issues")
                                    Log.e("LivenessActivity", "   - AWS service unavailable")
                                    Log.e("LivenessActivity", "   - Region mismatch: $region")
                                    "Failed to start face liveness session. Please check your network connection and try again."
                                }
                                error.message?.contains("network", ignoreCase = true) == true -> 
                                    "Network error during liveness check. Please check your internet connection."
                                error.message?.contains("camera", ignoreCase = true) == true -> 
                                    "Camera access error. Please ensure camera permissions are granted."
                                error.message?.contains("timeout", ignoreCase = true) == true -> 
                                    "Connection timeout. Please try again with a stable internet connection."
                                else -> error.message ?: "Unknown liveness error occurred"
                            }
                            
                            sendEvent("LivenessError", userFriendlyError)
                            finish()
                        }
                    )
                    Log.d("LivenessActivity", "🎨 FaceLivenessDetector Compose content set successfully")
                }
                Log.d("LivenessActivity", "✅ FaceLivenessDetector initialization completed")
            } catch (e: Exception) {
                Log.e("LivenessActivity", "💥 Failed to initialize FaceLivenessDetector", e)
                Log.e("LivenessActivity", "💥 Exception type: ${e.javaClass.simpleName}")
                Log.e("LivenessActivity", "💥 Exception message: ${e.message}")
                Log.e("LivenessActivity", "💥 Exception cause: ${e.cause?.message}")
                
                val errorMsg = when {
                    e.message?.contains("Compose", ignoreCase = true) == true -> 
                        "UI initialization error. Please restart the app."
                    e.message?.contains("Context", ignoreCase = true) == true -> 
                        "App context error. Please restart the app."
                    else -> "Failed to initialize liveness detector: ${e.message}"
                }
                
                sendEvent("LivenessError", errorMsg)
                finish()
            }
        }
    }

    private fun sendEvent(eventName: String, data: String?) {
        try {
            val reactContext = FaceLivenessModule.sharedReactContext
            if (reactContext != null) {
                Log.d("LivenessActivity", "Sending event: $eventName with data: $data")
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit(eventName, data)
            } else {
                Log.e("LivenessActivity", "ReactContext is null, cannot send event: $eventName")
            }
        } catch (e: Exception) {
            Log.e("LivenessActivity", "Failed to send event: $eventName", e)
        }
    }
}
