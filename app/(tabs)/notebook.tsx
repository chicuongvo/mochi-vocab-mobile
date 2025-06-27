import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import {
  ArrowRight,
  BookOpen,
  CircleCheck as CheckCircle,
  Clock,
  CreditCard as Edit3,
  Hash,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Volume2,
  X,
  Circle as XCircle,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Word {
  id: string;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  topic?: string;
  dateAdded: string;
  isFavorite: boolean;
  reviewCount?: number;
  lastReviewed?: string;
}

interface SearchResult {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

export default function NotebookScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "all" | "myVocabs" | "topic" | "recent"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewWords, setReviewWords] = useState<Word[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, total: 0 });
  const [isFlipping, setIsFlipping] = useState(false);
  const [filteredVocabulary, setFilteredVocabulary] = useState<Word[]>([]);

  // Animation refs
  const fabScale = useRef(new Animated.Value(1)).current;
  const searchResultOpacity = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Form states
  const [newWord, setNewWord] = useState({
    word: "",
    pronunciation: "",
    definition: "",
    example: "",
    topic: "",
  });

  // State for My Vocabs (user-defined words)
  const [myVocabs, setMyVocabs] = useState<Word[]>([
    {
      id: "1",
      word: "Serendipity",
      pronunciation: "/ˌserənˈdipədē/",
      definition:
        "The occurrence and development of events by chance in a happy or beneficial way",
      example:
        "A fortunate stroke of serendipity brought the two old friends together.",
      topic: "Advanced",
      dateAdded: "2024-01-15",
      isFavorite: true,
      reviewCount: 3,
      lastReviewed: "2024-01-20",
    },
    {
      id: "2",
      word: "Ephemeral",
      pronunciation: "/əˈfem(ə)rəl/",
      definition: "Lasting for a very short time",
      example:
        "The beauty of cherry blossoms is ephemeral, lasting only a few weeks.",
      topic: "Poetry",
      dateAdded: "2024-01-14",
      isFavorite: false,
      reviewCount: 1,
      lastReviewed: "2024-01-18",
    },
    {
      id: "3",
      word: "Wanderlust",
      pronunciation: "/ˈwändərˌləst/",
      definition: "A strong desire to travel and explore the world",
      example: "Her wanderlust led her to visit over 30 countries.",
      topic: "Travel",
      dateAdded: "2024-01-13",
      isFavorite: true,
      reviewCount: 5,
      lastReviewed: "2024-01-19",
    },
    {
      id: "4",
      word: "Mellifluous",
      pronunciation: "/məˈliflo͞oəs/",
      definition: "Sweet or musical; pleasant to hear",
      example: "The singer's mellifluous voice captivated the entire audience.",
      topic: "Music",
      dateAdded: "2024-01-12",
      isFavorite: false,
      reviewCount: 2,
      lastReviewed: "2024-01-17",
    },
    {
      id: "5",
      word: "Resilience",
      pronunciation: "/rɪˈzɪljəns/",
      definition: "The capacity to recover quickly from difficulties",
      example: "Her resilience helped her overcome many challenges.",
      topic: "Psychology",
      dateAdded: "2024-01-11",
      isFavorite: true,
      reviewCount: 4,
      lastReviewed: "2024-01-21",
    },
  ]);

  // State for All Words (dictionary default words)
  const [allWordsDictionary, setAllWordsDictionary] = useState<Word[]>([
    {
      id: "6",
      word: "Benevolent",
      pronunciation: "/bəˈnevələnt/",
      definition: "Well-meaning and kindly",
      example: "The benevolent donor gave generously to the charity.",
      topic: "Virtue",
      dateAdded: "2023-12-01",
      isFavorite: false,
      reviewCount: 0,
    },
    {
      id: "7",
      word: "Eloquent",
      pronunciation: "/ˈeləkwənt/",
      definition: "Fluent or persuasive in speaking or writing",
      example: "Her eloquent speech moved the entire audience.",
      topic: "Communication",
      dateAdded: "2023-12-02",
      isFavorite: false,
      reviewCount: 0,
    },
    {
      id: "8",
      word: "Luminous",
      pronunciation: "/ˈlo͞omənəs/",
      definition: "Bright or shining, especially in the dark",
      example: "The luminous moon lit up the night sky.",
      topic: "Nature",
      dateAdded: "2023-12-03",
      isFavorite: false,
      reviewCount: 0,
    },
    {
      id: "9",
      word: "Pragmatic",
      pronunciation: "/praɡˈmadik/",
      definition: "Dealing with things sensibly and realistically",
      example: "His pragmatic approach solved the problem efficiently.",
      topic: "Business",
      dateAdded: "2023-12-04",
      isFavorite: false,
      reviewCount: 0,
    },
    {
      id: "10",
      word: "Tenacious",
      pronunciation: "/təˈnāSHəs/",
      definition: "Persistent in maintaining or holding to something",
      example: "Her tenacious effort led to her success.",
      topic: "Personality",
      dateAdded: "2023-12-05",
      isFavorite: false,
      reviewCount: 0,
    },
  ]);

  const searchDictionary = async (
    query: string
  ): Promise<SearchResult | null> => {
    if (!query.trim()) return null;

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${query}`
      );
      const data = await response.json();

      if (data.title === "No Definitions Found") {
        return null;
      }

      const result = data[0];
      return {
        word: result.word,
        pronunciation: result.phonetics[0]?.text || "/ˈsæmpəl/",
        definition: result.meanings[0].definitions[0].definition,
        example: result.meanings[0].definitions[0].example || `Example sentence with "${query}".`,
        partOfSpeech: result.meanings[0].partOfSpeech,
      };
    } catch (error) {
      console.error("Error fetching dictionary:", error);
      return {
        word: query.charAt(0).toUpperCase() + query.slice(1),
        pronunciation: "/ˈsæmpəl/",
        definition: "Could not fetch definition. Please try again later.",
        example: `Example sentence with "${query}".`,
        partOfSpeech: "noun",
      };
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim()) {
        let matchedWords: Word[] = [];
        if (selectedTab === "all") {
          matchedWords = allWordsDictionary.filter(word =>
            word.word.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (selectedTab === "myVocabs") {
          matchedWords = myVocabs.filter(word =>
            word.word.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setFilteredVocabulary(matchedWords);

        const result = await searchDictionary(searchQuery);
        setSearchResult(result);

        Animated.timing(searchResultOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setFilteredVocabulary([]);
        setSearchResult(null);
        searchResultOpacity.setValue(0);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, searchResultOpacity, selectedTab, allWordsDictionary, myVocabs]);

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, [fabScale]);

  useEffect(() => {
    if (showReviewModal) {
      flipAnim.setValue(0);
      setShowAnswer(false);
      setIsFlipping(false);
    }
  }, [currentReviewIndex, showReviewModal, flipAnim]);

  const getFilteredWords = () => {
    switch (selectedTab) {
      case "topic":
        return myVocabs.sort((a, b) =>
          (a.topic || "").localeCompare(b.topic || "")
        );
      case "recent":
        return myVocabs.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
      case "myVocabs":
        return myVocabs.sort((a, b) => a.word.localeCompare(b.word));
      default:
        return allWordsDictionary.sort((a, b) => a.word.localeCompare(b.word));
    }
  };

  const startReview = () => {
    const wordsToReview = myVocabs.filter(
      word => word.isFavorite || (word.reviewCount || 0) < 3
    );
    if (wordsToReview.length === 0) {
      Alert.alert(
        "Great job! 🎉",
        "All your words are well-reviewed. Add more words to continue learning!"
      );
      return;
    }

    setReviewWords(wordsToReview.sort(() => Math.random() - 0.5));
    setCurrentReviewIndex(0);
    setShowAnswer(false);
    setReviewStats({ correct: 0, total: 0 });
    setShowReviewModal(true);
  };

  const handleReviewAnswer = (isCorrect: boolean) => {
    const currentWord = reviewWords[currentReviewIndex];

    setMyVocabs(prev =>
      prev.map(word =>
        word.id === currentWord.id
          ? {
              ...word,
              reviewCount: (word.reviewCount || 0) + 1,
              lastReviewed: new Date().toISOString().split("T")[0],
            }
          : word
      )
    );

    setReviewStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (currentReviewIndex < reviewWords.length - 1) {
      setTimeout(() => {
        setCurrentReviewIndex(prev => prev + 1);
        setShowAnswer(false);
        flipAnim.setValue(0);
      }, 1000);
    } else {
      setTimeout(() => {
        setShowReviewModal(false);
        const accuracy = Math.round(
          ((reviewStats.correct + (isCorrect ? 1 : 0)) /
            (reviewStats.total + 1)) *
            100
        );
        Alert.alert(
          "Review Complete! 🎉",
          `Great job! You reviewed ${reviewWords.length} words with ${accuracy}% accuracy. Mochi & Michi are proud of you! 🍡🐱`
        );
      }, 1000);
    }
  };

  const flipCard = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    Animated.timing(flipAnim, {
      toValue: showAnswer ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipping(false);
    });
    setShowAnswer(!showAnswer);
  };

  const saveWordFromSearch = () => {
    if (!searchResult) return;

    const newWordData: Word = {
      id: Date.now().toString(),
      word: searchResult.word,
      pronunciation: searchResult.pronunciation,
      definition: searchResult.definition,
      example: searchResult.example,
      topic: "Dictionary",
      dateAdded: new Date().toISOString().split("T")[0],
      isFavorite: false,
      reviewCount: 0,
    };

    setMyVocabs(prev => [newWordData, ...prev]);
    setSearchQuery("");
    setSearchResult(null);
    setFilteredVocabulary([]);

    Alert.alert(
      "Success! 🎉",
      `"${searchResult.word}" has been added to your vocabulary!`
    );
  };

  const addNewWord = () => {
    if (!newWord.word.trim() || !newWord.definition.trim()) {
      Alert.alert(
        "Oops! 😅",
        "Please fill in at least the word and definition fields."
      );
      return;
    }

    const wordData: Word = {
      id: Date.now().toString(),
      word: newWord.word,
      pronunciation: newWord.pronunciation || "/ˈsæmpəl/",
      definition: newWord.definition,
      example: newWord.example || `Example sentence with ${newWord.word}.`,
      topic: newWord.topic || "Custom",
      dateAdded: new Date().toISOString().split("T")[0],
      isFavorite: false,
      reviewCount: 0,
    };

    setMyVocabs(prev => [wordData, ...prev]);
    setNewWord({
      word: "",
      pronunciation: "",
      definition: "",
      example: "",
      topic: "",
    });
    setShowAddModal(false);

    Alert.alert(
      "Awesome! 🌟",
      `"${wordData.word}" has been added to your collection!`
    );
  };

  const editWord = () => {
    if (!editingWord) return;

    if (!editingWord.word.trim() || !editingWord.definition.trim()) {
      Alert.alert(
        "Oops! 😅",
        "Please fill in at least the word and definition fields."
      );
      return;
    }

    setMyVocabs(prev =>
      prev.map(word =>
        word.id === editingWord.id
          ? {
              ...word,
              word: editingWord.word,
              pronunciation: editingWord.pronunciation,
              definition: editingWord.definition,
              example: editingWord.example,
              topic: editingWord.topic,
            }
          : word
      )
    );

    setShowEditModal(false);
    setEditingWord(null);

    Alert.alert(
      "Updated! 🎉",
      `"${editingWord.word}" has been updated successfully!`
    );
  };

  const deleteWord = (id: string) => {
    Alert.alert(
      "Delete Word? 🗑️",
      "Are you sure you want to remove this word from your collection?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setMyVocabs(prev => prev.filter(w => w.id !== id)),
        },
      ]
    );
  };

  const toggleFavorite = (id: string) => {
    setMyVocabs(prev =>
      prev.map(word =>
        word.id === id ? { ...word, isFavorite: !word.isFavorite } : word
      )
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyMascot}>🍡🐱</Text>
      <Text style={styles.emptyTitle}>
        Search for any word and save it to your collection!
      </Text>
      <Text style={styles.emptySubtitle}>
        Mochi & Michi are excited to help you build your vocabulary! ✨
      </Text>
    </View>
  );

  const renderSearchResult = () => {
    if (!searchResult) return null;

    return (
      <Animated.View
        style={[styles.searchResultCard, { opacity: searchResultOpacity }]}
      >
        <View style={styles.searchResultHeader}>
          <View style={styles.searchResultInfo}>
            <Text style={styles.searchResultWord}>{searchResult.word}</Text>
            <Text style={styles.searchResultPronunciation}>
              {searchResult.pronunciation}
            </Text>
            <Text style={styles.partOfSpeech}>{searchResult.partOfSpeech}</Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              Speech.stop();
              Speech.speak(searchResult.word, {
                language: "en",
                rate: 1,
                pitch: 1,
              });
            }}
          >
            <Volume2 size={20} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        <Text style={styles.searchResultDefinition}>
          {searchResult.definition}
        </Text>

        <View style={styles.exampleContainer}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.searchResultExample}>{searchResult.example}</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveWordFromSearch}
        >
          <LinearGradient
            colors={["#FF6B9D", "#FF8C42"]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Save size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save to Collection</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderVocabularyResults = () => {
    if (filteredVocabulary.length === 0) return null;

    return (
      <View style={styles.vocabularyResultsContainer}>
        <Text style={styles.vocabularyResultsTitle}>Saved Words</Text>
        {filteredVocabulary.map(word => (
          <View key={word.id} style={styles.vocabularyResultCard}>
            <View style={styles.wordCardHeader}>
              <View style={styles.wordCardInfo}>
                <View style={styles.wordTitleRow}>
                  <Text style={styles.wordCardTitle}>{word.word}</Text>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(word.id)}
                  >
                    <Star
                      size={18}
                      color={word.isFavorite ? "#FFD700" : "#BDC3C7"}
                      fill={word.isFavorite ? "#FFD700" : "none"}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.wordCardPronunciation}>
                  {word.pronunciation}
                </Text>
                {word.topic ? (
                  <View style={styles.topicBadge}>
                    <Hash size={12} color="#9B59B6" />
                    <Text style={styles.topicText}>{word.topic}</Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.playButtonSmall}
                onPress={() => {
                  Speech.stop();
                  Speech.speak(word.word, {
                    language: "en",
                    rate: 1,
                    pitch: 1,
                  });
                }}
              >
                <Volume2 size={16} color="#7F8C8D" />
              </TouchableOpacity>
            </View>
            <Text style={styles.wordCardDefinition} numberOfLines={2}>
              {word.definition}
            </Text>
            <View style={styles.wordCardFooter}>
              <View style={styles.wordCardStats}>
                <Text style={styles.dateAdded}>Added {word.dateAdded}</Text>
                {word.reviewCount && word.reviewCount > 0 ? (
                  <Text style={styles.reviewCount}>
                    Reviewed {word.reviewCount} times
                  </Text>
                ) : null}
              </View>
              <View style={styles.wordActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingWord(word);
                    setShowEditModal(true);
                  }}
                >
                  <Edit3 size={16} color="#3498DB" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteWord(word.id)}
                >
                  <Trash2 size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWordCard = (word: Word) => (
    <View key={word.id} style={styles.wordCard}>
      <View style={styles.wordCardHeader}>
        <View style={styles.wordCardInfo}>
          <View style={styles.wordTitleRow}>
            <Text style={styles.wordCardTitle}>{word.word}</Text>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(word.id)}
            >
              <Star
                size={18}
                color={word.isFavorite ? "#FFD700" : "#BDC3C7"}
                fill={word.isFavorite ? "#FFD700" : "none"}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.wordCardPronunciation}>{word.pronunciation}</Text>
          {word.topic ? (
            <View style={styles.topicBadge}>
              <Hash size={12} color="#9B59B6" />
              <Text style={styles.topicText}>{word.topic}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.playButtonSmall}
          onPress={() => {
            Speech.stop();
            Speech.speak(word.word, {
              language: "en",
              rate: 1,
              pitch: 1,
            });
          }}
        >
          <Volume2 size={16} color="#7F8C8D" />
        </TouchableOpacity>
      </View>

      <Text style={styles.wordCardDefinition} numberOfLines={2}>
        {word.definition}
      </Text>

      <View style={styles.wordCardFooter}>
        <View style={styles.wordCardStats}>
          <Text style={styles.dateAdded}>Added {word.dateAdded}</Text>
          {word.reviewCount && word.reviewCount > 0 ? (
            <Text style={styles.reviewCount}>
              Reviewed {word.reviewCount} times
            </Text>
          ) : null}
        </View>
        <View style={styles.wordActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setEditingWord(word);
              setShowEditModal(true);
            }}
          >
            <Edit3 size={16} color="#3498DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteWord(word.id)}
          >
            <Trash2 size={16} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFlashcard = () => {
    if (reviewWords.length === 0) return null;

    const currentWord = reviewWords[currentReviewIndex];
    const progress = ((currentReviewIndex + 1) / reviewWords.length) * 100;

    return (
      <View style={styles.flashcardContainer}>
        <View style={styles.reviewProgress}>
          <Text style={styles.progressText}>
            {currentReviewIndex + 1} of {reviewWords.length}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Animated.View
            style={[
              styles.flashcard,
              styles.cardFront,
              {
                opacity: flipAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0, 0],
                }),
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
              colors={["#FFFFFF", "#F8F9FA"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <Text style={styles.flashcardWord}>{currentWord.word}</Text>
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={() => {
                    Speech.stop();
                    Speech.speak(currentWord.word, {
                      language: "en",
                      rate: 1,
                      pitch: 1,
                    });
                  }}
                >
                  <Volume2 size={24} color="#FF6B9D" />
                </TouchableOpacity>
                <Text style={styles.flashcardPronunciation}>
                  {currentWord.pronunciation}
                </Text>
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>
                    Tap to reveal definition
                  </Text>
                  <Text style={styles.tapHintEmoji}>👆</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.flashcard,
              styles.cardBack,
              {
                opacity: flipAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0, 1],
                }),
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
              colors={["#FF6B9D", "#FF8C42"]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <Text style={styles.flashcardWordBack}>{currentWord.word}</Text>
                <Text style={styles.flashcardDefinition}>
                  {currentWord.definition}
                </Text>
                <View style={styles.exampleContainerFlashcard}>
                  <Text style={styles.exampleLabelFlashcard}>Example:</Text>
                  <Text style={styles.flashcardExample}>
                    {currentWord.example}
                  </Text>
                </View>
                {currentWord.topic ? (
                  <View style={styles.topicBadgeFlashcard}>
                    <Text style={styles.topicTextFlashcard}>
                      {currentWord.topic}
                    </Text>
                  </View>
                ) : null}
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {!showAnswer && !isFlipping ? (
          <TouchableOpacity
            style={styles.flipOverlay}
            onPress={flipCard}
            activeOpacity={0.8}
            delayPressIn={0}
            delayPressOut={0}
          />
        ) : null}

        <View style={styles.mascotEncouragement}>
          <Text style={styles.encouragementMascot}>
            {reviewStats.total === 0
              ? "🍡"
              : reviewStats.correct / Math.max(reviewStats.total, 1) > 0.7
              ? "🎉"
              : "💪"}
          </Text>
          <Text style={styles.encouragementText}>
            {reviewStats.total === 0
              ? "You got this! Mochi believes in you!"
              : reviewStats.correct / Math.max(reviewStats.total, 1) > 0.7
              ? "Amazing work! Keep it up!"
              : "Don't give up! Every mistake is learning!"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
        colors={["#9B59B6", "#8E44AD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Vocabulary 📚</Text>
            <Text style={styles.headerSubtitle}>
              Your personal word collection & dictionary
            </Text>
          </View>
          <View style={styles.mascotContainer}>
            <Text style={styles.mascot}>🍡</Text>
          </View>
        </View>
      </LinearGradient>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#7F8C8D" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a word..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#95A5A6"
            />
            {isSearching ? (
              <View style={styles.loadingIndicator}>
                <Text style={styles.loadingText}>🔍</Text>
              </View>
            ) : null}
          </View>

          {renderVocabularyResults()}

          {renderSearchResult()}

          {!searchQuery && !searchResult && filteredVocabulary.length === 0 ? renderEmptyState() : null}
        </View>

        {myVocabs.length > 0 ? (
          <View style={styles.reviewSection}>
            <TouchableOpacity style={styles.reviewCard} onPress={startReview}>
              <LinearGradient
                colors={["#2ECC71", "#27AE60"]}
                style={styles.reviewGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.reviewContent}>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewTitle}>📚 Review Flashcards</Text>
                    <Text style={styles.reviewSubtitle}>
                      Practice your saved words with interactive flashcards
                    </Text>
                  </View>
                  <ArrowRight size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.tabSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "all" ? styles.activeTab : null,
                ].filter(Boolean) as any}
                onPress={() => setSelectedTab("all")}
              >
                <BookOpen
                  size={16}
                  color={selectedTab === "all" ? "#FFFFFF" : "#7F8C8D"}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "all" ? styles.activeTabText : null,
                  ].filter(Boolean) as any}
                >
                  All Words
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "myVocabs" ? styles.activeTab : null,
                ].filter(Boolean) as any}
                onPress={() => setSelectedTab("myVocabs")}
              >
                <BookOpen
                  size={16}
                  color={selectedTab === "myVocabs" ? "#FFFFFF" : "#7F8C8D"}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "myVocabs" ? styles.activeTabText : null,
                  ].filter(Boolean) as any}
                >
                  My Vocabs
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "topic" ? styles.activeTab : null,
                ].filter(Boolean) as any}
                onPress={() => setSelectedTab("topic")}
              >
                <Hash
                  size={16}
                  color={selectedTab === "topic" ? "#FFFFFF" : "#7F8C8D"}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "topic" ? styles.activeTabText : null,
                  ].filter(Boolean) as any}
                >
                  By Topic
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "recent" ? styles.activeTab : null,
                ].filter(Boolean) as any}
                onPress={() => setSelectedTab("recent")}
              >
                <Clock
                  size={16}
                  color={selectedTab === "recent" ? "#FFFFFF" : "#7F8C8D"}
                />
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === "recent" ? styles.activeTabText : null,
                  ].filter(Boolean) as any}
                >
                  Recently Added
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <View style={styles.wordsSection}>
          <View style={styles.wordsSectionHeader}>
            <Text style={styles.wordsSectionTitle}>
              {selectedTab === "all" ? "Dictionary Words" : null}
              {selectedTab === "myVocabs" ? "My Vocabulary" : null}
              {selectedTab === "topic" ? "Organized by Topic" : null}
              {selectedTab === "recent" ? "Recently Added" : null}
            </Text>
            <Text style={styles.wordsCount}>
              ({getFilteredWords().length} words)
            </Text>
          </View>

          {getFilteredWords().map(renderWordCard)}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <LinearGradient
            colors={["#2ECC71", "#27AE60"]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Plus size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#7F8C8D" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Word ✨</Text>
            <TouchableOpacity onPress={addNewWord}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Word *</Text>
              <TextInput
                style={styles.modalInput}
                value={newWord.word}
                onChangeText={text =>
                  setNewWord(prev => ({ ...prev, word: text }))
                }
                placeholder="Enter the word"
                placeholderTextColor="#95A5A6"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pronunciation</Text>
              <TextInput
                style={styles.modalInput}
                value={newWord.pronunciation}
                onChangeText={text =>
                  setNewWord(prev => ({ ...prev, pronunciation: text }))
                }
                placeholder="/prəˌnʌnsiˈeɪʃən/"
                placeholderTextColor="#95A5A6"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Definition *</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={newWord.definition}
                onChangeText={text =>
                  setNewWord(prev => ({ ...prev, definition: text }))
                }
                placeholder="What does this word mean?"
                placeholderTextColor="#95A5A6"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Example Sentence</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={newWord.example}
                onChangeText={text =>
                  setNewWord(prev => ({ ...prev, example: text }))
                }
                placeholder="Use the word in a sentence"
                placeholderTextColor="#95A5A6"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Topic/Category</Text>
              <TextInput
                style={styles.modalInput}
                value={newWord.topic}
                onChangeText={text =>
                  setNewWord(prev => ({ ...prev, topic: text }))
                }
                placeholder="e.g., Business, Travel, Academic"
                placeholderTextColor="#95A5A6"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color="#7F8C8D" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Word ✏️</Text>
            <TouchableOpacity onPress={editWord}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editingWord ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Word *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editingWord.word}
                    onChangeText={text =>
                      setEditingWord(prev =>
                        prev ? { ...prev, word: text } : null
                      )
                    }
                    placeholder="Enter the word"
                    placeholderTextColor="#95A5A6"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Pronunciation</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editingWord.pronunciation}
                    onChangeText={text =>
                      setEditingWord(prev =>
                        prev ? { ...prev, pronunciation: text } : null
                      )
                    }
                    placeholder="/prəˌnʌnsiˈeɪʃən/"
                    placeholderTextColor="#95A5A6"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Definition *</Text>
                  <TextInput
                    style={[styles.modalInput, styles.textArea]}
                    value={editingWord.definition}
                    onChangeText={text =>
                      setEditingWord(prev =>
                        prev ? { ...prev, definition: text } : null
                      )
                    }
                    placeholder="What does this word mean?"
                    placeholderTextColor="#95A5A6"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Example Sentence</Text>
                  <TextInput
                    style={[styles.modalInput, styles.textArea]}
                    value={editingWord.example}
                    onChangeText={text =>
                      setEditingWord(prev =>
                        prev ? { ...prev, example: text } : null
                      )
                    }
                    placeholder="Use the word in a sentence"
                    placeholderTextColor="#95A5A6"
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Topic/Category</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editingWord.topic || ""}
                    onChangeText={text =>
                      setEditingWord(prev =>
                        prev ? { ...prev, topic: text } : null
                      )
                    }
                    placeholder="e.g., Business, Travel, Academic"
                    placeholderTextColor="#95A5A6"
                  />
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.reviewModalContainer}>
          <View style={styles.reviewModalHeader}>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.reviewModalTitle}>Flashcard Review</Text>
            <View style={styles.reviewStats}>
              <Text style={styles.reviewStatsText}>
                {reviewStats.correct}/{reviewStats.total}
              </Text>
            </View>
          </View>

          {renderFlashcard()}

          {showAnswer ? (
            <View style={styles.answerButtons}>
              <TouchableOpacity
                style={[styles.answerButton, styles.wrongButton]}
                onPress={() => handleReviewAnswer(false)}
              >
                <XCircle size={24} color="#FFFFFF" />
                <Text style={styles.answerButtonText}>Hard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.answerButton, styles.correctButton]}
                onPress={() => handleReviewAnswer(true)}
              >
                <CheckCircle size={24} color="#FFFFFF" />
                <Text style={styles.answerButtonText}>Easy</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
  },
  mascotContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 10,
  },
  mascot: {
    fontSize: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#2C3E50",
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
  },
  searchResultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B9D",
  },
  searchResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultWord: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  searchResultPronunciation: {
    fontSize: 16,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginBottom: 4,
  },
  partOfSpeech: {
    fontSize: 14,
    color: "#9B59B6",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  playButton: {
    backgroundColor: "rgba(255, 107, 157, 0.1)",
    borderRadius: 20,
    padding: 8,
  },
  searchResultDefinition: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 24,
    marginBottom: 16,
  },
  exampleContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 4,
  },
  searchResultExample: {
    fontSize: 14,
    color: "#2C3E50",
    fontStyle: "italic",
    lineHeight: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  vocabularyResultsContainer: {
    marginTop: 16,
  },
  vocabularyResultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  vocabularyResultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#2ECC71",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyMascot: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 20,
  },
  reviewSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  reviewCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  reviewGradient: {
    padding: 20,
  },
  reviewContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewInfo: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  tabSection: {
    marginTop: 30,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeTab: {
    backgroundColor: "#FF6B9D",
  },
  tabText: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  wordsSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  wordsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  wordsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  wordsCount: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 8,
  },
  wordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  wordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  wordCardInfo: {
    flex: 1,
  },
  wordTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  wordCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  wordCardPronunciation: {
    fontSize: 14,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginBottom: 6,
  },
  topicBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  topicText: {
    fontSize: 12,
    color: "#9B59B6",
    fontWeight: "600",
    marginLeft: 4,
  },
  playButtonSmall: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 6,
  },
  wordCardDefinition: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
    marginBottom: 12,
  },
  wordCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ECF0F1",
  },
  wordCardStats: {
    flex: 1,
  },
  dateAdded: {
    fontSize: 12,
    color: "#95A5A6",
    marginBottom: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: "#2ECC71",
    fontWeight: "600",
  },
  wordActions: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 6,
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  saveText: {
    fontSize: 16,
    color: "#2ECC71",
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2C3E50",
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  reviewModalContainer: {
    flex: 1,
    backgroundColor: "#2C3E50",
  },
  reviewModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  reviewStats: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reviewStatsText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  flashcardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  reviewProgress: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
    opacity: 0.9,
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
  cardWrapper: {
    height: 400,
    marginBottom: 30,
  },
  flashcard: {
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
    transform: [{ perspective: 1000 }],
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
  flashcardWord: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 16,
  },
  flashcardWordBack: {
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
  flashcardPronunciation: {
    fontSize: 18,
    color: "#7F8C8D",
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  flashcardDefinition: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 30,
  },
  exampleContainerFlashcard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  exampleLabelFlashcard: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
  },
  flashcardExample: {
    fontSize: 16,
    color: "#FFFFFF",
    fontStyle: "italic",
    lineHeight: 22,
  },
  topicBadgeFlashcard: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topicTextFlashcard: {
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
    zIndex: 10,
    backgroundColor: "transparent",
  },
  mascotEncouragement: {
    alignItems: "center",
    marginBottom: 20,
  },
  encouragementMascot: {
    fontSize: 40,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  answerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  bottomPadding: {
    height: 100,
  },
});