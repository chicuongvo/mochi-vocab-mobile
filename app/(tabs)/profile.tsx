import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Star, Trophy } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const userStats = {
    name: "Sarah Johnson",
    level: "Advanced Learner",
    currentStreak: 7,
    longestStreak: 23,
    totalWords: 1247,
    wordsThisWeek: 45,
    studyTime: 142, // minutes
    accuracy: 87,
    achievements: 12,
    joinDate: "January 2024",
  };

  const recentAchievements = [
    {
      id: 1,
      title: "Week Warrior",
      description: "7 day study streak",
      icon: "🔥",
      date: "Today",
    },
    {
      id: 2,
      title: "Vocabulary Master",
      description: "1000+ words learned",
      icon: "📚",
      date: "2 days ago",
    },
    {
      id: 3,
      title: "Golden Timer",
      description: "Perfect Golden Time week",
      icon: "⏰",
      date: "1 week ago",
    },
  ];

  const weeklyProgress = [
    { day: "Mon", words: 8, minutes: 25 },
    { day: "Tue", words: 12, minutes: 30 },
    { day: "Wed", words: 6, minutes: 15 },
    { day: "Thu", words: 10, minutes: 28 },
    { day: "Fri", words: 15, minutes: 35 },
    { day: "Sat", words: 9, minutes: 22 },
    { day: "Sun", words: 11, minutes: 27 },
  ];

  const maxWords = Math.max(...weeklyProgress.map(d => d.words));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Profile */}
      <LinearGradient
        colors={["#9B59B6", "#8E44AD"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👩‍🎓</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userStats.name}</Text>
            <Text style={styles.userLevel}>{userStats.level}</Text>
            <Text style={styles.joinDate}>
              Learning since {userStats.joinDate}
            </Text>
          </View>
          <View style={styles.mascotContainer}>
            <Text style={styles.mascot}>🐱</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Trophy size={20} color="#F39C12" />
            </View>
            <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <BookOpen size={20} color="#2ECC71" />
            </View>
            <Text style={styles.statNumber}>{userStats.totalWords}</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>

          {/* <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={20} color="#9B59B6" />
            </View>
            <Text style={styles.statNumber}>{userStats.studyTime}</Text>
            <Text style={styles.statLabel}>Study Minutes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Target size={20} color="#E74C3C" />
            </View>
            <Text style={styles.statNumber}>{userStats.accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View> */}
        </View>
      </View>

      {/* Weekly Progress Chart */}
      <View style={styles.section}>
        <Text style={{ ...styles.sectionTitle, marginBottom: 12 }}>
          Weekly Progress 📊
        </Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Words Learned This Week</Text>
            <Text style={styles.chartSubtitle}>
              {userStats.wordsThisWeek} total words
            </Text>
          </View>
          <View style={styles.chart}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (day.words / maxWords) * 80,
                      backgroundColor:
                        day.words === maxWords ? "#FF6B9D" : "#E8E8E8",
                    },
                  ]}
                />
                <Text style={styles.barValue}>{day.words}</Text>
                <Text style={styles.barLabel}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#F39C12" />
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
        </View>

        {recentAchievements.map(achievement => (
          <View key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
            <Text style={styles.achievementDate}>{achievement.date}</Text>
          </View>
        ))}
      </View>

      {/* Learning Insights */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Insights 🧠</Text>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <TrendingUp size={20} color="#2ECC71" />
            <Text style={styles.insightTitle}>Your Learning Pattern</Text>
          </View>
          <Text style={styles.insightText}>
            You're most productive in the morning! 🌅 Your best learning time is
            between 8:00 AM - 10:00 AM with 92% accuracy rate.
          </Text>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Target size={20} color="#FF6B9D" />
            <Text style={styles.insightTitle}>Strength Areas</Text>
          </View>
          <Text style={styles.insightText}>
            You excel at TOEIC vocabulary (95% accuracy) and Academic terms (89%
            accuracy). Consider challenging yourself with Medical terminology
            next! 💪
          </Text>
        </View>
      </View> */}

      {/* Goals Section */}
      <View style={styles.section}>
        <Text style={{ ...styles.sectionTitle, marginBottom: 12 }}>
          Goals & Milestones 🎯
        </Text>
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Monthly Goal</Text>
            <Text style={styles.goalProgress}>67%</Text>
          </View>
          <Text style={styles.goalDescription}>
            Learn 200 new words this month
          </Text>
          <View style={styles.goalBarContainer}>
            <View style={[styles.goalBar, { width: "67%" }]} />
          </View>
          <Text style={styles.goalStats}>134 / 200 words completed</Text>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Streak Challenge</Text>
            <Text style={styles.goalProgress}>30%</Text>
          </View>
          <Text style={styles.goalDescription}>
            Maintain 30-day study streak
          </Text>
          <View style={styles.goalBarContainer}>
            <View
              style={[
                styles.goalBar,
                { width: "30%", backgroundColor: "#F39C12" },
              ]}
            />
          </View>
          <Text style={styles.goalStats}>9 / 30 days completed</Text>
        </View>
      </View>

      {/* Motivational Section */}
      <View style={styles.motivationSection}>
        <View style={styles.motivationCard}>
          <Text style={styles.motivationIcon}>🎉</Text>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>Keep Going, Champion!</Text>
            <Text style={styles.motivationText}>
              Mochi & Michi are so proud of your progress! You've come so far,
              and every word you learn brings you closer to fluency. Keep
              shining! ✨
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
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    padding: 8,
    marginRight: 16,
  },
  avatar: {
    fontSize: 40,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  mascotContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    padding: 10,
  },
  mascot: {
    fontSize: 30,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statIcon: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 10,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
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
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  achievementCard: {
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
  achievementIcon: {
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 30,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  achievementDate: {
    fontSize: 12,
    color: "#95A5A6",
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  goalDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 12,
  },
  goalBarContainer: {
    height: 8,
    backgroundColor: "#ECF0F1",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  goalBar: {
    height: "100%",
    backgroundColor: "#2ECC71",
    borderRadius: 4,
  },
  goalStats: {
    fontSize: 12,
    color: "#95A5A6",
  },
  motivationSection: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 30,
  },
  motivationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  motivationIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 30,
  },
});
