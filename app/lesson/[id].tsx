import { ActionButtons } from "@/components/ActionButtons";
import {
  FillBlankExercise,
  FlashcardExercise,
  ListeningExercise,
  MultipleChoiceExercise,
  SpellingExercise,
  WordOrderExercise,
} from "@/components/exercises";
import MatchingExercise from "@/components/exercises/MatchingExercise";
import GlobalLoading from "@/components/GlobalLoading";
import { LessonHeader } from "@/components/LessonHeader";
import { LessonStats } from "@/components/LessonStats";
import { useCourse } from "@/contexts/CourseContext";
import { Exercise } from "@/types/lesson";
import { generateExercises } from "@/utils/generateExercises";
import { playSound } from "@/utils/playSound";
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
    flipAnim.setValue(0);
    slideAnim.setValue(0);

    // Initialize word order for word-order exercises
    if (
      currentExercise?.type === "word-order" &&
      currentExercise.shuffledWords
    ) {
      setWordOrder([...currentExercise.shuffledWords]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentExerciseIndex,
    currentExercise?.type,
    currentExercise?.shuffledWords,
  ]);

  const handleAnswer = (isCorrect: boolean) => {
    playSound(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setWrongAnswers(prev => prev + 1);
    }

    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // Lesson completed
      const accuracy = Math.round(
        (correctAnswers / (correctAnswers + wrongAnswers)) * 100
      );
      Alert.alert(
        "Lesson Complete! 🎉",
        `Congratulations! You completed the lesson with ${accuracy}% accuracy.`,
        [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
      );
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
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
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
          />
        );
      case "word-order":
        return (
          <WordOrderExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
            wordOrder={wordOrder}
            onAnswerChange={newAnswer => setWordOrder(newAnswer)}
          />
        );
      case "listening":
        return (
          <ListeningExercise
            exercise={currentExercise}
            showAnswer={showAnswer}
          />
        );
      case "matching": // Thêm case mới
      return (
        <MatchingExercise
          exercise={currentExercise}
          onComplete={(isCorrect) => {
            setShowAnswer(true); // Hiển thị kết quả sau khi hoàn thành
            // Có thể thêm logic để cập nhật điểm hoặc tiến trình
            // Ví dụ: updateProgress(isCorrect);
            setTimeout(() => {
              // Chuyển sang bài tập tiếp theo sau 1 giây
              setCurrentExerciseIndex((prev) => prev + 1);
              setShowAnswer(false); // Reset trạng thái
            }, 1000);
          }}
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
    return <GlobalLoading />;
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
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        onCheck={checkAnswer}
        onRevealAnswer={() => setShowAnswer(true)}
        onAnswerResponse={handleAnswer}
        onPrevious={handlePrevious}
        onNext={handleNext}
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
