import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageBackground, Dimensions, Platform } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import ProfileSelectionScreen from './screens/ProfileSelectionScreen';
import ProfileCreationScreen from './screens/ProfileCreationScreen';
import SettingsScreen from './screens/SettingsScreen';
import CountdownScreen from './screens/CountdownScreen';
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
  const [isMuted, setIsMuted] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const backgroundMusic = useRef(null);
  const mutedRef = useRef(false);
  const sounds = useRef({
    click: null,
    countdown: null,
    gameStart: null,
    gamePlay: null,
    tada: null,
    // Future sounds can be added here: back, success, error, etc.
    // back: null,
    // success: null,
    // error: null,
  });
  const gameMusic = useRef(null);

  useEffect(() => {
    initializeApp();
    initializeBackgroundMusic();
    initializeSounds();
    
    return () => {
      // Cleanup music on app unmount
      if (backgroundMusic.current) {
        if (Platform.OS === 'web') {
          backgroundMusic.current.pause();
          backgroundMusic.current = null;
        } else {
          // Native cleanup
          if (backgroundMusic.current.unloadAsync) {
            backgroundMusic.current.unloadAsync();
          }
        }
      }
      // Cleanup game music
      if (gameMusic.current) {
        if (Platform.OS === 'web') {
          gameMusic.current.pause();
        } else {
          gameMusic.current.stopAsync && gameMusic.current.stopAsync();
        }
        gameMusic.current = null;
      }
      
      // Cleanup all sounds
      Object.values(sounds.current).forEach(sound => {
        if (sound) {
          if (Platform.OS === 'web') {
            // Web cleanup
            sound.pause && sound.pause();
          } else {
            // Native cleanup
            sound.unloadAsync && sound.unloadAsync();
          }
        }
      });
      sounds.current = {};
    };
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

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

  const initializeBackgroundMusic = async () => {
    console.log('🎵 Initializing background music...');
    
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected');
        // Web implementation using HTML5 Audio
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0.3; // Set to 30% volume
        
        // Try different paths for web
        const musicPaths = [
          'http://localhost:8082/assets/game-music-song.mp3', // Development path
          '/assets/game-music-song.mp3', // Production path
          '/assets/assets/game-music-song.mp3' // Alternative production path
        ];
        
        let loaded = false;
        for (const path of musicPaths) {
          try {
            console.log(`🔍 Trying to load music from: ${path}`);
            audio.src = path;
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
              audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                resolve();
              }, { once: true });
              audio.addEventListener('error', (e) => {
                clearTimeout(timeout);
                reject(e);
              }, { once: true });
              audio.load();
            });
            loaded = true;
            console.log(`✅ Successfully loaded music from: ${path}`);
            break;
          } catch (error) {
            console.log(`❌ Failed to load music from ${path}:`, error.message);
          }
        }
        
        if (loaded) {
          backgroundMusic.current = audio;
          setMusicReady(true);
          console.log('✅ Background music ready (web)');
          
          // Set up auto-play after user interaction, but only if not muted
          let hasInteracted = false;
          const startMusic = () => {
            if (hasInteracted) return;
            hasInteracted = true;
            
            // Use ref to get current muted state
            if (!mutedRef.current && backgroundMusic.current) {
              console.log('🎵 Starting music after user interaction');
              backgroundMusic.current.play().catch(console.warn);
            } else {
              console.log('🔇 Music interaction detected but audio is muted');
            }
            document.removeEventListener('click', startMusic);
          };
          document.addEventListener('click', startMusic);
        } else {
          console.warn('❌ Could not load music from any path');
          // Show toggle anyway for debugging
          setMusicReady(true);
        }
      } else {
        console.log('📱 Native platform detected');
        // Native implementation using expo-av
        try {
          console.log('🔄 Importing expo-av...');
          const { Audio } = await import('expo-av');
          console.log('✅ expo-av imported successfully');
          
          // Configure audio mode for background music
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          console.log('✅ Audio mode configured');
          
          console.log('🔄 Loading audio file...');
          const { sound } = await Audio.loadAsync(
            require('./assets/game-music-song.mp3'),
            {
              shouldPlay: false,
              isLooping: true,
              volume: 0.3,
            }
          );
          console.log('✅ Audio file loaded');
          
          backgroundMusic.current = sound;
          setMusicReady(true);
          console.log('✅ Background music ready (native)');
          
          // Auto-play
          if (!mutedRef.current) {
            console.log('🎵 Starting music...');
            await sound.playAsync();
          }
        } catch (importError) {
          console.warn('❌ expo-av import failed:', importError);
          // Show toggle anyway for debugging
          setMusicReady(true);
        }
      }
    } catch (error) {
      console.warn('❌ Music initialization failed:', error);
      // Show toggle anyway for debugging
      setMusicReady(true);
    }
  };

  const initializeSounds = async () => {
    await loadSound('click', 'click.mp3', 0.5);
    await loadSound('countdown', 'countdown.mp3', 0.6);
    await loadSound('gameStart', 'game-start.mp3', 0.7);
    await loadSound('gamePlay', 'game-play.mp3', 0.4);
    await loadSound('tada', 'tada.mp3', 0.8);
  };

  // Sound asset map for native require() - must be static paths
  const soundAssets = {
    'click.mp3': require('./assets/click.mp3'),
    'countdown.mp3': require('./assets/countdown.mp3'),
    'game-start.mp3': require('./assets/game-start.mp3'),
    'game-play.mp3': require('./assets/game-play.mp3'),
    'tada.mp3': require('./assets/tada.mp3'),
    // Future sounds can be added here:
    // 'back.mp3': require('./assets/back.mp3'),
    // 'success.mp3': require('./assets/success.mp3'),
    // 'error.mp3': require('./assets/error.mp3'),
  };

  const loadSound = async (soundName, filename, volume = 0.5) => {
    try {
      if (Platform.OS === 'web') {
        // Web implementation using HTML5 Audio
        const audio = new Audio();
        audio.volume = volume;
        
        const soundPaths = [
          `http://localhost:8082/assets/${filename}`, // Development path
          `/assets/${filename}`, // Production path
          `/assets/assets/${filename}` // Alternative production path
        ];
        
        let loaded = false;
        for (const path of soundPaths) {
          try {
            audio.src = path;
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
              audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                resolve();
              }, { once: true });
              audio.addEventListener('error', (e) => {
                clearTimeout(timeout);
                reject(e);
              }, { once: true });
              audio.load();
            });
            loaded = true;
            console.log(`✅ ${soundName} sound loaded from: ${path}`);
            break;
          } catch (error) {
            console.log(`❌ Failed to load ${soundName} sound from ${path}`);
          }
        }
        
        if (loaded) {
          sounds.current[soundName] = audio;
          console.log(`✅ ${soundName} sound ready (web)`);
        }
      } else {
        // Native implementation using expo-av
        try {
          const { Audio } = await import('expo-av');
          
          const assetSource = soundAssets[filename];
          if (!assetSource) {
            console.warn(`❌ Sound asset not found: ${filename}`);
            return;
          }
          
          const { sound } = await Audio.loadAsync(
            assetSource,
            {
              shouldPlay: false,
              isLooping: false,
              volume: volume,
            }
          );
          
          sounds.current[soundName] = sound;
          console.log(`✅ ${soundName} sound ready (native)`);
        } catch (importError) {
          console.warn(`❌ expo-av not available for ${soundName} sound:`, importError);
        }
      }
    } catch (error) {
      console.warn(`Could not initialize ${soundName} sound:`, error);
    }
  };

  const playSound = async (soundName = 'click') => {
    if (!sounds.current[soundName] || mutedRef.current) return;
    
    try {
      if (Platform.OS === 'web') {
        // Stop any currently playing instance and reset
        sounds.current[soundName].pause();
        sounds.current[soundName].currentTime = 0;
        await sounds.current[soundName].play();
      } else {
        // Native - stop and replay from beginning
        try {
          await sounds.current[soundName].stopAsync();
        } catch (stopError) {
          // Sound might not be playing, ignore error
        }
        await sounds.current[soundName].replayAsync();
      }
      console.log(`🔊 ${soundName} sound played`);
    } catch (error) {
      console.warn(`Error playing ${soundName} sound:`, error);
    }
  };

  const playClickSound = async () => {
    await playSound('click');
  };

  const playCountdownSound = useCallback(async () => {
    await playSound('countdown');
  }, []);

  const playGameStartSound = useCallback(async () => {
    await playSound('gameStart');
  }, []);

  const playTadaSound = useCallback(async () => {
    await playSound('tada');
  }, []);

  const startGameMusic = useCallback(async () => {
    if (!sounds.current.gamePlay || mutedRef.current) return;
    
    try {
      // Stop background music first
      if (backgroundMusic.current) {
        if (Platform.OS === 'web') {
          backgroundMusic.current.pause();
        } else {
          await backgroundMusic.current.pauseAsync();
        }
      }

      // Start game music
      if (Platform.OS === 'web') {
        // Stop any currently playing instance and reset
        sounds.current.gamePlay.pause();
        sounds.current.gamePlay.currentTime = 0;
        sounds.current.gamePlay.loop = true;
        await sounds.current.gamePlay.play();
      } else {
        // Native - stop and replay with loop
        try {
          await sounds.current.gamePlay.stopAsync();
        } catch (stopError) {
          // Sound might not be playing, ignore error
        }
        await sounds.current.gamePlay.setIsLoopingAsync(true);
        await sounds.current.gamePlay.playAsync();
      }
      
      // Store reference for stopping later
      gameMusic.current = sounds.current.gamePlay;
      console.log('🎮 Game music started');
    } catch (error) {
      console.warn('Error starting game music:', error);
    }
  }, []);

  const stopGameMusic = useCallback(async () => {
    if (!gameMusic.current) return;
    
    try {
      if (Platform.OS === 'web') {
        gameMusic.current.pause();
        gameMusic.current.currentTime = 0;
      } else {
        await gameMusic.current.stopAsync();
      }
      
      gameMusic.current = null;
      console.log('🛑 Game music stopped');
    } catch (error) {
      console.warn('Error stopping game music:', error);
    }
  }, []);

  const fadeOutGameMusic = useCallback(async (duration = 2000) => {
    if (!gameMusic.current) return;
    
    try {
      if (Platform.OS === 'web') {
        const startVolume = gameMusic.current.volume;
        const volumeStep = startVolume / (duration / 50);
        
        const fadeInterval = setInterval(() => {
          const currentVolume = gameMusic.current.volume;
          const newVolume = Math.max(0, currentVolume - volumeStep);
          
          if (newVolume <= 0) {
            gameMusic.current.volume = 0;
            clearInterval(fadeInterval);
          } else {
            gameMusic.current.volume = newVolume;
          }
        }, 50);
      } else {
        // Native implementation
        try {
          await gameMusic.current.setVolumeAsync(0, { 
            durationMillis: duration 
          });
        } catch (error) {
          console.warn('Error fading game music (native):', error);
        }
      }
      console.log(`🔉 Game music fading out over ${duration}ms`);
    } catch (error) {
      console.warn('Error fading out game music:', error);
    }
  }, []);

  const fadeBackgroundMusic = useCallback(async (targetVolume = 0.1, duration = 1000) => {
    if (!backgroundMusic.current || !musicReady || mutedRef.current) return;
    
    try {
      if (Platform.OS === 'web') {
        const startVolume = backgroundMusic.current.volume;
        const volumeStep = (targetVolume - startVolume) / (duration / 50);
        
        const fadeInterval = setInterval(() => {
          const currentVolume = backgroundMusic.current.volume;
          const newVolume = currentVolume + volumeStep;
          
          if ((volumeStep > 0 && newVolume >= targetVolume) || 
              (volumeStep < 0 && newVolume <= targetVolume)) {
            backgroundMusic.current.volume = targetVolume;
            clearInterval(fadeInterval);
          } else {
            backgroundMusic.current.volume = newVolume;
          }
        }, 50);
      } else {
        // Native implementation
        try {
          const { Audio } = await import('expo-av');
          await backgroundMusic.current.setVolumeAsync(targetVolume, { 
            durationMillis: duration 
          });
        } catch (error) {
          console.warn('Error fading music (native):', error);
        }
      }
      console.log(`🎵 Background music faded to ${targetVolume * 100}%`);
    } catch (error) {
      console.warn('Error fading background music:', error);
    }
  }, [backgroundMusic, musicReady, mutedRef]);

  const restoreBackgroundMusic = useCallback(async (targetVolume = 0.3, duration = 1000) => {
    if (!backgroundMusic.current || !musicReady || mutedRef.current) return;
    
    try {
      // First, ensure background music is playing
      if (Platform.OS === 'web') {
        if (backgroundMusic.current.paused) {
          backgroundMusic.current.currentTime = 0;
          await backgroundMusic.current.play();
        }
        
        const startVolume = backgroundMusic.current.volume;
        const volumeStep = (targetVolume - startVolume) / (duration / 50);
        
        const fadeInterval = setInterval(() => {
          const currentVolume = backgroundMusic.current.volume;
          const newVolume = currentVolume + volumeStep;
          
          if ((volumeStep > 0 && newVolume >= targetVolume) || 
              (volumeStep < 0 && newVolume <= targetVolume)) {
            backgroundMusic.current.volume = targetVolume;
            clearInterval(fadeInterval);
          } else {
            backgroundMusic.current.volume = newVolume;
          }
        }, 50);
      } else {
        // Native implementation
        try {
          const { Audio } = await import('expo-av');
          
          // Check if music is playing, if not, start it
          const status = await backgroundMusic.current.getStatusAsync();
          if (!status.isPlaying) {
            await backgroundMusic.current.playAsync();
          }
          
          await backgroundMusic.current.setVolumeAsync(targetVolume, { 
            durationMillis: duration 
          });
        } catch (error) {
          console.warn('Error restoring music (native):', error);
        }
      }
      console.log(`🎵 Background music restored to ${targetVolume * 100}%`);
    } catch (error) {
      console.warn('Error restoring background music:', error);
    }
  }, [backgroundMusic, musicReady, mutedRef]);

  const toggleMusic = async () => {
    if (!backgroundMusic.current || !musicReady) return;
    
    try {
      const newMutedState = !isMuted;
      
      if (Platform.OS === 'web') {
        if (isMuted) {
          await backgroundMusic.current.play();
        } else {
          backgroundMusic.current.pause();
        }
      } else {
        // Native
        if (isMuted) {
          await backgroundMusic.current.playAsync();
        } else {
          await backgroundMusic.current.pauseAsync();
        }
      }
      
      setIsMuted(newMutedState);
      console.log(`🔄 Music toggled: ${newMutedState ? 'muted' : 'playing'}`);
    } catch (error) {
      console.warn('Error toggling music:', error);
    }
  };

  const handleStartGame = async () => {
    await playClickSound();
    setCurrentScreen('profileSelection');
  };

  const handleViewLeaderboard = async (settings = null) => {
    await playClickSound();
    setLeaderboardSettings(settings);
    setCurrentScreen('leaderboard');
  };

  const handleProfileSelected = async (profile) => {
    await playClickSound();
    setCurrentProfile(profile);
    setWelcomeVisible(true);
    setCurrentScreen('settings');
  };

  const handleCreateNewProfile = async () => {
    await playClickSound();
    setCurrentScreen('profileCreation');
  };

  const handleProfileCreated = async (profile) => {
    await playClickSound();
    setCurrentProfile(profile);
    setCurrentScreen('settings');
  };

  const handleSettingsComplete = async (settings) => {
    await playClickSound();
    setGameSettings(settings);
    setCurrentScreen('countdown');
  };

  const handleCountdownComplete = () => {
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

  const handlePlayAgain = async () => {
    await playClickSound();
    setCurrentScreen('settings');
  };

  const handleBackToHome = async () => {
    await playClickSound();
    setCurrentScreen('home');
  };

  const handleBackToProfileSelection = async () => {
    await playClickSound();
    setCurrentScreen('profileSelection');
  };

  // Render the current screen content
  const renderCurrentScreen = () => {
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
          playClickSound={playClickSound}
      />
    );
  }

  if (currentScreen === 'profileCreation') {
    return (
      <ProfileCreationScreen 
        onProfileCreated={handleProfileCreated}
        onBack={handleBackToProfileSelection}
        playClickSound={playClickSound}
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
          playClickSound={playClickSound}
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

    if (currentScreen === 'countdown') {
      return (
        <CountdownScreen 
          onCountdownComplete={handleCountdownComplete}
          fadeBackgroundMusic={fadeBackgroundMusic}
          restoreBackgroundMusic={restoreBackgroundMusic}
          playCountdownSound={playCountdownSound}
          playGameStartSound={playGameStartSound}
        />
    );
  }

      if (currentScreen === 'game') {
      return (
        <GameScreen 
          settings={gameSettings}
          currentProfile={currentProfile}
          onGameComplete={handleGameComplete}
          onBack={async () => {
            await playClickSound();
            setCurrentScreen('settings');
          }}
          playClickSound={playClickSound}
          startGameMusic={startGameMusic}
          stopGameMusic={stopGameMusic}
          fadeOutGameMusic={fadeOutGameMusic}
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
          playClickSound={playClickSound}
          playTadaSound={playTadaSound}
          restoreBackgroundMusic={restoreBackgroundMusic}
        />
      );
    }

    if (currentScreen === 'leaderboard') {
      return (
        <LeaderboardScreen 
          onBack={handleBackToHome}
          initialSettings={leaderboardSettings}
          playClickSound={playClickSound}
        />
      );
    }

    // Home screen
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
  };

  // Main app render with persistent music button
  return (
    <View style={styles.appContainer}>
      {/* Persistent Music Toggle Button */}
      {musicReady && (
        <TouchableOpacity 
          style={styles.musicToggleButton} 
          onPress={toggleMusic}
          accessibilityLabel={isMuted ? "Unmute music" : "Mute music"}
        >
          <Image 
            source={isMuted ? require('./assets/silent.png') : require('./assets/volume.png')}
            style={styles.musicToggleIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      
      {/* Current Screen Content */}
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#000', // Fallback color
  },
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
  musicToggleButton: {
    position: 'absolute',
    top: isSmallScreen ? 15 : 20,
    right: isSmallScreen ? 15 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: isSmallScreen ? 45 : 50,
    height: isSmallScreen ? 45 : 50,
    borderRadius: isSmallScreen ? 22.5 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  musicToggleIcon: {
    width: isSmallScreen ? 22 : 25,
    height: isSmallScreen ? 22 : 25,
  },
});