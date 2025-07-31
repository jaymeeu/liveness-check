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
        val activity = currentActivity
        if (activity == null) {
            Log.e("FaceLivenessModule", "Current activity is null, cannot start liveness check")
            sendEvent("LivenessError", "Activity not available")
            return
        }
        
        try {
            val intent = Intent(activity, LivenessActivity::class.java)
            intent.putExtra("sessionId", sessionId)
            intent.putExtra("region", region)
            activity.startActivity(intent)
        } catch (e: Exception) {
            Log.e("FaceLivenessModule", "Failed to start liveness check", e)
            sendEvent("LivenessError", "Failed to start liveness check: ${e.message}")
        }
    }

    private fun sendEvent(eventName: String, data: String?) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }

    // Add these methods to support NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter, can be left empty
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter, can be left empty
    }
}

class LivenessActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val sessionId = intent.getStringExtra("sessionId") ?: ""
        val region = intent.getStringExtra("region") ?: ""
        
        Log.d("LivenessActivity", "Starting liveness with sessionId: $sessionId, region: $region")
        
        // Verify AWS credentials before starting liveness check
        checkAwsCredentialsAndStartLiveness(sessionId, region)
    }
    
    private fun checkAwsCredentialsAndStartLiveness(sessionId: String, region: String) {
        try {
            Log.d("LivenessActivity", "Checking AWS credentials for sessionId: $sessionId")
            
            // Check if we have valid AWS credentials
            com.amplifyframework.core.Amplify.Auth.fetchAuthSession(
                { session ->
                    Log.d("LivenessActivity", "Auth session check - Is signed in: ${session.isSignedIn}")
                    Log.d("LivenessActivity", "Session type: ${session.javaClass.simpleName}")
                    
                    // Auth session is available, proceed with Face Liveness
                    Log.d("LivenessActivity", "✅ Auth session verified, starting Face Liveness")
                    Log.d("LivenessActivity", "Starting Face Liveness with Session ID: $sessionId, Region: $region")
                    startFaceLivenessDetector(sessionId, region)
                },
                { error ->
                    val errorMsg = "❌ Failed to verify AWS credentials: ${error.message}"
                    Log.e("LivenessActivity", errorMsg, error)
                    Log.e("LivenessActivity", "Error cause: ${error.cause?.message}")
                    sendEvent("LivenessError", errorMsg)
                    finish()
                }
            )
        } catch (e: Exception) {
            val errorMsg = "❌ Exception checking AWS credentials: ${e.message}"
            Log.e("LivenessActivity", errorMsg, e)
            sendEvent("LivenessError", errorMsg)
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
                            Log.e("LivenessActivity", "❌ Liveness error: ${error.message}")
                            Log.e("LivenessActivity", "❌ Error type: ${error.javaClass.simpleName}")
                            sendEvent("LivenessError", error.message ?: "Unknown error")
                            finish()
                        }
                    )
                    Log.d("LivenessActivity", "🎨 FaceLivenessDetector Compose content set successfully")
                }
                Log.d("LivenessActivity", "✅ FaceLivenessDetector initialization completed")
            } catch (e: Exception) {
                Log.e("LivenessActivity", "💥 Failed to initialize FaceLivenessDetector", e)
                Log.e("LivenessActivity", "💥 Exception type: ${e.javaClass.simpleName}")
                Log.e("LivenessActivity", "💥 Stack trace: ${e.stackTrace.joinToString("\n")}")
                sendEvent("LivenessError", "Failed to initialize liveness detector: ${e.message}")
                finish()
            }
        }
    }

    private fun sendEvent(eventName: String, data: String?) {
        val reactContext = FaceLivenessModule.sharedReactContext
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, data)
    }
}
