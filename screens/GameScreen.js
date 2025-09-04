import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, TextInput, Alert, KeyboardAvoidingView, Platform, Dimensions, Modal, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function GameScreen({ settings, onGameComplete, onBack, playClickSound, startGameMusic, stopGameMusic, fadeOutGameMusic }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [isGameActive, setIsGameActive] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showTimesUp, setShowTimesUp] = useState(false);
  const intervalRef = useRef(null);
  const textInputRef = useRef(null);
  const timesUpScale = useRef(new Animated.Value(0)).current;
  const timesUpOpacity = useRef(new Animated.Value(0)).current;

  // Generate random math problem based on difficulty
  const generateQuestion = () => {
    let num1, num2, operator, answer;
    
    switch (settings.difficulty) {
      case 'easy': // Ages 4-6: Single digits (0-9), + and -
        num1 = Math.floor(Math.random() * 10);
        num2 = Math.floor(Math.random() * 10);
        operator = Math.random() < 0.5 ? '+' : '-';
        if (operator === '-' && num1 < num2) {
          [num1, num2] = [num2, num1]; // Ensure positive result
        }
        answer = operator === '+' ? num1 + num2 : num1 - num2;
        break;
        
      case 'medium': // Ages 7-9: Up to 99, + - × ÷
        const mediumOperators = ['+', '-', '×', '÷'];
        operator = mediumOperators[Math.floor(Math.random() * mediumOperators.length)];
        
        if (operator === '+' || operator === '-') {
          // Double-digit addition and subtraction
          num1 = Math.floor(Math.random() * 90) + 10; // 10-99
          num2 = Math.floor(Math.random() * 90) + 10; // 10-99
          if (operator === '-' && num1 < num2) {
            [num1, num2] = [num2, num1]; // Ensure positive result
          }
          answer = operator === '+' ? num1 + num2 : num1 - num2;
        } else if (operator === '×') {
          // Easy multiplication (single digit × single digit)
          num1 = Math.floor(Math.random() * 9) + 2; // 2-10
          num2 = Math.floor(Math.random() * 9) + 2; // 2-10
          answer = num1 * num2;
        } else { // ÷
          // Easy division - ensure clean division
          answer = Math.floor(Math.random() * 10) + 2; // 2-11
          num2 = Math.floor(Math.random() * 8) + 2; // 2-9
          num1 = answer * num2;
          answer = num1 / num2;
        }
        break;
        
      case 'hard': // Ages 9-11: Up to 999, triple-digit math
        const hardOperators = ['+', '-', '×', '÷'];
        operator = hardOperators[Math.floor(Math.random() * hardOperators.length)];
        
        if (operator === '+' || operator === '-') {
          // Triple-digit addition and subtraction
          num1 = Math.floor(Math.random() * 900) + 100; // 100-999
          num2 = Math.floor(Math.random() * 900) + 100; // 100-999
          if (operator === '-' && num1 < num2) {
            [num1, num2] = [num2, num1]; // Ensure positive result
          }
          answer = operator === '+' ? num1 + num2 : num1 - num2;
        } else if (operator === '×') {
          // Intermediate multiplication (double digit × single digit)
          num1 = Math.floor(Math.random() * 90) + 10; // 10-99
          num2 = Math.floor(Math.random() * 9) + 2; // 2-10
          answer = num1 * num2;
        } else { // ÷
          // Intermediate division
          answer = Math.floor(Math.random() * 50) + 5; // 5-54
          num2 = Math.floor(Math.random() * 15) + 2; // 2-16
          num1 = answer * num2;
          answer = num1 / num2;
        }
        break;
        
      case 'ultra': // Ages 11+: Up to 9999, complex problems
        const ultraOperators = ['+', '-', '×', '÷'];
        operator = ultraOperators[Math.floor(Math.random() * ultraOperators.length)];
        
        if (operator === '+' || operator === '-') {
          // 4-digit addition and subtraction
          num1 = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
          num2 = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
          if (operator === '-' && num1 < num2) {
            [num1, num2] = [num2, num1]; // Ensure positive result
          }
          answer = operator === '+' ? num1 + num2 : num1 - num2;
        } else if (operator === '×') {
          // Challenging multiplication (double digit × double digit)
          num1 = Math.floor(Math.random() * 90) + 10; // 10-99
          num2 = Math.floor(Math.random() * 90) + 10; // 10-99
          answer = num1 * num2;
        } else { // ÷
          // Challenging division
          answer = Math.floor(Math.random() * 200) + 10; // 10-209
          num2 = Math.floor(Math.random() * 25) + 5; // 5-29
          num1 = answer * num2;
          answer = num1 / num2;
        }
        break;
        
      default: // Fallback to easy
        num1 = Math.floor(Math.random() * 10);
        num2 = Math.floor(Math.random() * 10);
        operator = '+';
        answer = num1 + num2;
        break;
    }
    
    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answer: Math.round(answer)
    };
  };

  // Initialize first question and start game music
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
    
    // Start game music
    if (startGameMusic) {
      startGameMusic();
    }
    
    // Cleanup: stop game music when component unmounts
    return () => {
      if (stopGameMusic) {
        stopGameMusic();
      }
    };
  }, [startGameMusic, stopGameMusic, fadeOutGameMusic]);

  // Timer logic
  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isGameActive, timeLeft]);

  // Ensure TextInput stays focused for better Android experience
  // Enhanced focus management for mobile Safari
  useEffect(() => {
    if (isGameActive && !feedback && textInputRef.current) {
      const focusTimer = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          // Additional mobile Safari focus techniques
          if (Platform.OS === 'web') {
            // Trigger click event to ensure keyboard shows on Safari
            textInputRef.current.click?.();
            // Position cursor at end instead of selecting all text
            const length = userAnswer.length;
            textInputRef.current.setSelectionRange?.(length, length);
          }
        }
      }, 100);
      return () => clearTimeout(focusTimer);
    }
  }, [currentQuestion, feedback, isGameActive]);

  const endGame = () => {
    setIsGameActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start music fade-out and show "Time's up!" animation
    if (fadeOutGameMusic) {
      fadeOutGameMusic(2000); // Fade out over 2 seconds
    }
    
    // Show animated "Time's up!" message
    setShowTimesUp(true);
    
    // Animate the "Time's up!" message
    Animated.parallel([
      Animated.spring(timesUpScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(timesUpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    const results = {
      score,
      questionsAnswered,
      timeLimit: settings.timeLimit,
      difficulty: settings.difficulty,
      accuracy: questionsAnswered > 0 ? (score / questionsAnswered * 100).toFixed(1) : 0,
      streak: bestStreak
    };
    
    // Wait longer for the animation and music fade-out
    setTimeout(() => {
      // Stop game music completely before transitioning
      if (stopGameMusic) {
        stopGameMusic();
      }
      onGameComplete(results);
    }, 2500); // Increased delay for better transition
  };

  const handleNumberInput = (text) => {
    // Only allow numbers (remove any non-numeric characters)
    const numericText = text.replace(/[^0-9]/g, '');
    setUserAnswer(numericText);
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim() || !isGameActive) return;
    
    // Play click sound for submit
    if (playClickSound) {
      await playClickSound();
    }
    
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentQuestion.answer;
    
    setQuestionsAnswered(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        // Update best streak if current streak is now higher
        setBestStreak(current => Math.max(current, newStreak));
        return newStreak;
      });
      setFeedback('🎉 Correct!');
    } else {
      setStreak(0);
      setFeedback(`❌ Wrong! Answer: ${currentQuestion.answer}`);
    }
    
    // Generate new question immediately to maintain flow
    const newQuestion = generateQuestion();
    
    // Show feedback briefly then continue
    setTimeout(() => {
      setFeedback('');
      setCurrentQuestion(newQuestion);
      
      // For mobile Safari - select all text instead of clearing to maintain focus
      if (Platform.OS === 'web') {
        // Clear and immediately refocus for web
        setUserAnswer('');
        // Use requestAnimationFrame for better timing on web
        requestAnimationFrame(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
            // Ensure keyboard stays up on mobile Safari
            textInputRef.current.click?.();
          }
        });
      } else {
        // For native apps, clear and refocus
        setUserAnswer('');
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 50);
      }
    }, 500);
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const handleConfirmQuit = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    setShowQuitModal(false);
    onBack();
  };

  const handleCancelQuit = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    setShowQuitModal(false);
  };

  // Remove the static end game view - we'll use the animated overlay instead

  return (
    <ImageBackground
      source={require('../assets/bg.png')}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        style={styles.safeContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
        {/* Quit Button - positioned to match sound button */}
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>✕</Text>
        </TouchableOpacity>
        
        {/* Timer and Score Cards - centered */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>⏱️ Time</Text>
            <Text style={styles.statValue}>{timeLeft}s</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{score}/{questionsAnswered}</Text>
          </View>
        </View>

        {/* Question Display with Overlay Feedback */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {currentQuestion?.question || 'Loading...'}
          </Text>
          
          {/* Feedback Overlay - Fixed Position */}
          {feedback ? (
            <View style={styles.feedbackOverlay}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}
        </View>

        {/* Answer Input */}
        <View style={styles.answerContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={handleNumberInput}
            keyboardType="numeric"
            inputMode="numeric"
            placeholder="Your answer"
            placeholderTextColor="#999"
            onSubmitEditing={handleAnswerSubmit}
            editable={isGameActive}
            autoFocus={true}
            maxLength={6}
            selectTextOnFocus={false}
            blurOnSubmit={false}
            returnKeyType="done"
            // Additional mobile Safari optimizations
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            // Prevent zoom on focus for mobile Safari
            fontSize={isSmallScreen ? 24 : 28}
            // Additional web-specific props
            {...(Platform.OS === 'web' && {
              // Prevent Safari from dismissing keyboard
              enterKeyHint: 'done',
              // Keep focus during feedback
              onBlur: (e) => {
                if (feedback) {
                  // Prevent blur during feedback period
                  e.preventDefault();
                  setTimeout(() => {
                    textInputRef.current?.focus();
                  }, 100);
                }
              }
            })}
          />
          
          <TouchableOpacity 
            style={[styles.submitButton, (!userAnswer.trim() || !isGameActive || !!feedback) && styles.disabledButton]} 
            onPress={handleAnswerSubmit}
            disabled={!userAnswer.trim() || !isGameActive || !!feedback}
          >
            <Text style={styles.submitButtonText}>Submit ⚡</Text>
          </TouchableOpacity>
        </View>

        {/* Streak indicator */}
        {streak > 2 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 {streak} in a row!</Text>
          </View>
        )}
      </View>
      </KeyboardAvoidingView>

      {/* Quit Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showQuitModal}
        onRequestClose={handleCancelQuit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quit Game?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to quit? Your progress will be lost.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={handleCancelQuit}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleConfirmQuit}
              >
                <Text style={styles.modalConfirmText}>Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Animated "Time's up!" Overlay */}
      {showTimesUp && (
        <View style={styles.timesUpOverlay}>
          <Animated.View 
            style={[
              styles.timesUpContainer,
              {
                transform: [{ scale: timesUpScale }],
                opacity: timesUpOpacity,
              }
            ]}
          >
            <Text style={styles.timesUpText}>Time's Up! ⏰</Text>
            <Text style={styles.timesUpScore}>Final Score: {score}/{questionsAnswered}</Text>
          </Animated.View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 15 : 20,
    paddingTop: isSmallScreen ? 30 : 40,
    paddingBottom: isSmallScreen ? 15 : 20,
    justifyContent: 'flex-start',
  },
  quitButton: {
    position: 'absolute',
    top: isSmallScreen ? 15 : 20,
    left: isSmallScreen ? 15 : 20,
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
  quitButtonText: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isSmallScreen ? 10 : 15,
    marginTop: isSmallScreen ? 70 : 80,
    marginBottom: isSmallScreen ? 15 : 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: isSmallScreen ? 12 : 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: isSmallScreen ? 70 : 80,
  },
  statLabel: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '600',
  },
  statValue: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#333',
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: isSmallScreen ? 20 : 30,
    borderRadius: 25,
    marginTop: isSmallScreen ? 5 : 10,
    marginBottom: isSmallScreen ? 15 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
    position: 'relative',
  },
  questionText: {
    fontSize: isSmallScreen ? 28 : 36,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  feedbackText: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  answerContainer: {
    alignItems: 'center',
    marginTop: isSmallScreen ? 5 : 10,
    marginBottom: isSmallScreen ? 15 : 20,
  },
  answerInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: isSmallScreen ? 25 : 30,
    paddingVertical: isSmallScreen ? 12 : 15,
    borderRadius: 20,
    marginBottom: isSmallScreen ? 15 : 20,
    minWidth: isSmallScreen ? 130 : 150,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  submitButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: isSmallScreen ? 30 : 40,
    paddingVertical: isSmallScreen ? 12 : 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  streakContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: isSmallScreen ? 15 : 20,
    paddingVertical: isSmallScreen ? 8 : 10,
    borderRadius: 20,
  },
  streakText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
  },
  endGameContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endGameTitle: {
    fontSize: isSmallScreen ? 24 : 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 15 : 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  endGameScore: {
    fontSize: isSmallScreen ? 20 : 24,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: isSmallScreen ? 20 : 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: isSmallScreen ? 280 : 320,
  },
  modalTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    marginBottom: isSmallScreen ? 10 : 15,
    color: '#333',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 20 : 25,
    lineHeight: isSmallScreen ? 20 : 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: isSmallScreen ? 12 : 15,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: isSmallScreen ? 20 : 25,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#333',
  },
  modalConfirmButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: isSmallScreen ? 20 : 25,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 10,
  },
  modalConfirmText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: 'white',
  },
  timesUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  timesUpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: isSmallScreen ? 40 : 60,
    paddingVertical: isSmallScreen ? 30 : 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  timesUpText: {
    fontSize: isSmallScreen ? 32 : 42,
    fontWeight: 'bold',
    color: '#FF6B9D',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 15 : 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  timesUpScore: {
    fontSize: isSmallScreen ? 18 : 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
