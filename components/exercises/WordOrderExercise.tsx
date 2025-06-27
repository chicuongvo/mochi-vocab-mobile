import { Exercise } from "@/types/lesson";
import {
  createPanResponder,
  DragDropHandlers,
  DragDropState,
} from "@/utils/dragDropHelpers";
import { Move } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface WordOrderProps {
  exercise: Exercise;
  showAnswer: boolean;
  wordOrder: string[];
  dragDropState: DragDropState;
  dragDropHandlers: DragDropHandlers;
  handleWordLayout: (index: number, event: any) => void;
}

export const WordOrderExercise: React.FC<WordOrderProps> = ({
  exercise,
  showAnswer,
  wordOrder,
  dragDropState,
  dragDropHandlers,
  handleWordLayout,
}) => (
  <View style={styles.exerciseContainer}>
    <View style={styles.questionCard}>
      <View style={styles.exerciseHeader}>
        <Move size={24} color="#2ECC71" />
        <Text style={styles.exerciseTitle}>Arrange the sentence</Text>
      </View>

      <Text style={styles.instructionText}>
        Drag and drop the words to form the correct sentence:
      </Text>

      <View style={styles.wordOrderContainer}>
        {wordOrder.map((word, index) => {
          const panResponder = createPanResponder(
            index,
            dragDropState,
            dragDropHandlers
          );
          const isDraggedWord = dragDropState.draggedWordIndex === index;
          const isDropZone = dragDropState.dropZoneIndex === index;

          return (
            <Animated.View
              key={`${word}-${index}`}
              style={[
                styles.wordChip,
                isDraggedWord && styles.draggedWordChip,
                isDropZone && styles.dropZoneWordChip,
                showAnswer && styles.disabledWordChip,
                isDraggedWord && {
                  transform: [
                    { translateX: dragDropState.draggedWordPosition.x },
                    { translateY: dragDropState.draggedWordPosition.y },
                  ],
                  zIndex: 1000,
                  elevation: 10,
                },
              ]}
              onLayout={event => handleWordLayout(index, event)}
              {...(showAnswer ? {} : panResponder.panHandlers)}
            >
              <Text
                style={[
                  styles.wordChipText,
                  isDraggedWord && styles.draggedWordChipText,
                  isDropZone && styles.dropZoneWordChipText,
                ]}
              >
                {word}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {showAnswer && (
        <View style={styles.answerReveal}>
          <Text style={styles.correctAnswerLabel}>Correct sentence:</Text>
          <Text style={styles.correctAnswerText}>{exercise.correctAnswer}</Text>
        </View>
      )}

      {/* Drag and drop instructions */}
      <View style={styles.dragInstructions}>
        <Text style={styles.dragInstructionsText}>
          💡{" "}
          {dragDropState.isDragging
            ? "Release to drop the word"
            : "Hold and drag words to reorder them"}
        </Text>
      </View>

      {/* Michi encouragement */}
      <View style={styles.mascotEncouragement}>
        <Text style={styles.encouragementMascot}>🐱</Text>
        <Text style={styles.encouragementText}>
          {wordOrder.length === 0
            ? "Michi is here to help! Start by dragging a word!"
            : showAnswer
            ? wordOrder.join(" ") === exercise.correctAnswer
              ? "Perfect! 🎉"
              : "Good try! 💪"
            : dragDropState.isDragging
            ? "Great! Keep dragging to arrange!"
            : "Perfect! Try dragging the words around!"}
        </Text>
      </View>
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
  instructionText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  wordOrderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  wordChip: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  draggedWordChip: {
    borderColor: "#3498DB",
    backgroundColor: "rgba(52, 152, 219, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  dropZoneWordChip: {
    borderColor: "#2ECC71",
    backgroundColor: "rgba(46, 204, 113, 0.2)",
    borderWidth: 3,
    borderStyle: "dashed",
  },
  disabledWordChip: {
    opacity: 0.6,
  },
  wordChipText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
  },
  draggedWordChipText: {
    color: "#3498DB",
    fontWeight: "bold",
  },
  dropZoneWordChipText: {
    color: "#2ECC71",
    fontWeight: "bold",
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
  dragInstructions: {
    backgroundColor: "#E8F8F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  dragInstructionsText: {
    fontSize: 14,
    color: "#27AE60",
    textAlign: "center",
    fontWeight: "500",
  },
  mascotEncouragement: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  encouragementMascot: {
    fontSize: 30,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 18,
  },
});
