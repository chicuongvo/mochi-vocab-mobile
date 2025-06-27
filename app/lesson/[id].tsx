import { useCourse } from "@/contexts/CourseContext";
import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  CircleCheck as CheckCircle,
  Headphones,
  Move,
  PenTool,
  Star,
  Target,
  Volume2,
  Circle as XCircle,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

type ExerciseType =
  | "flashcard"
  | "multiple-choice"
  | "fill-blank"
  | "word-order"
  | "listening"
  | "spelling";

interface Word {
  id: number;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  difficulty: string;
  synonyms?: string[];
  antonyms?: string[];
  audioUrl?: string;
}

interface Exercise {
  type: ExerciseType;
  word: Word;
  options?: string[];
  correctAnswer?: string;
  blankedSentence?: string;
  shuffledWords?: string[];
  originalSentence?: string;
  ipaHint?: string;
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const { setCourseById, currentCourse, currentWords, loading } = useCourse();
  const [user, setUser] = useState<any>(null);

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
    // Get current user
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    if (id) {
      setCourseById(parseInt(id as string));
    }
  }, [id]);

  // Generate exercises from words
  const generateExercises = (): Exercise[] => {
    if (!currentWords || currentWords.length === 0) return [];

    const exercises: Exercise[] = [];
    const exerciseTypes: ExerciseType[] = [
      "multiple-choice",
      "fill-blank",
      "word-order",
    ];

    currentWords.forEach(word => {
      // Add 2-3 different exercise types per word
      const selectedTypes = [...exerciseTypes]

        .sort(() => Math.random() - 0.5)
        .slice(0, 1);

      selectedTypes.forEach(type => {
        switch (type) {
          case "flashcard":
            exercises.push({ type, word });
            break;
          case "multiple-choice":
            const otherWords = currentWords.filter(w => w.word !== word.word);
            const wrongOptions = otherWords.slice(0, 3).map(w => w.definition);
            const options = [word.definition, ...wrongOptions].sort(
              () => Math.random() - 0.5
            );
            exercises.push({
              type,
              word,
              options,
              correctAnswer: word.definition,
            });
            break;
          case "fill-blank":
            const sentence = word.example;
            const blankedSentence = sentence.replace(
              new RegExp(word.word, "gi"),
              "______"
            );
            const otherWordsForOptions = currentWords.filter(
              w => w.word !== word.word
            );
            const fillOptions = [
              word.word,
              ...otherWordsForOptions.slice(0, 3).map(w => w.word),
            ].sort(() => Math.random() - 0.5);
            exercises.push({
              type,
              word,
              blankedSentence,
              correctAnswer: word.word,
              options: fillOptions,
              ipaHint: word.pronunciation,
            });
            break;
          case "word-order":
            const exampleSentence = word.example;
            const wordsInSentence = exampleSentence.split(" ");
            const shuffledWords = [...wordsInSentence].sort(
              () => Math.random() - 0.5
            );
            exercises.push({
              type,
              word,
              shuffledWords,
              originalSentence: exampleSentence,
              correctAnswer: exampleSentence,
            });
            break;
          case "listening":
            exercises.push({ type, word });
            break;
          case "spelling":
            exercises.push({ type, word, correctAnswer: word.word });
            break;
        }
      });
    });

    return exercises.sort(() => Math.random() - 0.5); // Shuffle exercises
  };

  // Generate exercises when currentWords changes
  useEffect(() => {
    if (currentWords && currentWords.length > 0) {
      const newExercises = generateExercises();
      setExercises(newExercises);
    }
  }, [currentWords]); // Remove generateExercises from dependency to avoid recreation
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

  // Create pan responder for drag and drop
  const createPanResponder = (index: number) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (evt, gestureState) => {
        setIsDragging(true);
        setDraggedWordIndex(index);
        draggedWordPosition.setOffset({
          x: (draggedWordPosition.x as any)._value,
          y: (draggedWordPosition.y as any)._value,
        });
        draggedWordPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        draggedWordPosition.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });

        // Calculate which word position we're hovering over
        const currentX = evt.nativeEvent.pageX;
        const currentY = evt.nativeEvent.pageY;

        // Find the closest word position
        let closestIndex = -1;
        let minDistance = Infinity;

        Object.keys(wordPositions).forEach(key => {
          const pos = wordPositions[parseInt(key)];
          const distance = Math.sqrt(
            Math.pow(currentX - pos.x, 2) + Math.pow(currentY - pos.y, 2)
          );
          if (distance < minDistance && parseInt(key) !== index) {
            minDistance = distance;
            closestIndex = parseInt(key);
          }
        });

        if (minDistance < 50) {
          // Within 50 pixels
          setDropZoneIndex(closestIndex);
        } else {
          setDropZoneIndex(null);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);
        setDraggedWordIndex(null);

        if (dropZoneIndex !== null && dropZoneIndex !== index) {
          moveWord(index, dropZoneIndex);
        }

        setDropZoneIndex(null);
        draggedWordPosition.flattenOffset();

        // Reset position with animation
        Animated.spring(draggedWordPosition, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    });
  };

  const handleWordLayout = (index: number, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    wordPositions[index] = {
      x: x + width / 2,
      y: y + height / 2,
    };
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  // No data state
  if (!currentCourse || !currentWords || currentWords.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
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
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
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

  const renderExercise = () => {
    switch (currentExercise.type) {
      case "flashcard":
        return renderFlashcard();
      case "multiple-choice":
        return renderMultipleChoice();
      case "fill-blank":
        return renderFillBlank();
      case "word-order":
        return renderWordOrder();
      case "listening":
        return renderListening();
      case "spelling":
        return renderSpelling();
      default:
        return renderFlashcard();
    }
  };

  const renderFlashcard = () => (
    <View style={styles.exerciseContainer}>
      <Animated.View
        style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            {
              transform: [
                {
                  rotateY: flipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"] as const}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <Text style={styles.wordTitle}>{currentExercise.word.word}</Text>
              <TouchableOpacity style={styles.soundButton}>
                <Volume2 size={24} color="#FF6B9D" />
              </TouchableOpacity>
              <Text style={styles.pronunciation}>
                {currentExercise.word.pronunciation}
              </Text>
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>Tap to reveal definition</Text>
                <Text style={styles.tapHintEmoji}>👆</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Back of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [
                {
                  rotateY: flipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["180deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={
              currentCourse
                ? [currentCourse.color_start, currentCourse.color_end]
                : ["#9B59B6", "#8E44AD"]
            }
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <Text style={styles.wordTitleBack}>
                {currentExercise.word.word}
              </Text>
              <Text style={styles.definition}>
                {currentExercise.word.definition}
              </Text>
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.example}>
                  {currentExercise.word.example}
                </Text>
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>
                  {currentExercise.word.difficulty}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Tap to flip overlay */}
      {!showAnswer && (
        <TouchableOpacity
          style={styles.flipOverlay}
          onPress={() => {
            Animated.timing(flipAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }).start();
            setShowAnswer(true);
          }}
          activeOpacity={1}
        />
      )}
    </View>
  );

  const renderMultipleChoice = () => (
    <View style={styles.exerciseContainer}>
      <View style={styles.questionCard}>
        <View style={styles.exerciseHeader}>
          <Target size={24} color="#FF6B9D" />
          <Text style={styles.exerciseTitle}>
            Choose the correct definition
          </Text>
        </View>

        <Text style={styles.questionWord}>{currentExercise.word.word}</Text>
        <Text style={styles.pronunciation}>
          {currentExercise.word.pronunciation}
        </Text>

        <TouchableOpacity style={styles.audioButton}>
          <Volume2 size={20} color="#FFFFFF" />
          <Text style={styles.audioButtonText}>🔊 Hear pronunciation</Text>
        </TouchableOpacity>

        <View style={styles.optionsContainer}>
          {currentExercise.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedOption,
                showAnswer &&
                  option === currentExercise.correctAnswer &&
                  styles.correctOption,
                showAnswer &&
                  selectedOption === option &&
                  option !== currentExercise.correctAnswer &&
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
                    option === currentExercise.correctAnswer &&
                    styles.correctOptionText,
                ]}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mochi encouragement */}
        <View style={styles.mascotEncouragement}>
          <Text style={styles.encouragementMascot}>🍡</Text>
          <Text style={styles.encouragementText}>
            {!selectedOption
              ? "Take your time, Mochi believes in you!"
              : showAnswer
              ? selectedOption === currentExercise.correctAnswer
                ? "Great job! 🎉"
                : "Keep trying! 💪"
              : "Good choice! Now check your answer!"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFillBlank = () => (
    <View style={styles.exerciseContainer}>
      <View style={styles.questionCard}>
        <View style={styles.exerciseHeader}>
          <BookOpen size={24} color="#9B59B6" />
          <Text style={styles.exerciseTitle}>
            Fill in the blank with IPA hint
          </Text>
        </View>

        <Text style={styles.sentenceText}>
          {currentExercise.blankedSentence}
        </Text>

        <View style={styles.ipaHintContainer}>
          <Text style={styles.ipaHintLabel}>Pronunciation hint:</Text>
          <Text style={styles.ipaHintText}>{currentExercise.ipaHint}</Text>
          <TouchableOpacity style={styles.audioButton}>
            <Volume2 size={16} color="#FFFFFF" />
            <Text style={styles.audioButtonText}>🔊 Hear pronunciation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          {currentExercise.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedOption,
                showAnswer &&
                  option === currentExercise.correctAnswer &&
                  styles.correctOption,
                showAnswer &&
                  selectedOption === option &&
                  option !== currentExercise.correctAnswer &&
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
                    option === currentExercise.correctAnswer &&
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
            <Text style={styles.correctAnswerText}>
              {currentExercise.correctAnswer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderWordOrder = () => (
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
            const panResponder = createPanResponder(index);
            const isDraggedWord = draggedWordIndex === index;
            const isDropZone = dropZoneIndex === index;

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
                      { translateX: draggedWordPosition.x },
                      { translateY: draggedWordPosition.y },
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
            <Text style={styles.correctAnswerText}>
              {currentExercise.correctAnswer}
            </Text>
          </View>
        )}

        {/* Drag and drop instructions */}
        <View style={styles.dragInstructions}>
          <Text style={styles.dragInstructionsText}>
            💡{" "}
            {isDragging
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
              ? wordOrder.join(" ") === currentExercise.correctAnswer
                ? "Perfect! 🎉"
                : "Good try! 💪"
              : isDragging
              ? "Great! Keep dragging to arrange!"
              : "Perfect! Try dragging the words around!"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderListening = () => (
    <View style={styles.exerciseContainer}>
      <View style={styles.questionCard}>
        <View style={styles.exerciseHeader}>
          <Headphones size={24} color="#F39C12" />
          <Text style={styles.exerciseTitle}>Listen and repeat</Text>
        </View>

        <TouchableOpacity style={styles.playButton}>
          <Volume2 size={48} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.listeningInstruction}>
          Listen carefully and try to repeat the word
        </Text>

        <Text style={styles.listeningWord}>
          {showAnswer ? currentExercise.word.word : "???"}
        </Text>
        <Text style={styles.pronunciation}>
          {showAnswer ? currentExercise.word.pronunciation : "Listen carefully"}
        </Text>

        {showAnswer && (
          <View style={styles.listeningDetails}>
            <Text style={styles.definition}>
              {currentExercise.word.definition}
            </Text>
            <Text style={styles.example}>{currentExercise.word.example}</Text>
          </View>
        )}

        {/* Mochi & Michi encouragement */}
        <View style={styles.mascotEncouragement}>
          <Text style={styles.encouragementMascot}>🍡🐱</Text>
          <Text style={styles.encouragementText}>
            {!showAnswer
              ? "Listen closely! Mochi & Michi are listening too!"
              : "Great listening! Practice makes perfect! 🎵"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSpelling = () => (
    <View style={styles.exerciseContainer}>
      <View style={styles.questionCard}>
        <View style={styles.exerciseHeader}>
          <PenTool size={24} color="#E74C3C" />
          <Text style={styles.exerciseTitle}>Spell the word</Text>
        </View>

        <Text style={styles.spellingDefinition}>
          {currentExercise.word.definition}
        </Text>
        <Text style={styles.pronunciation}>
          {currentExercise.word.pronunciation}
        </Text>

        <TouchableOpacity style={styles.audioButton}>
          <Volume2 size={16} color="#FFFFFF" />
          <Text style={styles.audioButtonText}>🔊 Hear pronunciation</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.spellingInput}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Spell the word..."
          placeholderTextColor="#95A5A6"
          editable={!showAnswer}
          autoCapitalize="none"
        />

        {showAnswer && (
          <View style={styles.answerReveal}>
            <Text style={styles.correctAnswerLabel}>Correct spelling:</Text>
            <Text style={styles.correctAnswerText}>
              {currentExercise.correctAnswer}
            </Text>
          </View>
        )}

        {/* Michi encouragement */}
        <View style={styles.mascotEncouragement}>
          <Text style={styles.encouragementMascot}>🐱</Text>
          <Text style={styles.encouragementText}>
            {!userAnswer
              ? "Michi knows you can spell this! Take your time!"
              : showAnswer
              ? userAnswer.toLowerCase() ===
                currentExercise.correctAnswer?.toLowerCase()
                ? "Perfect spelling! 🎉"
                : "Good effort! Keep practicing! 💪"
              : "Looking good! Check your spelling when ready!"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={
          currentCourse
            ? [currentCourse.color_start, currentCourse.color_end]
            : ["#FF6B9D", "#FF8C42"]
        }
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {currentCourse?.title || "Lesson"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentExercise?.type.replace("-", " ").toUpperCase() ||
                "LESSON"}
            </Text>
          </View>
          <View style={styles.mascotContainer}>
            <Text style={styles.mascot}>🍡</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {currentExerciseIndex + 1} of {totalExercises}
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>
      </LinearGradient>

      {/* Exercise Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderExercise()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!showAnswer ? (
          <TouchableOpacity
            style={[
              styles.checkButton,
              (currentExercise.type === "multiple-choice" && !selectedOption) ||
              (currentExercise.type === "fill-blank" && !selectedOption) ||
              (currentExercise.type === "spelling" && !userAnswer.trim()) ||
              (currentExercise.type === "word-order" && wordOrder.length === 0)
                ? styles.disabledButton
                : null,
            ]}
            onPress={
              currentExercise.type === "flashcard" ||
              currentExercise.type === "listening"
                ? () => setShowAnswer(true)
                : checkAnswer
            }
            disabled={
              (currentExercise.type === "multiple-choice" && !selectedOption) ||
              (currentExercise.type === "fill-blank" && !selectedOption) ||
              (currentExercise.type === "spelling" && !userAnswer.trim()) ||
              (currentExercise.type === "word-order" && wordOrder.length === 0)
            }
          >
            <Text style={styles.checkButtonText}>
              {currentExercise.type === "flashcard" ||
              currentExercise.type === "listening"
                ? "Reveal Answer"
                : "Check Answer"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.wrongButton]}
              onPress={() => handleAnswer(false)}
            >
              <XCircle size={24} color="#FFFFFF" />
              <Text style={styles.answerButtonText}>Hard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.correctButton]}
              onPress={() => handleAnswer(true)}
            >
              <CheckCircle size={24} color="#FFFFFF" />
              <Text style={styles.answerButtonText}>Easy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <CheckCircle size={16} color="#2ECC71" />
          <Text style={styles.statText}>{correctAnswers}</Text>
        </View>
        <View style={styles.statItem}>
          <XCircle size={16} color="#E74C3C" />
          <Text style={styles.statText}>{wrongAnswers}</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={16} color="#F39C12" />
          <Text style={styles.statText}>
            {correctAnswers > 0
              ? Math.round(
                  (correctAnswers / (correctAnswers + wrongAnswers)) * 100
                )
              : 0}
            %
          </Text>
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
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 2,
  },
  mascotContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },
  mascot: {
    fontSize: 24,
  },
  progressSection: {
    marginTop: 10,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  progressPercent: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardWrapper: {
    width: "100%",
    height: 400,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backfaceVisibility: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 30,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wordTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 16,
  },
  wordTitleBack: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  soundButton: {
    backgroundColor: "rgba(255, 107, 157, 0.1)",
    borderRadius: 25,
    padding: 12,
    marginBottom: 16,
  },
  pronunciation: {
    fontSize: 18,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  definition: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 30,
  },
  exampleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  exampleLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
  },
  example: {
    fontSize: 16,
    color: "#FFFFFF",
    fontStyle: "italic",
    lineHeight: 22,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  difficultyText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tapHint: {
    alignItems: "center",
  },
  tapHintText: {
    fontSize: 16,
    color: "#95A5A6",
    marginBottom: 8,
  },
  tapHintEmoji: {
    fontSize: 24,
  },
  flipOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
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
  questionWord: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 10,
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
  selectedWordChip: {
    borderColor: "#FF6B9D",
    backgroundColor: "rgba(255, 107, 157, 0.1)",
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
  selectedWordChipText: {
    color: "#FF6B9D",
  },
  draggedWordChipText: {
    color: "#3498DB",
    fontWeight: "bold",
  },
  dropZoneWordChipText: {
    color: "#2ECC71",
    fontWeight: "bold",
  },
  sentencePreview: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sentencePreviewLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
    marginBottom: 8,
  },
  sentencePreviewText: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 22,
  },
  playButton: {
    backgroundColor: "#F39C12",
    borderRadius: 50,
    padding: 30,
    alignSelf: "center",
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  listeningInstruction: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 20,
  },
  listeningWord: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 10,
  },
  listeningDetails: {
    marginTop: 30,
    alignItems: "center",
  },
  spellingDefinition: {
    fontSize: 18,
    color: "#2C3E50",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 20,
  },
  spellingInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: "#2C3E50",
    borderWidth: 2,
    borderColor: "#ECF0F1",
    textAlign: "center",
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 20,
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
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  checkButton: {
    backgroundColor: "#FF6B9D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#BDC3C7",
  },
  checkButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  answerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  answerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginHorizontal: 6,
  },
  wrongButton: {
    backgroundColor: "#E74C3C",
  },
  correctButton: {
    backgroundColor: "#2ECC71",
  },
  answerButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statText: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "600",
    marginLeft: 6,
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
});
