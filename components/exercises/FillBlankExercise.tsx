import { Exercise } from "@/types/lesson";
import { BookOpen, Volume2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FillBlankProps {
  exercise: Exercise;
  showAnswer: boolean;
  selectedOption: string | null;
  setSelectedOption: (option: string) => void;
}

export const FillBlankExercise: React.FC<FillBlankProps> = ({
  exercise,
  showAnswer,
  selectedOption,
  setSelectedOption,
}) => (
  <View style={styles.exerciseContainer}>
    <View style={styles.questionCard}>
      <View style={styles.exerciseHeader}>
        <BookOpen size={24} color="#9B59B6" />
        <Text style={styles.exerciseTitle}>
          Fill in the blank with IPA hint
        </Text>
      </View>

      <Text style={styles.sentenceText}>{exercise.blankedSentence}</Text>

      <View style={styles.ipaHintContainer}>
        <Text style={styles.ipaHintLabel}>Pronunciation hint:</Text>
        <Text style={styles.ipaHintText}>{exercise.ipaHint}</Text>
        <TouchableOpacity style={styles.audioButton}>
          <Volume2 size={16} color="#FFFFFF" />
          <Text style={styles.audioButtonText}>🔊 Hear pronunciation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.optionsContainer}>
        {exercise.options?.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === option && styles.selectedOption,
              showAnswer &&
                option === exercise.correctAnswer &&
                styles.correctOption,
              showAnswer &&
                selectedOption === option &&
                option !== exercise.correctAnswer &&
                styles.wrongOption,
            ]}
            onPress={() => !showAnswer && setSelectedOption(option)}
            disabled={showAnswer}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === option && styles.selectedOptionText,
                showAnswer &&
                  option === exercise.correctAnswer &&
                  styles.correctOptionText,
              ]}
            >
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showAnswer && (
        <View style={styles.answerReveal}>
          <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
          <Text style={styles.correctAnswerText}>{exercise.correctAnswer}</Text>
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    minHeight: 500,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 12,
  },
  sentenceText: {
    fontSize: 20,
    color: "#2C3E50",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 20,
  },
  ipaHintContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  ipaHintLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
    marginBottom: 4,
  },
  ipaHintText: {
    fontSize: 18,
    color: "#9B59B6",
    fontWeight: "bold",
    marginBottom: 8,
  },
  audioButton: {
    backgroundColor: "#FF6B9D",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  audioButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: "#FF6B9D",
    backgroundColor: "rgba(255, 107, 157, 0.1)",
  },
  correctOption: {
    borderColor: "#2ECC71",
    backgroundColor: "rgba(46, 204, 113, 0.1)",
  },
  wrongOption: {
    borderColor: "#E74C3C",
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  optionText: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 22,
  },
  selectedOptionText: {
    color: "#FF6B9D",
    fontWeight: "600",
  },
  correctOptionText: {
    color: "#2ECC71",
    fontWeight: "600",
  },
  answerReveal: {
    marginTop: 20,
    alignItems: "center",
  },
  correctAnswerLabel: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ECC71",
  },
});
