import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { ProfileManager } from '../utils/profileManager';

export default function ProfileSelectionScreen({ onProfileSelected, onCreateNew, onBack }) {
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
    try {
      await ProfileManager.setCurrentProfile(profile.id);
      onProfileSelected(profile);
    } catch (error) {
      console.error('Error selecting profile:', error);
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
          <TouchableOpacity style={styles.createNewButton} onPress={onCreateNew}>
            <Text style={styles.createNewEmoji}>➕</Text>
            <Text style={styles.createNewText}>Create New Player</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            {currentProfile && (
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={() => onProfileSelected(currentProfile)}
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
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
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
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  noProfilesContainer: {
    alignItems: 'center',
    marginVertical: 60,
  },
  noProfilesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noProfilesSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profilesContainer: {
    gap: 15,
    marginBottom: 30,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
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
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarEmoji: {
    fontSize: 50,
    width: 70,
    height: 70,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderRadius: 35,
    lineHeight: 70,
  },
  currentBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 15,
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
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  createNewEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  createNewText: {
    fontSize: 18,
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
  continueButton: {
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
  continueButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
