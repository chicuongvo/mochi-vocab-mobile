// components/exercises/MatchingExercise.tsx
import { Exercise } from "@/types/lesson";
import { playSound } from "@/utils/playSound";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface MatchingExerciseProps {
  exercise: Exercise;
  onComplete: (isCorrect: boolean) => void;
}

interface Connection {
  wordIndex: number;
  definitionIndex: number;
}

const { width } = Dimensions.get("window");

export default function MatchingExercise({ exercise, onComplete }: MatchingExerciseProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const definitionPositions = useRef<{ [key: number]: { x: number; y: number } }>({});

  const words = exercise.matchingWords || [];
  const definitions = exercise.matchingDefinitions || [];

  // Kiểm tra kết quả
  const checkAnswers = () => {
    if (connections.length !== 4) {
      Alert.alert("Lỗi", "Vui lòng nối tất cả các từ với định nghĩa!");
      return;
    }

    const isCorrect = connections.every(
      (conn) => words[conn.wordIndex].definition === definitions[conn.definitionIndex]
    );

    playSound(isCorrect ? "correct" : "wrong");
    Alert.alert(
      isCorrect ? "Chính xác! 🎉" : "Sai rồi! 😔",
      isCorrect ? "Bạn đã nối đúng tất cả!" : "Hãy thử lại hoặc xem đáp án.",
      [
        {
          text: "Tiếp tục",
          onPress: () => onComplete(isCorrect), // Gọi callback onComplete
        },
      ]
    );
  };

  // Xử lý khi nhấn vào từ
  const handleWordPress = (index: number) => {
    if (selectedWordIndex === null) {
      setSelectedWordIndex(index);
    }
  };

  // Xử lý khi nhấn vào định nghĩa
  const handleDefinitionPress = (definitionIndex: number) => {
    if (selectedWordIndex !== null) {
      const existingConnection = connections.find(
        (conn) => conn.wordIndex === selectedWordIndex
      );
      if (existingConnection) {
        setConnections(connections.filter((conn) => conn.wordIndex !== selectedWordIndex));
      }
      setConnections([...connections, { wordIndex: selectedWordIndex, definitionIndex }]);
      setSelectedWordIndex(null);
    }
  };

  // Lưu vị trí của các định nghĩa
  const onDefinitionLayout = (index: number, event: any) => {
    const { x, y } = event.nativeEvent.layout;
    definitionPositions.current[index] = { x: x + width / 4, y: y + 20 };
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FF6B9D", "#FF8C42"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Nối từ với định nghĩa</Text>
        <Text style={styles.headerSubtitle}>Nhấn để nối đúng cặp từ - định nghĩa</Text>
      </LinearGradient>

      <View style={styles.exerciseContainer}>
        {/* Cột từ vựng */}
        <View style={styles.wordColumn}>
          {words.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordCard,
                selectedWordIndex === index && styles.selectedWord,
              ]}
              onPress={() => handleWordPress(index)}
            >
              <Text style={styles.wordText}>{word.word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cột định nghĩa */}
        <View style={styles.definitionColumn}>
          {definitions.map((definition, index) => (
            <TouchableOpacity
              key={index}
              style={styles.definitionCard}
              onPress={() => handleDefinitionPress(index)}
              onLayout={(event) => onDefinitionLayout(index, event)}
            >
              <Text style={styles.definitionText}>{definition}</Text>
计
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={checkAnswers}>
        <LinearGradient
          colors={["#2ECC71", "#27AE60"]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.buttonText}>Kiểm tra</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginTop: 8,
  },
  exerciseContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  wordColumn: {
    flex: 1,
    marginRight: 10,
  },
  definitionColumn: {
    flex: 1,
    marginLeft: 10,
  },
  wordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedWord: {
    borderWidth: 2,
    borderColor: "#FF6B9D",
  },
  wordText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  definitionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  definitionText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  submitButton: {
    width: "90%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignSelf: "center",
    marginBottom: 20,
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
});