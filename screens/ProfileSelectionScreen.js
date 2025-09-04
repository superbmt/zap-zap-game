import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { ProfileManager } from '../utils/profileManager';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700; // iPhone SE and similar small devices

export default function ProfileSelectionScreen({ onProfileSelected, onCreateNew, onBack, playClickSound }) {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const allProfiles = await ProfileManager.getProfiles();
      const current = await ProfileManager.getCurrentProfile();
      setProfiles(allProfiles);
      setCurrentProfile(current);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = async (profile) => {
    if (playClickSound) {
      await playClickSound();
    }
    try {
      await ProfileManager.setCurrentProfile(profile.id);
      onProfileSelected(profile);
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const handleCreateNew = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onCreateNew();
  };

  const handleBack = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onBack();
  };

  const handleContinue = async () => {
    if (playClickSound) {
      await playClickSound();
    }
    onProfileSelected(currentProfile);
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
            <Text style={styles.loadingText}>Loading profiles... ⚡</Text>
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
          <Text style={styles.title}>Who's Playing? 🎮</Text>
          
          {profiles.length === 0 ? (
            <View style={styles.noProfilesContainer}>
              <Text style={styles.noProfilesText}>No players yet!</Text>
              <Text style={styles.noProfilesSubtext}>Create your first player to get started</Text>
            </View>
          ) : (
            <View style={styles.profilesContainer}>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={[
                    styles.profileCard,
                    currentProfile?.id === profile.id && styles.currentProfileCard
                  ]}
                  onPress={() => handleProfileSelect(profile)}
                >
                  <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarEmoji}>{profile.avatar.emoji}</Text>
                      {currentProfile?.id === profile.id && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileSubtitle}>{profile.avatar.name}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.profileStats}>
                    <View style={styles.statItem}>
                      <Text style={[
                        styles.statValue,
                        currentProfile?.id === profile.id && styles.selectedStatValue
                      ]}>
                        {profile.gamesPlayed}
                      </Text>
                      <Text style={[
                        styles.statLabel,
                        currentProfile?.id === profile.id && styles.selectedStatLabel
                      ]}>
                        Games
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[
                        styles.statValue,
                        currentProfile?.id === profile.id && styles.selectedStatValue
                      ]}>
                        {profile.bestScore}
                      </Text>
                      <Text style={[
                        styles.statLabel,
                        currentProfile?.id === profile.id && styles.selectedStatLabel
                      ]}>
                        Best Score
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[
                        styles.statValue,
                        currentProfile?.id === profile.id && styles.selectedStatValue
                      ]}>
                        {profile.longestStreak}
                      </Text>
                      <Text style={[
                        styles.statLabel,
                        currentProfile?.id === profile.id && styles.selectedStatLabel
                      ]}>
                        Best Streak
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Create New Profile Button */}
          <TouchableOpacity style={styles.createNewButton} onPress={handleCreateNew}>
            <Text style={styles.createNewEmoji}>➕</Text>
            <Text style={styles.createNewText}>Create New Player</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            {currentProfile && (
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>
                  Continue ⚡
                </Text>
              </TouchableOpacity>
            )}
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
    padding: isSmallScreen ? 15 : 20,
    paddingTop: isSmallScreen ? 30 : 50,
    paddingBottom: isSmallScreen ? 30 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: isSmallScreen ? 24 : 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 25 : 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  noProfilesContainer: {
    alignItems: 'center',
    marginVertical: isSmallScreen ? 40 : 60,
  },
  noProfilesText: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noProfilesSubtext: {
    fontSize: isSmallScreen ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profilesContainer: {
    gap: isSmallScreen ? 12 : 15,
    marginBottom: isSmallScreen ? 20 : 30,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: isSmallScreen ? 15 : 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentProfileCard: {
    borderColor: '#FFD700',
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // More opaque background for better readability
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 12 : 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isSmallScreen ? 12 : 15,
  },
  avatarEmoji: {
    fontSize: isSmallScreen ? 40 : 50,
    width: isSmallScreen ? 60 : 70,
    height: isSmallScreen ? 60 : 70,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderRadius: isSmallScreen ? 30 : 35,
    lineHeight: isSmallScreen ? 60 : 70,
  },
  currentBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: isSmallScreen ? 20 : 24,
    height: isSmallScreen ? 20 : 24,
    borderRadius: isSmallScreen ? 10 : 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  currentBadgeText: {
    color: 'white',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#666',
    fontStyle: 'italic',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: isSmallScreen ? 12 : 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  selectedStatValue: {
    color: '#B8860B', // Dark golden color for better contrast
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectedStatLabel: {
    color: '#333', // Dark color for better contrast
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  createNewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: isSmallScreen ? 15 : 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: isSmallScreen ? 20 : 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  createNewEmoji: {
    fontSize: isSmallScreen ? 32 : 40,
    marginBottom: isSmallScreen ? 8 : 10,
  },
  createNewText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 5,
    paddingVertical: isSmallScreen ? 12 : 15,
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
  continueButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 10,
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
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
