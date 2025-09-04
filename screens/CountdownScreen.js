import { StyleSheet, Text, View, ImageBackground, Animated, Dimensions, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function CountdownScreen({ onCountdownComplete }) {
  const [currentText, setCurrentText] = useState('Get Ready!');
  const [isComplete, setIsComplete] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sound = useRef(null);

  useEffect(() => {
    startCountdown();
    return () => {
      // Cleanup sound - only needed for native platforms
      if (sound.current && Platform.OS !== 'web' && typeof window === 'undefined') {
        // For native platforms only
        if (sound.current.unloadAsync) {
          sound.current.unloadAsync();
        }
      }
      sound.current = null;
    };
  }, []);

  const startCountdown = async () => {
    console.log('🚀 NEW CountdownScreen code loaded! Platform:', Platform.OS);
    
    // Load the sound - native only, skip for web to avoid errors
    console.log('🔍 Platform detection:', Platform.OS, 'window:', typeof window !== 'undefined');
    try {
      // Only load audio on native platforms, skip entirely for web
      if (Platform.OS !== 'web' && typeof window === 'undefined') {
        // Native platforms only
        console.log('📱 Loading audio for native platform');
        try {
          const { Audio } = await import('expo-av');
          if (Audio && Audio.loadAsync) {
            const { sound: audioSound } = await Audio.loadAsync(
              require('../assets/game-start.mp3')
            );
            sound.current = audioSound;
            console.log('✅ Native audio loaded successfully');
          } else {
            console.warn('expo-av not available');
          }
        } catch (importError) {
          console.warn('Failed to import expo-av:', importError);
        }
      } else {
        // Web platforms - skip audio entirely
        console.log('🌐 Web platform detected - skipping audio for reliability');
        sound.current = null;
      }
    } catch (error) {
      console.warn('Could not load sound:', error);
    }

    // Animation sequence
    const sequence = [
      { text: 'Get Ready!', duration: 1500 },
      { text: '3', duration: 800 },
      { text: '2', duration: 800 },
      { text: '1', duration: 800 },
      { text: 'GO!', duration: 1000, playSound: true }
    ];

    for (let i = 0; i < sequence.length; i++) {
      const item = sequence[i];
      
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      
      // Update text
      setCurrentText(item.text);
      
      // Play sound on "GO!" - native platforms only
      if (item.playSound) {
        if (sound.current && Platform.OS !== 'web' && typeof window === 'undefined') {
          try {
            console.log('🔊 Playing native audio...');
            // Use expo-av for native platforms
            if (sound.current.replayAsync) {
              await sound.current.replayAsync();
              console.log('✅ Native audio played successfully!');
            }
          } catch (error) {
            console.warn('Could not play sound:', error);
          }
        } else {
          console.log('🔇 No audio available (web platform - visual countdown only)');
        }
      }
      
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Wait for duration
      await new Promise(resolve => setTimeout(resolve, item.duration));
      
      // Animate out (except for last item)
      if (i < sequence.length - 1) {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Complete countdown
    setIsComplete(true);
    setTimeout(() => {
      onCountdownComplete();
    }, 500);
  };

  const getTextStyle = () => {
    const isNumber = ['3', '2', '1'].includes(currentText);
    const isGo = currentText === 'GO!';
    
    return {
      ...styles.countdownText,
      color: isGo ? '#FF6B9D' : isNumber ? '#FFD700' : 'white',
      fontSize: isSmallScreen ? 
        (isNumber || isGo ? 72 : 28) : 
        (isNumber || isGo ? 96 : 36),
    };
  };

  return (
    <View style={styles.safeContainer}>
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.textContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              }
            ]}
          >
            <Text style={getTextStyle()}>
              {currentText}
            </Text>
            
            {currentText === 'GO!' && (
              <Animated.View style={styles.goEffects}>
                <Text style={styles.sparkles}>✨ ⚡ ✨</Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  goEffects: {
    marginTop: isSmallScreen ? 10 : 20,
  },
  sparkles: {
    fontSize: isSmallScreen ? 24 : 32,
    textAlign: 'center',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
