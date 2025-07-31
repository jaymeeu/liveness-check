package com.jaymeeu.livenesscheck

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

import com.amplifyframework.core.Amplify
import com.amplifyframework.auth.cognito.AWSCognitoAuthPlugin
import com.jaymeeu.livenesscheck.liveness.FaceLivenessPackage
import android.util.Log;

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
        this,
        object : DefaultReactNativeHost(this) {
          override fun getPackages(): List<ReactPackage> {
            val packages = PackageList(this).packages
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(MyReactNativePackage())

             packages.add(FaceLivenessPackage())
             
            return packages
          }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
          override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()

     try {
            Log.i("LivenessApp", "🚀 Starting Amplify initialization")
            Log.i("LivenessApp", "📱 Device: ${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}")
            Log.i("LivenessApp", "🔧 Android API: ${android.os.Build.VERSION.SDK_INT}")
            
            Amplify.addPlugin(AWSCognitoAuthPlugin())
            Amplify.configure(applicationContext)
            Log.i("LivenessApp", "✅ Amplify initialized successfully")
            
            // Add a small delay to ensure proper initialization
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                // Get guest credentials for unauthenticated access
                Amplify.Auth.fetchAuthSession(
                    { session ->
                        Log.i("LivenessApp", "✅ Auth session fetched successfully")
                        Log.i("LivenessApp", "🔐 Is signed in: ${session.isSignedIn}")
                        Log.i("LivenessApp", "📋 Session type: ${session.javaClass.simpleName}")
                        
                        // Check AWS credentials availability
                        if (session is com.amplifyframework.auth.cognito.AWSCognitoAuthSession) {
                            val credentialsResult = session.awsCredentialsResult
                            Log.i("LivenessApp", "🔑 AWS Credentials status: ${credentialsResult.type}")
                            
                            when (credentialsResult.type) {
                                com.amplifyframework.auth.result.AuthSessionResult.Type.SUCCESS -> {
                                    Log.i("LivenessApp", "✅ AWS credentials are ready")
                                    Log.i("LivenessApp", "🎯 Face Liveness is ready to use")
                                }
                                com.amplifyframework.auth.result.AuthSessionResult.Type.FAILURE -> {
                                    Log.e("LivenessApp", "❌ AWS credentials failed: ${credentialsResult.error?.message}")
                                }
                                else -> {
                                    Log.w("LivenessApp", "⚠️ AWS credentials status unknown")
                                }
                            }
                        }
                    },
                    { error -> 
                        Log.e("LivenessApp", "❌ Failed to fetch auth session: ${error.message}", error)
                        Log.e("LivenessApp", "❌ Error type: ${error.javaClass.simpleName}")
                        Log.e("LivenessApp", "❌ This may prevent Face Liveness from working on this device")
                        
                        // Log additional debugging info
                        Log.e("LivenessApp", "🔍 Network state: ${getNetworkInfo()}")
                    }
                )
            }, 1000) // 1 second delay
            
        } catch (error: Exception) {
            Log.e("LivenessApp", "💥 Could not initialize Amplify: ${error.message}", error)
            Log.e("LivenessApp", "💥 Error type: ${error.javaClass.simpleName}")
            Log.e("LivenessApp", "💥 This will prevent Face Liveness from working")
        }

    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
  
  private fun getNetworkInfo(): String {
    return try {
      val connectivityManager = getSystemService(android.content.Context.CONNECTIVITY_SERVICE) as android.net.ConnectivityManager
      val activeNetwork = connectivityManager.activeNetworkInfo
      if (activeNetwork?.isConnected == true) {
        "Connected (${activeNetwork.typeName})"
      } else {
        "Not connected"
      }
    } catch (e: Exception) {
      "Unknown (${e.message})"
    }
  }
}
