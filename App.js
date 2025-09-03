import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import ProfileSelectionScreen from './screens/ProfileSelectionScreen';
import ProfileCreationScreen from './screens/ProfileCreationScreen';
import SettingsScreen from './screens/SettingsScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import { ProfileManager } from './utils/profileManager';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [gameSettings, setGameSettings] = useState({
    timeLimit: 30,
    difficulty: 'easy'
  });
  const [gameResults, setGameResults] = useState(null);
  const [leaderboardSettings, setLeaderboardSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  // Auto-hide welcome notification after 3 seconds
  useEffect(() => {
    if (welcomeVisible) {
      const timer = setTimeout(() => {
        setWelcomeVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [welcomeVisible]);

  const initializeApp = async () => {
    try {
      const profile = await ProfileManager.getCurrentProfile();
      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    setCurrentScreen('profileSelection');
  };

  const handleViewLeaderboard = (settings = null) => {
    setLeaderboardSettings(settings);
    setCurrentScreen('leaderboard');
  };

  const handleProfileSelected = (profile) => {
    setCurrentProfile(profile);
    setWelcomeVisible(true);
    setCurrentScreen('settings');
  };

  const handleCreateNewProfile = () => {
    setCurrentScreen('profileCreation');
  };

  const handleProfileCreated = (profile) => {
    setCurrentProfile(profile);
    setCurrentScreen('settings');
  };

  const handleSettingsComplete = (settings) => {
    setGameSettings(settings);
    setCurrentScreen('game');
  };

  const handleGameComplete = async (results) => {
    setGameResults(results);
    
    // Save results to current profile
    if (currentProfile) {
      try {
        await ProfileManager.updateProfileStats(currentProfile.id, results);
        // Refresh current profile data
        const updatedProfile = await ProfileManager.getCurrentProfile();
        setCurrentProfile(updatedProfile);
      } catch (error) {
        console.error('Error updating profile stats:', error);
      }
    }
    
    setCurrentScreen('results');
  };

  const handlePlayAgain = () => {
    setCurrentScreen('settings');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleBackToProfileSelection = () => {
    setCurrentScreen('profileSelection');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Zap Zap... ⚡</Text>
      </View>
    );
  }

  if (currentScreen === 'profileSelection') {
    return (
      <ProfileSelectionScreen 
        onProfileSelected={handleProfileSelected}
        onCreateNew={handleCreateNewProfile}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentScreen === 'profileCreation') {
    return (
      <ProfileCreationScreen 
        onProfileCreated={handleProfileCreated}
        onBack={handleBackToProfileSelection}
      />
    );
  }

  if (currentScreen === 'settings') {
    return (
      <View style={styles.safeContainer}>
        <SettingsScreen 
          onSettingsComplete={handleSettingsComplete}
          onBack={handleBackToProfileSelection}
          currentSettings={gameSettings}
        />
        
        {/* Temporary Welcome Notification */}
        {welcomeVisible && currentProfile && (
          <View style={styles.welcomeNotificationOverlay}>
            <View style={styles.welcomeNotification}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <View style={styles.welcomeProfileInfo}>
                <Text style={styles.welcomeAvatar}>{currentProfile.avatar.emoji}</Text>
                <Text style={styles.welcomeName}>{currentProfile.name}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  if (currentScreen === 'game') {
    return (
      <GameScreen 
        settings={gameSettings}
        currentProfile={currentProfile}
        onGameComplete={handleGameComplete}
        onBack={() => setCurrentScreen('settings')}
      />
    );
  }

  if (currentScreen === 'results') {
    return (
      <ResultsScreen 
        results={gameResults}
        currentProfile={currentProfile}
        onPlayAgain={handlePlayAgain}
        onBackToHome={handleBackToHome}
        onViewLeaderboard={() => handleViewLeaderboard({
          difficulty: gameResults.difficulty,
          timeLimit: gameResults.timeLimit
        })}
      />
    );
  }

  if (currentScreen === 'leaderboard') {
    return (
      <LeaderboardScreen 
        onBack={handleBackToHome}
        initialSettings={leaderboardSettings}
      />
    );
  }

  return (
    <View style={styles.safeContainer}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('./assets/bg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.content}>
          {/* Zap Zap Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('./assets/zap-zap-icon-square-nobg.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Game Buttons */}
          <View style={styles.gameButtonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleStartGame}>
              <Text style={styles.buttonText}>Play Game! 🎮</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.leaderboardButton} onPress={handleViewLeaderboard}>
              <Text style={styles.leaderboardButtonText}>🏆 Leaderboard</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallScreen ? 20 : 30,
    paddingTop: isSmallScreen ? 30 : 50,
    paddingBottom: isSmallScreen ? 30 : 50,
  },
  logoContainer: {
    marginBottom: isSmallScreen ? 40 : 60,
    alignItems: 'center',
  },
  logo: {
    width: isSmallScreen ? 220 : 320,
    height: isSmallScreen ? 220 : 320,
  },
  gameButtonsContainer: {
    alignItems: 'center',
    gap: isSmallScreen ? 15 : 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: isSmallScreen ? 40 : 60,
    paddingVertical: isSmallScreen ? 15 : 20,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  buttonText: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
  },
  leaderboardButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: isSmallScreen ? 30 : 40,
    paddingVertical: isSmallScreen ? 12 : 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  leaderboardButtonText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  welcomeNotificationOverlay: {
    position: 'absolute',
    top: 60,
    right: 20,
    pointerEvents: 'none', // Allow touches to pass through to the screen below
  },
  welcomeNotification: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  welcomeProfileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeAvatar: {
    fontSize: 24,
    marginRight: 10,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});