import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Lock, Mail, User } from "lucide-react-native";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#9B59B6", "#8E44AD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Join the Journey! 🚀</Text>
          <Text style={styles.headerSubtitle}>
            Create an account to start learning with Mochi & Michi!
          </Text>
          <View style={styles.mascotContainer}>
            <Image
              source={require("../../assets/images/Logo_MochiApp.png")} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </LinearGradient>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <User size={20} color="#7F8C8D" />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#95A5A6"
          />
        </View>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#7F8C8D" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#95A5A6"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#7F8C8D" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#95A5A6"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color="#7F8C8D" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#95A5A6"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={() => router.replace("/(tabs)")}>
          <LinearGradient
            colors={["#9B59B6", "#8E44AD"]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("./login")}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 20,
  },
  mascotContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 10,
  },
  mascot: {
    fontSize: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 10,
  },
  registerButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loginPrompt: { 
    flexDirection: "row",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  loginLink: {
    fontSize: 14,
    color: "#9B59B6",
    fontWeight: "600",
  },
  logo: {
  width: 100,
  height: 100,
  borderRadius: 20, 
},
});