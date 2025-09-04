import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function ResultsScreen({ results, currentProfile, onPlayAgain, onBackToHome, onViewLeaderboard, playClickSound, playTadaSound, restoreBackgroundMusic }) {
  const [isNewPersonalRecord, setIsNewPersonalRecord] = useState(false);

  useEffect(() => {
    checkPersonalRecord();
    
    // Play tada sound and then restore background music
    const playResultsAudio = async () => {
      if (playTadaSound) {
        await playTadaSound();
        console.log('🎉 Tada sound played');
        
        // Wait for tada sound to finish, then restore background music
        setTimeout(() => {
          if (restoreBackgroundMusic) {
            restoreBackgroundMusic(0.3, 1000);
            console.log('🎵 Background music restored after tada');
          }
        }, 2000); // Wait 2 seconds for tada sound to finish
      }
    };
    
    playResultsAudio();
  }, [playTadaSound, restoreBackgroundMusic]);

  const checkPersonalRecord = async () => {
    if (currentProfile && results.score > currentProfile.bestScore) {
      setIsNewPersonalRecord(true);
    }
  };

  const handlePlayAgain = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onPlayAgain();
  };

  const handleBackToHome = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onBackToHome();
  };

  const handleViewLeaderboard = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onViewLeaderboard();
  };

  const getPerformanceMessage = () => {
    const accuracy = parseFloat(results.accuracy);
    
    if (accuracy >= 90) {
      return "🏆 Amazing! You're a math superstar! ⭐";
    } else if (accuracy >= 75) {
      return "🎉 Great job! You're doing fantastic! 💪";
    } else if (accuracy >= 60) {
      return "👍 Good work! Keep practicing! 📚";
    } else if (accuracy >= 40) {
      return "💪 Nice try! You're getting better! 🌟";
    } else {
      return "🌱 Keep practicing! Every try makes you stronger! 💪";
    }
  };

  const getScoreEmoji = () => {
    const accuracy = parseFloat(results.accuracy);
    if (accuracy >= 90) return "🏆";
    if (accuracy >= 75) return "🎉";
    if (accuracy >= 60) return "👍";
    if (accuracy >= 40) return "💪";
    return "🌱";
  };

  return (
    <View style={styles.safeContainer}>
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.content}>
        <Text style={styles.title}>Game Over! {getScoreEmoji()}</Text>
        
        {/* Player Info */}
        {currentProfile && (
          <View style={styles.playerInfoContainer}>
            <Text style={styles.playerAvatar}>{currentProfile.avatar.emoji}</Text>
            <Text style={styles.playerName}>{currentProfile.name}</Text>
          </View>
        )}
        
        {isNewPersonalRecord && (
          <View style={styles.recordBanner}>
            <Text style={styles.recordText}>🏆 NEW PERSONAL BEST! 🏆</Text>
          </View>
        )}

        {/* Achievement Cards */}
        <View style={styles.achievementCards}>
          <View style={styles.achievementCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🎯</Text>
            </View>
            <Text style={styles.cardTitle}>Score</Text>
            <Text style={styles.cardValue}>{results.score}/{results.questionsAnswered}</Text>
          </View>
          
          <View style={styles.achievementCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>📊</Text>
            </View>
            <Text style={styles.cardTitle}>Accuracy</Text>
            <Text style={styles.cardValue}>{results.accuracy}%</Text>
          </View>
          
          <View style={styles.achievementCard}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>🔥</Text>
            </View>
            <Text style={styles.cardTitle}>Best Streak</Text>
            <Text style={styles.cardValue}>{results.streak}</Text>
          </View>
        </View>

        {/* Settings Info */}
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Time Limit:</Text>
            <Text style={styles.settingValue}>{results.timeLimit}s</Text>
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Difficulty:</Text>
            <Text style={styles.settingValue}>
              {results.difficulty === 'easy' ? '🟡 Easy' : 
               results.difficulty === 'medium' ? '⚪ Medium' : 
               results.difficulty === 'hard' ? '🔴 Hard' :
               results.difficulty === 'ultra' ? '🟣 Ultra' :
               'Unknown'}
            </Text>
          </View>
          
          {currentProfile && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Personal Best:</Text>
              <Text style={styles.settingValue}>{Math.max(currentProfile.bestScore, results.score)}</Text>
            </View>
          )}
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{getPerformanceMessage()}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
            <Text style={styles.homeButtonText}>🏠 Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.leaderboardButton} onPress={handleViewLeaderboard}>
            <Text style={styles.leaderboardButtonText}>🏆 Leaderboard</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.playAgainButton} onPress={handlePlayAgain}>
          <Text style={styles.playAgainButtonText}>Play Again! ⚡</Text>
        </TouchableOpacity>

        {/* Fun Achievement Badges */}
        <View style={styles.achievementsContainer}>
          {parseFloat(results.accuracy) === 100 && results.questionsAnswered >= 5 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🎯 Perfect!</Text>
            </View>
          )}
          
          {results.streak >= 10 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔥 Hot Streak!</Text>
            </View>
          )}
          
          {results.score >= 20 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>💪 Speed Demon!</Text>
            </View>
          )}
          
          {results.questionsAnswered >= 30 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏃‍♂️ Marathon!</Text>
            </View>
          )}
        </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000', // Fallback color
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 15 : 20,
    paddingTop: isSmallScreen ? 30 : 50,
    paddingBottom: isSmallScreen ? 20 : 30,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: isSmallScreen ? 24 : 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 10 : 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  playerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: isSmallScreen ? 15 : 20,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: 20,
    marginBottom: isSmallScreen ? 15 : 20,
  },
  playerAvatar: {
    fontSize: isSmallScreen ? 20 : 24,
    marginRight: 10,
  },
  playerName: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recordBanner: {
    backgroundColor: '#FFD700',
    paddingVertical: isSmallScreen ? 12 : 15,
    paddingHorizontal: isSmallScreen ? 15 : 20,
    borderRadius: 20,
    marginBottom: isSmallScreen ? 15 : 20,
    borderWidth: 3,
    borderColor: '#FFA500',
  },
  recordText: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  achievementCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 15 : 20,
    paddingHorizontal: isSmallScreen ? 2 : 5,
  },
  achievementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: isSmallScreen ? 10 : 15,
    borderRadius: 20,
    alignItems: 'center',
    flex: 0.3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    marginHorizontal: isSmallScreen ? 2 : 3,
  },
  cardIcon: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    borderRadius: isSmallScreen ? 20 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  cardIconText: {
    fontSize: isSmallScreen ? 20 : 24,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: isSmallScreen ? 15 : 20,
    borderRadius: 15,
    marginBottom: isSmallScreen ? 15 : 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 4 : 6,
  },
  settingLabel: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '500',
    color: '#666',
  },
  settingValue: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: isSmallScreen ? 15 : 20,
    borderRadius: 15,
    marginBottom: isSmallScreen ? 20 : 30,
  },
  messageText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    lineHeight: isSmallScreen ? 20 : 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: isSmallScreen ? 10 : 15,
    width: '100%',
    justifyContent: 'space-between',
  },
  homeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: isSmallScreen ? 12 : 15,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 0.45,
  },
  homeButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  leaderboardButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: isSmallScreen ? 12 : 15,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    flex: 0.45,
  },
  leaderboardButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: isSmallScreen ? 30 : 40,
    paddingVertical: isSmallScreen ? 12 : 15,
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
    marginBottom: isSmallScreen ? 15 : 20,
  },
  playAgainButtonText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isSmallScreen ? 8 : 10,
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: isSmallScreen ? 12 : 15,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  badgeText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
