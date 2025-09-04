import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { ProfileManager, AVATAR_OPTIONS } from '../utils/profileManager';

export default function ProfileCreationScreen({ onProfileCreated, onBack, playClickSound }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [isCreating, setIsCreating] = useState(false);

  const handleNameInput = (text) => {
    // Allow letters, numbers, spaces, and some basic punctuation
    const cleanText = text.replace(/[^a-zA-Z0-9\s\-_]/g, '').slice(0, 20);
    setPlayerName(cleanText);
  };

  const handleAvatarSelect = async (avatarId) => {
    if (playClickSound) {
      await playClickSound();
    }
    setSelectedAvatar(avatarId);
  };

  const handleBack = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onBack();
  };

  const handleCreateProfile = async () => {
    if (!playerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to create a profile!');
      return;
    }

    if (playerName.trim().length < 2) {
      Alert.alert('Name Too Short', 'Your name should be at least 2 characters long!');
      return;
    }

    if (playClickSound) {
      await playClickSound();
    }
    
    setIsCreating(true);
    
    try {
      const newProfile = await ProfileManager.createProfile(playerName.trim(), selectedAvatar);
      if (newProfile) {
        // Set as current profile
        await ProfileManager.setCurrentProfile(newProfile.id);
        onProfileCreated(newProfile);
      } else {
        Alert.alert('Error', 'Could not create profile. Please try again!');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again!');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedAvatarObj = AVATAR_OPTIONS.find(a => a.id === selectedAvatar);

  return (
    <View style={styles.safeContainer}>
      <ImageBackground
        source={require('../assets/bg.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create Your Player! 🎮</Text>
          
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's your name?</Text>
            <TextInput
              style={styles.nameInput}
              value={playerName}
              onChangeText={handleNameInput}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              maxLength={20}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus={true}
            />
            <Text style={styles.nameHint}>Choose a fun name! (2-20 characters)</Text>
          </View>

          {/* Avatar Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pick your avatar!</Text>
            
            {/* Selected Avatar Display */}
            <View style={styles.selectedAvatarContainer}>
              <View style={styles.selectedAvatarCircle}>
                <Text style={styles.selectedAvatarEmoji}>{selectedAvatarObj.emoji}</Text>
              </View>
              <Text style={styles.selectedAvatarName}>{selectedAvatarObj.name}</Text>
            </View>

            {/* Avatar Grid */}
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar.id && styles.selectedAvatarOption
                  ]}
                  onPress={() => handleAvatarSelect(avatar.id)}
                >
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.createButton,
                (!playerName.trim() || isCreating) && styles.disabledButton
              ]} 
              onPress={handleCreateProfile}
              disabled={!playerName.trim() || isCreating}
            >
              <Text style={styles.createButtonText}>
                {isCreating ? 'Creating...' : 'Create Player! 🚀'}
              </Text>
            </TouchableOpacity>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  nameHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedAvatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  selectedAvatarEmoji: {
    fontSize: 45,
  },
  selectedAvatarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedAvatarOption: {
    borderColor: '#FFD700',
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  avatarEmoji: {
    fontSize: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  createButton: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#999',
    shadowOpacity: 0.1,
  },
});
