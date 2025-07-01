import { Exercise } from "@/types/lesson";
import * as Speech from "expo-speech";
import { Link, Volume2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface WordDefinitionMatchingProps {
  exercise: Exercise;
  showAnswer: boolean;
  onAnswerChange?: (matches: { [wordIndex: number]: number }) => void;
}

interface MatchingPair {
  word: string;
  definition: string;
  pronunciation?: string;
}

// Color pairs for matching visualization
const MATCH_COLORS = [
  { border: "#FF6B9D", background: "rgba(255, 107, 157, 0.1)" },
  { border: "#2ECC71", background: "rgba(46, 204, 113, 0.1)" },
  { border: "#9B59B6", background: "rgba(155, 89, 182, 0.1)" },
  { border: "#F39C12", background: "rgba(243, 156, 18, 0.1)" },
];

export const WordDefinitionMatchingExercise: React.FC<WordDefinitionMatchingProps> = ({
  exercise,
  showAnswer,
  onAnswerChange,
}) => {
  // State for tracking matches
  const [matches, setMatches] = useState<{ [wordIndex: number]: number }>({});
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);

  // Generate matching pairs from the exercise data
  const generateMatchingPairs = (): MatchingPair[] => {
    // For this exercise, we'll use the current word and create additional pairs
    // In a real implementation, you'd want to pass multiple words to the exercise
    const pairs: MatchingPair[] = [
      {
        word: exercise.word.word,
        definition: exercise.word.definition,
        pronunciation: exercise.word.pronunciation,
      },
    ];

    // Add some mock pairs for demonstration (in real app, these would come from exercise data)
    if (exercise.options && exercise.options.length >= 3) {
      pairs.push(
        { word: "Example", definition: exercise.options[0] },
        { word: "Sample", definition: exercise.options[1] },
        { word: "Instance", definition: exercise.options[2] }
      );
    }

    return pairs;
  };

  const matchingPairs = generateMatchingPairs();
  
  // Shuffle definitions for the right column
  const [shuffledDefinitions] = useState(() => {
    const definitions = matchingPairs.map((pair, index) => ({
      definition: pair.definition,
      originalIndex: index,
    }));
    return definitions.sort(() => Math.random() - 0.5);
  });

  const handleWordPress = (wordIndex: number) => {
    if (showAnswer) return;

    if (selectedWord === wordIndex) {
      // Deselect if clicking the same word
      setSelectedWord(null);
    } else {
      setSelectedWord(wordIndex);
      
      // If a definition is already selected, create a match
      if (selectedDefinition !== null) {
        createMatch(wordIndex, selectedDefinition);
      }
    }
  };

  const handleDefinitionPress = (definitionIndex: number) => {
    if (showAnswer) return;

    if (selectedDefinition === definitionIndex) {
      // Deselect if clicking the same definition
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(definitionIndex);
      
      // If a word is already selected, create a match
      if (selectedWord !== null) {
        createMatch(selectedWord, definitionIndex);
      }
    }
  };

  const createMatch = (wordIndex: number, definitionIndex: number) => {
    const newMatches = { ...matches };
    
    // Remove any existing matches for this word or definition
    Object.keys(newMatches).forEach(key => {
      if (newMatches[parseInt(key)] === definitionIndex) {
        delete newMatches[parseInt(key)];
      }
    });
    
    // Create new match
    newMatches[wordIndex] = definitionIndex;
    
    setMatches(newMatches);
    setSelectedWord(null);
    setSelectedDefinition(null);
    
    onAnswerChange?.(newMatches);
  };

  const getMatchColor = (wordIndex: number, definitionIndex?: number): any => {
    if (definitionIndex !== undefined) {
      // For definitions, check if any word is matched to this definition
      const matchedWordIndex = Object.keys(matches).find(
        key => matches[parseInt(key)] === definitionIndex
      );
      if (matchedWordIndex) {
        const colorIndex = parseInt(matchedWordIndex) % MATCH_COLORS.length;
        return MATCH_COLORS[colorIndex];
      }
    } else {
      // For words, check if this word has a match
      if (matches[wordIndex] !== undefined) {
        const colorIndex = wordIndex % MATCH_COLORS.length;
        return MATCH_COLORS[colorIndex];
      }
    }
    return null;
  };

  const isSelected = (wordIndex?: number, definitionIndex?: number): boolean => {
    if (wordIndex !== undefined) {
      return selectedWord === wordIndex;
    }
    if (definitionIndex !== undefined) {
      return selectedDefinition === definitionIndex;
    }
    return false;
  };

  const checkAnswers = (): boolean => {
    return Object.keys(matches).every(wordIndexStr => {
      const wordIndex = parseInt(wordIndexStr);
      const definitionIndex = matches[wordIndex];
      const originalDefinitionIndex = shuffledDefinitions[definitionIndex]?.originalIndex;
      return originalDefinitionIndex === wordIndex;
    });
  };

  const playPronunciation = (word: string) => {
    Speech.stop();
    Speech.speak(word, {
      language: "en",
      pitch: 1,
      rate: 1,
    });
  };

  return (
    <ScrollView style={styles.exerciseContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.questionCard}>
        <View style={styles.exerciseHeader}>
          <Link size={24} color="#3498DB" />
          <Text style={styles.exerciseTitle}>Match words with definitions</Text>
        </View>

        <Text style={styles.instructionText}>
          Tap a word on the left, then tap its matching definition on the right. 
          Matched pairs will have the same colored border.
        </Text>

        <View style={styles.matchingContainer}>
          {/* Words Column */}
          <View style={styles.wordsColumn}>
            <Text style={styles.columnTitle}>Words</Text>
            {matchingPairs.map((pair, index) => {
              const matchColor = getMatchColor(index);
              const selected = isSelected(index);
              
              return (
                <TouchableOpacity
                  key={`word-${index}`}
                  style={[
                    styles.wordCard,
                    matchColor && {
                      borderColor: matchColor.border,
                      backgroundColor: matchColor.background,
                    },
                    selected && styles.selectedCard,
                  ]}
                  onPress={() => handleWordPress(index)}
                  disabled={showAnswer}
                >
                  <View style={styles.wordContent}>
                    <Text style={[
                      styles.wordText,
                      matchColor && { color: matchColor.border }
                    ]}>
                      {pair.word}
                    </Text>
                    {pair.pronunciation && (
                      <Text style={styles.pronunciationText}>
                        {pair.pronunciation}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.audioButton}
                    onPress={() => playPronunciation(pair.word)}
                  >
                    <Volume2 size={16} color="#7F8C8D" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Definitions Column */}
          <View style={styles.definitionsColumn}>
            <Text style={styles.columnTitle}>Definitions</Text>
            {shuffledDefinitions.map((item, index) => {
              const matchColor = getMatchColor(index);
              const selected = isSelected(undefined, index);
              
              return (
                <TouchableOpacity
                  key={`definition-${index}`}
                  style={[
                    styles.definitionCard,
                    matchColor && {
                      borderColor: matchColor.border,
                      backgroundColor: matchColor.background,
                    },
                    selected && styles.selectedCard,
                  ]}
                  onPress={() => handleDefinitionPress(index)}
                  disabled={showAnswer}
                >
                  <Text style={[
                    styles.definitionText,
                    matchColor && { color: matchColor.border }
                  ]}>
                    {item.definition}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showAnswer && (
          <View style={styles.answerReveal}>
            <Text style={styles.resultText}>
              {checkAnswers() ? "🎉 Perfect! All matches are correct!" : "❌ Some matches are incorrect"}
            </Text>
            <Text style={styles.correctAnswerLabel}>Correct matches:</Text>
            {matchingPairs.map((pair, index) => (
              <View key={`correct-${index}`} style={styles.correctMatchRow}>
                <Text style={styles.correctWord}>{pair.word}</Text>
                <Text style={styles.matchArrow}>→</Text>
                <Text style={styles.correctDefinition}>{pair.definition}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Matched: {Object.keys(matches).length} / {matchingPairs.length}
          </Text>
        </View>

        {/* Mochi & Michi encouragement */}
        <View style={styles.mascotEncouragement}>
          <Text style={styles.encouragementMascot}>🍡🐱</Text>
          <Text style={styles.encouragementText}>
            {Object.keys(matches).length === 0
              ? "Mochi & Michi are ready to help you match! Start by selecting a word!"
              : Object.keys(matches).length === matchingPairs.length
              ? "Amazing work! You've matched all the pairs! 🎉"
              : `Great progress! ${matchingPairs.length - Object.keys(matches).length} more to go!`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    margin: 20,
    minHeight: 600,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 25,
    lineHeight: 22,
  },
  matchingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  wordsColumn: {
    flex: 1,
    marginRight: 10,
  },
  definitionsColumn: {
    flex: 1,
    marginLeft: 10,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#E8E6E8",
  },
  wordCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E8E6E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 70,
  },
  definitionCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E8E6E8",
    minHeight: 70,
    justifyContent: "center",
  },
  selectedCard: {
    borderColor: "#3498DB",
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    elevation: 4,
    shadowColor: "#3498DB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 2,
  },
  pronunciationText: {
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic",
  },
  definitionText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 18,
  },
  audioButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(127, 140, 141, 0.1)",
  },
  answerReveal: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F0F8F0",
    borderRadius: 12,
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  correctAnswerLabel: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 12,
    fontWeight: "600",
  },
  correctMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  correctWord: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2ECC71",
    flex: 1,
    textAlign: "right",
  },
  matchArrow: {
    fontSize: 16,
    color: "#7F8C8D",
    marginHorizontal: 12,
  },
  correctDefinition: {
    fontSize: 14,
    color: "#2ECC71",
    flex: 2,
  },
  progressContainer: {
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E8E6E8",
  },
  progressText: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
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