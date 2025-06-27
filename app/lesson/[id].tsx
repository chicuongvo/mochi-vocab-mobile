import { ActionButtons } from "@/components/ActionButtons";
import { LessonHeader } from "@/components/LessonHeader";
import { LessonStats } from "@/components/LessonStats";
import {
  FillBlankExercise,
  FlashcardExercise,
  ListeningExercise,
  MultipleChoiceExercise,
  SpellingExercise,
  WordOrderExercise,
} from "@/components/exercises";
import { useCourse } from "@/contexts/CourseContext";
import { Exercise } from "@/types/lesson";
import { DragDropHandlers, DragDropState } from "@/utils/dragDropHelpers";
import { generateExercises } from "@/utils/generateExercises";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { setCourseById, currentCourse, currentWords, loading } = useCourse();

  // Exercise states
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wordOrder, setWordOrder] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWordIndex, setDraggedWordIndex] = useState<number | null>(null);
  const [dropZoneIndex, setDropZoneIndex] = useState<number | null>(null);
  const draggedWordPosition = useRef(new Animated.ValueXY()).current;
  const wordPositions = useRef<{ [key: number]: { x: number; y: number } }>(
    {}
  ).current;

  // Animations
  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      setCourseById(parseInt(id as string));
    }
  }, [id, setCourseById]);

  // Generate exercises when currentWords changes
  useEffect(() => {
    if (currentWords && currentWords.length > 0) {
      const newExercises = generateExercises(currentWords);
      setExercises(newExercises);
    }
  }, [currentWords]);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;

  useEffect(() => {
    // Reset states when exercise changes
    setShowAnswer(false);
    setUserAnswer("");
    setSelectedOption(null);
    setWordOrder([]);
    setIsDragging(false);
    setDraggedWordIndex(null);
    setDropZoneIndex(null);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    draggedWordPosition.setValue({ x: 0, y: 0 });

    // Initialize word order for word-order exercises
    if (
      currentExercise?.type === "word-order" &&
      currentExercise.shuffledWords
    ) {
      setWordOrder([...currentExercise.shuffledWords]);
    }
  }, [
    currentExerciseIndex,
    currentExercise?.type,
    currentExercise?.shuffledWords,
    flipAnim,
    slideAnim,
    draggedWordPosition,
  ]);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setWrongAnswers(prev => prev + 1);
    }

    // Show answer first
    setShowAnswer(true);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // Lesson completed
        const accuracy = Math.round(
          ((correctAnswers + (isCorrect ? 1 : 0)) /
            (correctAnswers + wrongAnswers + 1)) *
            100
        );
        Alert.alert(
          "Lesson Complete! 🎉",
          `Congratulations! You completed the lesson with ${accuracy}% accuracy.`,
          [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
        );
      }
    }, 2000);
  };

  const checkAnswer = () => {
    let isCorrect = false;

    switch (currentExercise.type) {
      case "multiple-choice":
        isCorrect = selectedOption === currentExercise.correctAnswer;
        break;
      case "fill-blank":
      case "spelling":
        isCorrect =
          userAnswer.toLowerCase().trim() ===
          currentExercise.correctAnswer?.toLowerCase();
        break;
      case "word-order":
        const userSentence = wordOrder.join(" ");
        isCorrect = userSentence === currentExercise.correctAnswer;
        break;
      default:
        isCorrect = true; // For flashcard and listening, user decides
    }

    handleAnswer(isCorrect);
  };

  const moveWord = (fromIndex: number, toIndex: number) => {
    const newOrder = [...wordOrder];
    const [movedWord] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedWord);
    setWordOrder(newOrder);
  };

  const handleWordLayout = (index: number, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    wordPositions[index] = {
      x: x + width / 2,
      y: y + height / 2,
    };
  };

  // Create drag drop state and handlers
  const dragDropState: DragDropState = {
    isDragging,
    draggedWordIndex,
    dropZoneIndex,
    draggedWordPosition,
    wordPositions,
  };

  const dragDropHandlers: DragDropHandlers = {
    setIsDragging,
    setDraggedWordIndex,
    setDropZoneIndex,
    moveWord,
  };

  const renderExercise = () => {
    switch (currentExercise.type) {
      case "flashcard":
        return (
          <FlashcardExercise
            exercise={currentExercise}
            currentCourse={currentCourse}
            showAnswer={showAnswer}
            flipAnim={flipAnim}
            slideAnim={slideAnim}
            setShowAnswer={setShowAnswer}
          />
        );
      case "multiple-choice":
        return (
          <MultipleChoiceExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        );
      case "fill-blank":
        return (
          <FillBlankExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
        );
      case "word-order":
        return (
          <WordOrderExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
            wordOrder={wordOrder}
            dragDropState={dragDropState}
            dragDropHandlers={dragDropHandlers}
            handleWordLayout={handleWordLayout}
          />
        );
      case "listening":
        return (
          <ListeningExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
          />
        );
      case "spelling":
        return (
          <SpellingExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
          />
        );
      default:
        return (
          <FlashcardExercise
            exercise={currentExercise}
            currentCourse={currentCourse}
            showAnswer={showAnswer}
            flipAnim={flipAnim}
            slideAnim={slideAnim}
            setShowAnswer={setShowAnswer}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  // No data state
  if (!currentCourse || !currentWords || currentWords.length === 0) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Text style={styles.errorText}>
          Course not found or no words available
        </Text>
        <TouchableOpacity
          style={styles.backToCoursesButton}
          onPress={() => router.replace("/(tabs)/courses")}
        >
          <Text style={styles.backToCoursesText}>Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No exercises generated
  if (exercises.length === 0) {
    return (
      <View style={[styles.container, styles.centeredContainer]}>
        <Text style={styles.errorText}>No exercises available</Text>
        <TouchableOpacity
          style={styles.backToCoursesButton}
          onPress={() => router.replace("/(tabs)/courses")}
        >
          <Text style={styles.backToCoursesText}>Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LessonHeader
        currentCourse={currentCourse}
        currentExercise={currentExercise}
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        progress={progress}
        onBack={() => router.back()}
      />

      {/* Exercise Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderExercise()}
      </ScrollView>

      {/* Action Buttons */}
      <ActionButtons
        exerciseType={currentExercise.type}
        showAnswer={showAnswer}
        selectedOption={selectedOption}
        userAnswer={userAnswer}
        wordOrder={wordOrder}
        onCheck={checkAnswer}
        onRevealAnswer={() => setShowAnswer(true)}
        onAnswerResponse={handleAnswer}
      />

      {/* Stats */}
      <LessonStats
        correctAnswers={correctAnswers}
        wrongAnswers={wrongAnswers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: "#7F8C8D",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 20,
  },
  backToCoursesButton: {
    backgroundColor: "#3498DB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backToCoursesText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
