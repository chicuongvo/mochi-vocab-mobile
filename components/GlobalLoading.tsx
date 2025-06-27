import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

export default function GlobalLoading() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/animations/cat_animation.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, 
  },
});
