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
            Amplify.addPlugin(AWSCognitoAuthPlugin())
            Amplify.configure(applicationContext)
            Log.i("LivenessApp", "Initialized Amplify successfully")
            
            // Get guest credentials for unauthenticated access
            Amplify.Auth.fetchAuthSession(
                { session ->
                    Log.i("LivenessApp", "✅ Auth session fetched successfully")
                    Log.i("LivenessApp", "Is signed in: ${session.isSignedIn}")
                    Log.i("LivenessApp", "Session type: ${session.javaClass.simpleName}")
                    
                    // Check if we have AWS credentials (indicates Identity Pool is working)
                    Log.i("LivenessApp", "✅ Auth session obtained - Identity Pool should be working")
                    Log.i("LivenessApp", "Ready for Face Liveness authentication")
                },
                { error -> 
                    Log.e("LivenessApp", "❌ Failed to fetch auth session: ${error.message}", error)
                    Log.e("LivenessApp", "This will prevent Face Liveness from working properly")
                }
            )
        } catch (error: Exception) {
            Log.e("LivenessApp", "Could not initialize Amplify: ${error.message}", error)
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
}
