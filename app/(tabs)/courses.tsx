import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { BookOpen, Star, Users } from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const courses = [
  {
    id: 1,
    title: "TOEIC Vocabulary",
    subtitle: "Business English Essentials",
    level: "Intermediate",
    words: 500,
    progress: 68,
    color: ["#FF6B9D", "#FF8C42"],
    icon: "💼",
    students: "12.5k",
  },
  {
    id: 2,
    title: "IELTS Academic",
    subtitle: "Academic Writing & Speaking",
    level: "Advanced",
    words: 750,
    progress: 42,
    color: ["#9B59B6", "#8E44AD"],
    icon: "🎓",
    students: "8.2k",
  },
  {
    id: 3,
    title: "High School English",
    subtitle: "Grade 10-12 Vocabulary",
    level: "Beginner",
    words: 300,
    progress: 85,
    color: ["#2ECC71", "#27AE60"],
    icon: "🏫",
    students: "15.7k",
  },
  {
    id: 4,
    title: "Medical Terms",
    subtitle: "Healthcare Professional",
    level: "Expert",
    words: 400,
    progress: 23,
    color: ["#E74C3C", "#C0392B"],
    icon: "🏥",
    students: "4.1k",
  },
  {
    id: 5,
    title: "Daily Conversation",
    subtitle: "Everyday English",
    level: "Beginner",
    words: 200,
    progress: 90,
    color: ["#F39C12", "#E67E22"],
    icon: "💬",
    students: "25.3k",
  },
  {
    id: 6,
    title: "Technology Terms",
    subtitle: "IT & Software",
    level: "Intermediate",
    words: 350,
    progress: 55,
    color: ["#3498DB", "#2980B9"],
    icon: "💻",
    students: "9.8k",
  },
];

const navigateToLesson = (courseId: number) => {
  router.push(`/lesson/${courseId}`);
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "#2ECC71";
    case "Intermediate":
      return "#F39C12";
    case "Advanced":
      return "#9B59B6";
    case "Expert":
      return "#E74C3C";
    default:
      return "#7F8C8D";
  }
};

export default function CoursesScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={["#9B59B6", "#8E44AD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Course Library</Text>
            <Text style={styles.headerSubtitle}>
              Choose your learning path with Michi! 🐱
            </Text>
          </View>
          <View style={styles.mascotContainer}>
            <Text style={styles.mascot}>📚</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Popular Courses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FF6B9D" />
          <Text style={styles.sectionTitle}>Popular Courses</Text>
        </View>

        {courses.map((course, index) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => navigateToLesson(course.id)}
          >
            <LinearGradient
              colors={course.color}
              style={styles.courseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.courseContent}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseIconContainer}>
                    <Text style={styles.courseIcon}>{course.icon}</Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseSubtitle}>{course.subtitle}</Text>
                  </View>
                  <View style={styles.courseMeta}>
                    <View
                      style={[
                        styles.levelBadge,
                        { backgroundColor: getLevelColor(course.level) },
                      ]}
                    >
                      <Text style={styles.levelText}>{course.level}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.courseStats}>
                  <View style={styles.statItem}>
                    <BookOpen size={16} color="#FFFFFF" />
                    <Text style={styles.statText}>{course.words} words</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Users size={16} color="#FFFFFF" />
                    <Text style={styles.statText}>
                      {course.students} students
                    </Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressPercent}>
                      {course.progress}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${course.progress}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Coming Soon Section */}
      <View style={styles.section}>
        <Text style={{ ...styles.sectionTitle, marginBottom: 8 }}>
          Coming Soon 🚀
        </Text>
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>🎯</Text>
          <View style={styles.comingSoonContent}>
            <Text style={styles.comingSoonTitle}>TOEFL Preparation</Text>
            <Text style={styles.comingSoonSubtitle}>
              Complete TOEFL vocabulary course with speaking practice
            </Text>
          </View>
        </View>

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonIcon}>🌍</Text>
          <View style={styles.comingSoonContent}>
            <Text style={styles.comingSoonTitle}>Travel English</Text>
            <Text style={styles.comingSoonSubtitle}>
              Essential phrases for travelers and tourists
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  courseCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  courseGradient: {
    padding: 20,
  },
  courseContent: {
    flex: 1,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  courseIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  courseIcon: {
    fontSize: 24,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  courseMeta: {
    alignItems: "flex-end",
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  courseStats: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 6,
    opacity: 0.9,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
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
  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comingSoonIcon: {
    fontSize: 30,
    marginRight: 16,
  },
  comingSoonContent: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 18,
  },
  bottomPadding: {
    height: 30,
  },
});
