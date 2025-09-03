import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILES_KEY = 'zapzap_profiles';
const CURRENT_PROFILE_KEY = 'zapzap_current_profile';
const SCORES_KEY = 'zapzap_scores';

// Avatar options for kids
export const AVATAR_OPTIONS = [
  { id: 1, emoji: '🦸‍♂️', name: 'Superhero' },
  { id: 2, emoji: '🦸‍♀️', name: 'Superwoman' },
  { id: 3, emoji: '🧙‍♂️', name: 'Wizard' },
  { id: 4, emoji: '🧙‍♀️', name: 'Witch' },
  { id: 5, emoji: '🦄', name: 'Unicorn' },
  { id: 6, emoji: '🐱', name: 'Cat' },
  { id: 7, emoji: '🐶', name: 'Dog' },
  { id: 8, emoji: '🦁', name: 'Lion' },
  { id: 9, emoji: '🐯', name: 'Tiger' },
  { id: 10, emoji: '🐻', name: 'Bear' },
  { id: 11, emoji: '🐸', name: 'Frog' },
  { id: 12, emoji: '🦋', name: 'Butterfly' },
  { id: 13, emoji: '🌟', name: 'Star' },
  { id: 14, emoji: '⚡', name: 'Lightning' },
  { id: 15, emoji: '🎯', name: 'Target' },
  { id: 16, emoji: '🚀', name: 'Rocket' }
];

// Profile management functions
export const ProfileManager = {
  // Get all profiles
  async getProfiles() {
    try {
      const profiles = await AsyncStorage.getItem(PROFILES_KEY);
      return profiles ? JSON.parse(profiles) : [];
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  },

  // Create new profile
  async createProfile(name, avatarId) {
    try {
      const profiles = await this.getProfiles();
      const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId) || AVATAR_OPTIONS[0];
      
      const newProfile = {
        id: Date.now().toString(), // Simple unique ID
        name: name.trim(),
        avatar: avatar,
        createdAt: new Date().toISOString(),
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        bestAccuracy: 0,
        longestStreak: 0
      };

      const updatedProfiles = [...profiles, newProfile];
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  },

  // Get current active profile
  async getCurrentProfile() {
    try {
      const profileId = await AsyncStorage.getItem(CURRENT_PROFILE_KEY);
      if (!profileId) return null;

      const profiles = await this.getProfiles();
      return profiles.find(p => p.id === profileId) || null;
    } catch (error) {
      console.error('Error getting current profile:', error);
      return null;
    }
  },

  // Set current active profile
  async setCurrentProfile(profileId) {
    try {
      await AsyncStorage.setItem(CURRENT_PROFILE_KEY, profileId);
      return true;
    } catch (error) {
      console.error('Error setting current profile:', error);
      return false;
    }
  },

  // Update profile stats after game
  async updateProfileStats(profileId, gameResults) {
    try {
      const profiles = await this.getProfiles();
      const profileIndex = profiles.findIndex(p => p.id === profileId);
      
      if (profileIndex === -1) return false;

      const profile = profiles[profileIndex];
      const accuracy = parseFloat(gameResults.accuracy);
      
      // Update stats
      profile.gamesPlayed += 1;
      profile.totalScore += gameResults.score;
      profile.bestScore = Math.max(profile.bestScore, gameResults.score);
      profile.bestAccuracy = Math.max(profile.bestAccuracy, accuracy);
      profile.longestStreak = Math.max(profile.longestStreak, gameResults.streak);
      profile.lastPlayed = new Date().toISOString();

      profiles[profileIndex] = profile;
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

      // Also save individual game score for leaderboard
      await this.saveGameScore(profileId, gameResults);
      
      return profile;
    } catch (error) {
      console.error('Error updating profile stats:', error);
      return false;
    }
  },

  // Save individual game score
  async saveGameScore(profileId, gameResults) {
    try {
      const scores = await this.getGameScores();
      const newScore = {
        id: Date.now().toString(),
        profileId,
        score: gameResults.score,
        accuracy: parseFloat(gameResults.accuracy),
        difficulty: gameResults.difficulty,
        timeLimit: gameResults.timeLimit,
        questionsAnswered: gameResults.questionsAnswered,
        streak: gameResults.streak,
        playedAt: new Date().toISOString()
      };

      const updatedScores = [newScore, ...scores].slice(0, 100); // Keep top 100 scores
      await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(updatedScores));
      return true;
    } catch (error) {
      console.error('Error saving game score:', error);
      return false;
    }
  },

  // Get all game scores
  async getGameScores() {
    try {
      const scores = await AsyncStorage.getItem(SCORES_KEY);
      return scores ? JSON.parse(scores) : [];
    } catch (error) {
      console.error('Error getting game scores:', error);
      return [];
    }
  },

  // Get nested category-based leaderboard data (difficulty + time limit)
  async getNestedCategoryLeaderboards(limit = 10) {
    try {
      const profiles = await this.getProfiles();
      const scores = await this.getGameScores();

      const difficulties = ['easy', 'medium', 'hard', 'ultra'];
      const timeLimits = [15, 30, 45, 60];
      const leaderboards = {};

      difficulties.forEach(difficulty => {
        leaderboards[difficulty] = {};
        
        timeLimits.forEach(timeLimit => {
          // Filter scores by both difficulty and time limit
          const categoryScores = scores.filter(s => 
            s.difficulty === difficulty && s.timeLimit === timeLimit
          );
          
          // Create leaderboard entries for this specific category
          const categoryLeaderboard = profiles
            .map(profile => {
              const profileScores = categoryScores.filter(s => s.profileId === profile.id);
              
              if (profileScores.length === 0) return null; // Skip if no scores in this category
              
              const topScore = Math.max(...profileScores.map(s => s.score));
              const topAccuracy = Math.max(...profileScores.map(s => s.accuracy));
              const gamesInCategory = profileScores.length;
              
              return {
                ...profile,
                topScore,
                topAccuracy,
                gamesInCategory,
                averageScore: Math.round(profileScores.reduce((sum, s) => sum + s.score, 0) / profileScores.length),
                difficulty,
                timeLimit
              };
            })
            .filter(entry => entry !== null) // Remove profiles with no scores in this category
            .sort((a, b) => {
              // Sort by top score, then by average score
              if (b.topScore !== a.topScore) return b.topScore - a.topScore;
              return b.averageScore - a.averageScore;
            })
            .slice(0, limit);

          leaderboards[difficulty][timeLimit] = categoryLeaderboard;
        });
      });

      return leaderboards;
    } catch (error) {
      console.error('Error getting nested category leaderboards:', error);
      const emptyLeaderboards = {};
      ['easy', 'medium', 'hard', 'ultra'].forEach(difficulty => {
        emptyLeaderboards[difficulty] = {};
        [15, 30, 45, 60].forEach(timeLimit => {
          emptyLeaderboards[difficulty][timeLimit] = [];
        });
      });
      return emptyLeaderboards;
    }
  },

  // Get category-based leaderboard data (backward compatibility)
  async getCategoryLeaderboards(limit = 10) {
    try {
      const profiles = await this.getProfiles();
      const scores = await this.getGameScores();

      const difficulties = ['easy', 'medium', 'hard', 'ultra'];
      const leaderboards = {};

      difficulties.forEach(difficulty => {
        // Filter scores by difficulty only (combining all time limits)
        const difficultyScores = scores.filter(s => s.difficulty === difficulty);
        
        // Create leaderboard entries for this difficulty
        const categoryLeaderboard = profiles
          .map(profile => {
            const profileScores = difficultyScores.filter(s => s.profileId === profile.id);
            
            if (profileScores.length === 0) return null; // Skip if no scores in this category
            
            const topScore = Math.max(...profileScores.map(s => s.score));
            const topAccuracy = Math.max(...profileScores.map(s => s.accuracy));
            const gamesInCategory = profileScores.length;
            
            return {
              ...profile,
              topScore,
              topAccuracy,
              gamesInCategory,
              averageScore: Math.round(profileScores.reduce((sum, s) => sum + s.score, 0) / profileScores.length),
              difficulty
            };
          })
          .filter(entry => entry !== null) // Remove profiles with no scores in this category
          .sort((a, b) => {
            // Sort by top score, then by average score
            if (b.topScore !== a.topScore) return b.topScore - a.topScore;
            return b.averageScore - a.averageScore;
          })
          .slice(0, limit);

        leaderboards[difficulty] = categoryLeaderboard;
      });

      return leaderboards;
    } catch (error) {
      console.error('Error getting category leaderboards:', error);
      return { easy: [], medium: [], hard: [], ultra: [] };
    }
  },

  // Get leaderboard for specific difficulty (backward compatibility)
  async getLeaderboard(difficulty = null, limit = 10) {
    if (!difficulty) {
      // Return combined leaderboard for backward compatibility
      const categoryLeaderboards = await this.getCategoryLeaderboards(limit);
      // Combine all categories, but this shouldn't be used in new UI
      return Object.values(categoryLeaderboards).flat().slice(0, limit);
    }
    
    const categoryLeaderboards = await this.getCategoryLeaderboards(limit);
    return categoryLeaderboards[difficulty] || [];
  },

  // Delete profile (for future use)
  async deleteProfile(profileId) {
    try {
      const profiles = await this.getProfiles();
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles));

      // Also remove associated scores
      const scores = await this.getGameScores();
      const updatedScores = scores.filter(s => s.profileId !== profileId);
      await AsyncStorage.setItem(SCORES_KEY, JSON.stringify(updatedScores));

      // Clear current profile if it was deleted
      const currentProfile = await this.getCurrentProfile();
      if (currentProfile && currentProfile.id === profileId) {
        await AsyncStorage.removeItem(CURRENT_PROFILE_KEY);
      }

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }
};
