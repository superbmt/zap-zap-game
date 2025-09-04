import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { ProfileManager } from '../utils/profileManager';

export default function LeaderboardScreen({ onBack, initialSettings, playClickSound }) {
  const [nestedLeaderboards, setNestedLeaderboards] = useState({});
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialSettings?.difficulty || 'easy');
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(initialSettings?.timeLimit || 30);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const difficulties = [
    { key: 'easy', label: 'Easy', subtitle: 'Ages 4-6', color: '#FFD700' },
    { key: 'medium', label: 'Medium', subtitle: 'Ages 7-9', color: '#C0C0C0' },
    { key: 'hard', label: 'Hard', subtitle: 'Ages 9-11', color: '#FF6B9D' },
    { key: 'ultra', label: 'Ultra', subtitle: 'Ages 11+', color: '#9C27B0' },
  ];

  const timeLimits = [
    { key: 15, label: '⚡ 15s', icon: '⚡', color: '#FF4444' },
    { key: 30, label: '🕐 30s', icon: '🕐', color: '#4CAF50' },
    { key: 45, label: '⏱️ 45s', icon: '⏱️', color: '#FF9800' },
    { key: 60, label: '⏰ 60s', icon: '⏰', color: '#2196F3' },
  ];

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const handleDifficultyChange = async (difficulty) => {
    if (playClickSound) {
      await playClickSound();
    }
    setSelectedDifficulty(difficulty);
  };

  const handleTimeLimitChange = async (timeLimit) => {
    if (playClickSound) {
      await playClickSound();
    }
    setSelectedTimeLimit(timeLimit);
  };

  const handleBack = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onBack();
  };

  const loadLeaderboards = async () => {
    try {
      const leaders = await ProfileManager.getNestedCategoryLeaderboards(10);
      const current = await ProfileManager.getCurrentProfile();
      setNestedLeaderboards(leaders);
      setCurrentProfile(current);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentLeaderboard = nestedLeaderboards[selectedDifficulty]?.[selectedTimeLimit] || [];
  const selectedDifficultyInfo = difficulties.find(d => d.key === selectedDifficulty);
  const selectedTimeLimitInfo = timeLimits.find(t => t.key === selectedTimeLimit);

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#FF6B9D'; // Default pink
    }
  };

  if (loading) {
    return (
      <View style={styles.safeContainer}>
        <ImageBackground
          source={require('../assets/bg.png')}
          style={styles.container}
          resizeMode="cover"
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading leaderboard... 🏆</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.safeContainer}>
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Champions 🏆</Text>
          
          {/* Difficulty Tabs */}
          <View style={styles.difficultyTabs}>
            {difficulties.map((difficulty) => (
                              <TouchableOpacity
                  key={difficulty.key}
                  style={[
                    styles.difficultyTab,
                    selectedDifficulty === difficulty.key && styles.selectedDifficultyTab,
                  ]}
                  onPress={() => handleDifficultyChange(difficulty.key)}
                >
                  <View style={[styles.difficultyColorIndicator, { backgroundColor: difficulty.color }]} />
                  <Text style={[
                    styles.difficultyTabText,
                    selectedDifficulty === difficulty.key && styles.selectedDifficultyTabText
                  ]}>
                    {difficulty.label}
                  </Text>
                </TouchableOpacity>
            ))}
          </View>

          {/* Time Limit Tabs */}
          <View style={styles.timeLimitTabs}>
            {timeLimits.map((timeLimit) => (
              <TouchableOpacity
                key={timeLimit.key}
                style={[
                  styles.timeLimitTab,
                  selectedTimeLimit === timeLimit.key && styles.selectedTimeLimitTab,
                  { borderColor: timeLimit.color }
                ]}
                onPress={() => handleTimeLimitChange(timeLimit.key)}
              >
                <Text style={[
                  styles.timeLimitTabText,
                  selectedTimeLimit === timeLimit.key && styles.selectedTimeLimitTabText
                ]}>
                  {timeLimit.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider Line */}
          <View style={styles.dividerLine} />

          {/* Selected Category Title */}
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryTitle, { color: selectedDifficultyInfo?.color }]}>
              {selectedDifficultyInfo?.label} • {selectedTimeLimitInfo?.label} Champions
            </Text>
            <Text style={styles.categorySubtitle}>
              {selectedDifficultyInfo?.subtitle} • {selectedTimeLimitInfo?.key} second rounds
            </Text>
          </View>
          
          {currentLeaderboard.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No champions yet!</Text>
              <Text style={styles.noDataSubtext}>
                Be the first to conquer {selectedDifficultyInfo?.label} {selectedTimeLimitInfo?.key}s mode! 🎮
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardContainer}>
              {/* Top 3 Podium */}
              {currentLeaderboard.length >= 3 && (
                <View style={styles.podiumContainer}>
                  {/* Second Place */}
                  <View style={[styles.podiumSpot, styles.secondPlace]}>
                    <Text style={styles.podiumEmoji}>{currentLeaderboard[1].avatar.emoji}</Text>
                    <Text style={styles.podiumRank}>🥈</Text>
                    <Text style={styles.podiumName}>{currentLeaderboard[1].name}</Text>
                    <Text style={styles.podiumScore}>{currentLeaderboard[1].topScore}</Text>
                  </View>
                  
                  {/* First Place */}
                  <View style={[styles.podiumSpot, styles.firstPlace]}>
                    <Text style={styles.podiumEmoji}>{currentLeaderboard[0].avatar.emoji}</Text>
                    <Text style={styles.podiumRank}>🥇</Text>
                    <Text style={styles.podiumName}>{currentLeaderboard[0].name}</Text>
                    <Text style={styles.podiumScore}>{currentLeaderboard[0].topScore}</Text>
                  </View>
                  
                  {/* Third Place */}
                  <View style={[styles.podiumSpot, styles.thirdPlace]}>
                    <Text style={styles.podiumEmoji}>{currentLeaderboard[2].avatar.emoji}</Text>
                    <Text style={styles.podiumRank}>🥉</Text>
                    <Text style={styles.podiumName}>{currentLeaderboard[2].name}</Text>
                    <Text style={styles.podiumScore}>{currentLeaderboard[2].topScore}</Text>
                  </View>
                </View>
              )}

              {/* Full Rankings List */}
              <View style={styles.rankingsContainer}>
                <Text style={styles.rankingsTitle}>Full Rankings</Text>
                {currentLeaderboard.map((player, index) => (
                  <View 
                    key={player.id} 
                    style={[
                      styles.rankingRow,
                      currentProfile?.id === player.id && styles.currentPlayerRow,
                      index < 3 && styles.topThreeRow
                    ]}
                  >
                    <View style={styles.rankSection}>
                      <View style={[styles.rankBadge, { backgroundColor: getRankColor(index + 1) }]}>
                        <Text style={styles.rankText}>
                          {typeof getRankEmoji(index + 1) === 'string' && getRankEmoji(index + 1).includes('🥇') ? getRankEmoji(index + 1) : getRankEmoji(index + 1)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.playerSection}>
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerAvatar}>{player.avatar.emoji}</Text>
                        <View style={styles.playerDetails}>
                          <Text style={styles.playerName}>
                            {player.name}
                            {currentProfile?.id === player.id && ' (You)'}
                          </Text>
                          <Text style={styles.playerStats}>
                            {player.gamesInCategory} games • Avg: {player.averageScore}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.scoreSection}>
                      <Text style={styles.topScore}>{player.topScore}</Text>
                      <Text style={styles.scoreLabel}>Best</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back to Game 🎮</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  difficultyTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  difficultyTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedDifficultyTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ scale: 1.05 }],
  },
  difficultyColorIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  difficultyTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  selectedDifficultyTabText: {
    color: '#000',
    fontSize: 17,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 15,
    marginHorizontal: 40,
  },
  timeLimitTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  timeLimitTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 55,
  },
  selectedTimeLimitTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 2.5,
    transform: [{ scale: 1.1 }],
  },
  timeLimitTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#444',
  },
  selectedTimeLimitTabText: {
    color: '#000',
    fontSize: 12,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    marginVertical: 80,
  },
  noDataText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noDataSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  podiumSpot: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  firstPlace: {
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 0,
    paddingVertical: 20,
  },
  secondPlace: {
    borderWidth: 3,
    borderColor: '#C0C0C0',
    marginBottom: 15,
  },
  thirdPlace: {
    borderWidth: 3,
    borderColor: '#CD7F32',
    marginBottom: 25,
  },
  podiumEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  podiumRank: {
    fontSize: 30,
    marginBottom: 5,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  rankingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  rankingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  currentPlayerRow: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  topThreeRow: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  rankSection: {
    width: 50,
    alignItems: 'center',
  },
  rankBadge: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  playerSection: {
    flex: 1,
    marginLeft: 10,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    fontSize: 30,
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  playerStats: {
    fontSize: 12,
    color: '#666',
  },
  scoreSection: {
    alignItems: 'center',
    minWidth: 60,
  },
  topScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF1493',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
