import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useState } from 'react';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function SettingsScreen({ onSettingsComplete, onBack, currentSettings, playClickSound }) {
  const [timeLimit, setTimeLimit] = useState(currentSettings.timeLimit);
  const [difficulty, setDifficulty] = useState(currentSettings.difficulty);

  const timeLimitOptions = [15, 30, 45, 60];
  const difficultyOptions = [
    { key: 'easy', label: '🟡 Easy (4-6 yrs)', description: 'Single digits (0-9), + and -' },
    { key: 'medium', label: '⚪ Medium (7-9 yrs)', description: 'Up to 99, + - × ÷' },
    { key: 'hard', label: '🔴 Hard (9-11 yrs)', description: 'Up to 999, triple-digit math' },
    { key: 'ultra', label: '🟣 Ultra Hard (11+ yrs)', description: 'Up to 9999, complex problems' }
  ];

  const handleStartGame = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onSettingsComplete({ timeLimit, difficulty });
  };

  const handleTimeLimitChange = async (time) => {
    if (playClickSound) {
      await playClickSound();
    }
    setTimeLimit(time);
  };

  const handleDifficultyChange = async (diffKey) => {
    if (playClickSound) {
      await playClickSound();
    }
    setDifficulty(diffKey);
  };

  const handleBack = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onBack();
  };

  return (
    <View style={styles.safeContainer}>
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Game Settings</Text>
          
          <View style={styles.settingsContent}>
            {/* Time Limit Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time Limit</Text>
              <View style={styles.optionsRow}>
                {timeLimitOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.optionButton,
                      timeLimit === time && styles.selectedOption
                    ]}
                    onPress={() => handleTimeLimitChange(time)}
                  >
                    <Text style={[
                      styles.optionText,
                      timeLimit === time && styles.selectedOptionText
                    ]}>
                      {time}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Difficulty Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty Level</Text>
              <View style={styles.difficultyOptions}>
                {difficultyOptions.map((diff) => (
                  <TouchableOpacity
                    key={diff.key}
                    style={[
                      styles.difficultyButton,
                      difficulty === diff.key && styles.selectedDifficulty
                    ]}
                    onPress={() => handleDifficultyChange(diff.key)}
                  >
                    <Text style={[
                      styles.difficultyLabel,
                      difficulty === diff.key && styles.selectedDifficultyText
                    ]}>
                      {diff.label}
                    </Text>
                    <Text style={[
                      styles.difficultyDescription,
                      difficulty === diff.key && styles.selectedDifficultyText
                    ]}>
                      {diff.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
              <Text style={styles.startButtonText}>Let's Play! ⚡</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 15 : 20,
    paddingTop: isSmallScreen ? 30 : 50,
    paddingBottom: isSmallScreen ? 20 : 30,
    justifyContent: 'space-between',
  },
  settingsContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: isSmallScreen ? 28 : 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 20 : 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    marginBottom: isSmallScreen ? 25 : 40,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isSmallScreen ? 15 : 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: isSmallScreen ? 15 : 20,
    paddingVertical: isSmallScreen ? 12 : 15,
    borderRadius: 25,
    marginHorizontal: isSmallScreen ? 3 : 5,
    marginVertical: isSmallScreen ? 3 : 5,
    minWidth: isSmallScreen ? 60 : 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedOption: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  optionText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#333',
  },
  difficultyOptions: {
    gap: isSmallScreen ? 10 : 15,
  },
  difficultyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: isSmallScreen ? 15 : 20,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedDifficulty: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  difficultyLabel: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  difficultyDescription: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#666',
  },
  selectedDifficultyText: {
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 'auto',
    width: '100%',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '35%',
    marginRight: '5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 10,
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
    width: '60%',
  },
  startButtonText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
});
