# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Preserve line numbers for debugging
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# AWS Amplify Framework - Complete preservation
-keep class com.amplifyframework.** { *; }
-keep interface com.amplifyframework.** { *; }
-keep enum com.amplifyframework.** { *; }

# AWS SDK and related classes
-keep class com.amazonaws.** { *; }
-keep class software.amazon.awssdk.** { *; }
-keep class org.apache.commons.logging.** { *; }

# AWS Cognito and Identity
-keep class com.amazonaws.auth.** { *; }
-keep class com.amazonaws.services.cognitoidentity.** { *; }
-keep class com.amazonaws.services.cognitoidp.** { *; }

# AWS Rekognition (for Face Liveness)
-keep class com.amazonaws.services.rekognition.** { *; }

# Face Liveness UI components
-keep class com.amplifyframework.ui.liveness.** { *; }
-keep interface com.amplifyframework.ui.liveness.** { *; }

# Custom FaceLiveness module
-keep class com.jaymeeu.livenesscheck.liveness.** { *; }

# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }

# Jetpack Compose - Critical for Face Liveness UI
-keep class androidx.compose.** { *; }
-keep class androidx.activity.compose.** { *; }
-keep class androidx.compose.ui.** { *; }
-keep class androidx.compose.runtime.** { *; }
-keep class androidx.compose.foundation.** { *; }
-keep class androidx.compose.material3.** { *; }

# Kotlin and Coroutines
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }
-keep class kotlinx.coroutines.** { *; }

# Camera and Media
-keep class androidx.camera.** { *; }
-keep class android.media.** { *; }

# Prevent obfuscation of native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep React Native bridge methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep event emitter methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod addListener(...);
    @com.facebook.react.bridge.ReactMethod removeListeners(...);
}

# Keep all classes with @Keep annotation
-keep @androidx.annotation.Keep class * { *; }
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# Serialization
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Gson (if used by AWS SDK)
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# OkHttp (used by AWS SDK)
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Jackson (used by AWS SDK)
-keep class com.fasterxml.jackson.** { *; }

# Don't warn about missing classes that are not used
-dontwarn com.amplifyframework.**
-dontwarn com.amazonaws.**
-dontwarn software.amazon.awssdk.**
-dontwarn org.apache.commons.logging.**