import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Alert, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axios';
import { deleteSpot } from '../api/spots';
import COLORS from '../constants/colors';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const loadProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) { navigation.replace('Login'); return; }
    const stored = JSON.parse(await AsyncStorage.getItem('user') || 'null');
    setUser(stored);
    setEditForm({ name: stored?.name || '', bio: stored?.bio || '' });
    fetchMySpots();
  };

  const fetchMySpots = async () => {
    setLoadingSpots(true);
    try {
      const res = await api.get('/users/me/spots');
      setSpots(res.data.data);
    } catch (err) {
      console.error('Failed to load spots');
    } finally {
      setLoadingSpots(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', { name: editForm.name, bio: editForm.bio });
      const updated = res.data.data;
      setUser(updated);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      Alert.alert('✅ Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (spot) => {
    Alert.alert('Delete Spot', `Delete "${spot.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeleteLoading(true);
          try {
            await deleteSpot(spot.id);
            setSpots(prev => prev.filter(s => s.id !== spot.id));
          } catch {
            Alert.alert('Error', 'Failed to delete spot');
          } finally {
            setDeleteLoading(false);
          }
        }
      }
    ]);
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.replace('Home');
        }
      }
    ]);
  };

  if (!user) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Profile Header — dark with decorative circles like web */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <View style={styles.headerInner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {editing ? (
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>NAME</Text>
              <TextInput
                style={styles.editInput}
                value={editForm.name}
                onChangeText={t => setEditForm(f => ({ ...f, name: t }))}
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
              <Text style={[styles.editLabel, { marginTop: 12 }]}>BIO (OPTIONAL)</Text>
              <TextInput
                style={[styles.editInput, styles.editTextarea]}
                value={editForm.bio}
                onChangeText={t => setEditForm(f => ({ ...f, bio: t }))}
                placeholder="Tell the world about your food adventures..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={COLORS.white} size="small" />
                    : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.bio ? <Text style={styles.userBio}>{user.bio}</Text> : null}
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditing(true)}>
                  <Text style={styles.editProfileBtnText}>✏️ Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutBtnText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Stats — like web profile stats */}
      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{spots.length}</Text>
          <Text style={styles.statLabel}>SPOTS SHARED</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {spots.reduce((sum, s) => sum + (s.reviews?.length || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>TOTAL REVIEWS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {spots.length > 0
              ? (spots.reduce((sum, s) => sum + (s.avgRating || 0), 0) / spots.length).toFixed(1)
              : '—'}
          </Text>
          <Text style={styles.statLabel}>AVG RATING</Text>
        </View>
      </View>

      {/* My Spots */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Spots</Text>
          <TouchableOpacity style={styles.addSpotBtn} onPress={() => navigation.navigate('AddSpot')}>
            <Text style={styles.addSpotBtnText}>+ Add Spot</Text>
          </TouchableOpacity>
        </View>

        {loadingSpots ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : spots.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No spots yet</Text>
            <Text style={styles.emptyText}>Share your first hidden gem!</Text>
          </View>
        ) : (
          spots.map(spot => {
            const photo = spot.photos?.find(p => p.isPrimary) || spot.photos?.[0];
            return (
              <View key={spot.id} style={styles.spotCard}>
                {photo ? (
                  <Image source={{ uri: photo.url }} style={styles.spotImage} />
                ) : (
                  <View style={[styles.spotImage, styles.spotImagePlaceholder]}>
                    <Text style={{ fontSize: 28 }}>🍽️</Text>
                  </View>
                )}
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName} numberOfLines={1}>{spot.name}</Text>
                  <Text style={styles.spotCity}>📍 {spot.city}</Text>
                  <View style={styles.spotMeta}>
                    <Text style={styles.spotRating}>
                      ⭐ {spot.avgRating > 0 ? spot.avgRating.toFixed(1) : 'New'}
                    </Text>
                    <View style={styles.spotCategoryBadge}>
                      <Text style={styles.spotCategoryText}>{spot.category}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.spotActions}>
                  <TouchableOpacity
                    style={styles.spotViewBtn}
                    onPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })}
                  >
                    <Text style={styles.spotViewBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.spotDeleteBtn}
                    onPress={() => handleDelete(spot)}
                    disabled={deleteLoading}
                  >
                    <Text style={styles.spotDeleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    backgroundColor: COLORS.dark,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(232,116,26,0.1)',
  },
  headerCircle2: {
    position: 'absolute', bottom: -40, left: -40,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(232,116,26,0.06)',
  },
  headerInner: { position: 'relative', zIndex: 2, alignItems: 'center' },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  avatarText: { color: COLORS.white, fontSize: 30, fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  userBio: {
    fontSize: 14, color: 'rgba(255,255,255,0.7)',
    textAlign: 'center', lineHeight: 20, marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editProfileBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  editProfileBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: 'rgba(232,116,26,0.15)',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 100, borderWidth: 1, borderColor: 'rgba(232,116,26,0.3)',
  },
  logoutBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  // Edit form
  editSection: { width: '100%' },
  editLabel: {
    fontSize: 11, fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  editInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: COLORS.white,
  },
  editTextarea: { minHeight: 80, paddingTop: 12 },
  editActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  saveBtn: {
    flex: 1, backgroundColor: COLORS.primary,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  cancelBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  // Stats card — white card like web
  statsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 22, paddingHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 26, fontWeight: '700', color: COLORS.dark },
  statLabel: {
    fontSize: 9, color: COLORS.textLight,
    letterSpacing: 0.5, textAlign: 'center',
  },
  statDivider: { width: 1, height: 44, backgroundColor: COLORS.creamDark },

  // Section
  section: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark },
  addSpotBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100,
  },
  addSpotBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: COLORS.textLight },

  // Spot cards
  spotCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14, marginBottom: 12,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  spotImage: { width: 90, height: 90, resizeMode: 'cover' },
  spotImagePlaceholder: {
    backgroundColor: COLORS.creamDark,
    alignItems: 'center', justifyContent: 'center',
  },
  spotInfo: { flex: 1, padding: 12 },
  spotName: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 2 },
  spotCity: { fontSize: 12, color: COLORS.textLight, marginBottom: 6 },
  spotMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spotRating: { fontSize: 12, color: COLORS.text },
  spotCategoryBadge: {
    backgroundColor: COLORS.cream, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 100,
  },
  spotCategoryText: { fontSize: 11, color: COLORS.textLight },
  spotActions: {
    justifyContent: 'center', gap: 6,
    paddingRight: 12, paddingVertical: 12,
  },
  spotViewBtn: {
    borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
    alignItems: 'center',
  },
  spotViewBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  spotDeleteBtn: {
    borderWidth: 1.5, borderColor: '#cc0000',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
    alignItems: 'center',
  },
  spotDeleteBtnText: { color: '#cc0000', fontSize: 12, fontWeight: '600' },
});