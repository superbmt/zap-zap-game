import { StyleSheet, Text, View, ImageBackground, Animated, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function CountdownScreen({ 
  onCountdownComplete, 
  fadeBackgroundMusic, 
  restoreBackgroundMusic, 
  playCountdownSound, 
  playGameStartSound 
}) {
  const [currentText, setCurrentText] = useState('Get Ready!');
  const [isComplete, setIsComplete] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const countdownStarted = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    // Only run countdown once
    if (countdownStarted.current) return;
    
    countdownStarted.current = true;
    console.log('🎬 CountdownScreen: Starting countdown (only once)');
    
    // Fade background music when countdown screen loads
    if (fadeBackgroundMusic) {
      fadeBackgroundMusic(0, 1000); // Fade to 0% volume over 1 second
    }
    
    startCountdown();
    
    // Cleanup: restore background music when component unmounts
    return () => {
      console.log('🧹 CountdownScreen: Cleanup');
      isMounted.current = false;
      
      if (restoreBackgroundMusic) {
        restoreBackgroundMusic(0.3, 1000); // Restore to 30% volume over 1 second
      }
    };
  }, []); // Empty dependency array - run only once

  const startCountdown = async () => {
    console.log('⚡ Starting countdown sequence');
    
    // Check if component is still mounted
    if (!isMounted.current) {
      console.log('❌ Component unmounted, aborting countdown');
      return;
    }
    
    // Wait a moment for background music to start fading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Animation sequence with better timing
    const sequence = [
      { text: 'Get Ready!', duration: 1500, hasSound: false },
      { text: '3', duration: 900, hasSound: true },
      { text: '2', duration: 900, hasSound: true },
      { text: '1', duration: 900, hasSound: true },
      { text: 'GO!', duration: 1200, hasSound: true }
    ];

    for (let i = 0; i < sequence.length; i++) {
      // Check if component is still mounted before each step
      if (!isMounted.current) {
        console.log('❌ Component unmounted during countdown, aborting');
        return;
      }
      
      const item = sequence[i];
      
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      
      // Update text
      setCurrentText(item.text);
      console.log(`📢 Countdown: ${item.text} (step ${i + 1}/${sequence.length})`);
      
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
      
      // Wait a moment for animation to start, then play sound
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Check again before playing sound
      if (!isMounted.current) return;
      
      // Play appropriate sound after animation starts (only if item has sound)
      if (item.hasSound && item.text !== 'Get Ready!') {
        if (['3', '2', '1'].includes(item.text) && playCountdownSound) {
          await playCountdownSound();
          // Small delay after countdown sound
          await new Promise(resolve => setTimeout(resolve, 50));
        } else if (item.text === 'GO!' && playGameStartSound) {
          await playGameStartSound();
          // Small delay after game start sound
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Wait for remaining duration
      await new Promise(resolve => setTimeout(resolve, item.duration - 200));
      
      // Check before animating out
      if (!isMounted.current) return;
      
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
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Longer pause between numbers
      }
    }
    
    // Final check before completing
    if (!isMounted.current) {
      console.log('❌ Component unmounted before completion');
      return;
    }
    
    // Complete countdown
    console.log('✅ Countdown sequence completed');
    setIsComplete(true);
    setTimeout(() => {
      if (isMounted.current) {
        onCountdownComplete();
      }
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
