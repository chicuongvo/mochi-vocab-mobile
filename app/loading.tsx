import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Sau khi auth context đã load xong
      const timer = setTimeout(() => {
        if (user) {
          // Đã đăng nhập -> đi đến tabs
          router.replace("/(tabs)");
        } else {
          // Chưa đăng nhập -> đi đến login
          router.replace("/(auth)/login");
        }
      }, 2000); // Giảm thời gian loading để UX tốt hơn

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={require("../assets/animations/cat_animation.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.title}>Mochi App Loading...🍡🐱</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc75f",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6C3483",
    marginTop: 24,
    textAlign: "center",
  },
});
