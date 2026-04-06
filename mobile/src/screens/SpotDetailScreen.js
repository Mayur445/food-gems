import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Alert, Linking, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSpotById } from '../api/spots';
import api from '../api/axios';
import COLORS from '../constants/colors';

const PRICE_LABELS = {
  cheap: '💰 Budget',
  moderate: '💰💰 Moderate',
  expensive: '💰💰💰 Premium',
};

export default function SpotDetailScreen({ route, navigation }) {
  const { spotId } = route.params;
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [review, setReview] = useState({ rating: 5, title: '', body: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
      setIsLoggedIn(!!token);
      setCurrentUserId(user?.id);
      fetchSpot();
    };
    init();
  }, []);

  const fetchSpot = async () => {
    try {
      const data = await getSpotById(spotId);
      setSpot(data.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load spot');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!review.body.trim()) {
      Alert.alert('Missing', 'Please write a review');
      return;
    }
    setReviewLoading(true);
    try {
      await api.post(`/spots/${spotId}/reviews`, {
        rating: parseInt(review.rating),
        title: review.title,
        body: review.body,
      });
      await fetchSpot();
      setReview({ rating: 5, title: '', body: '' });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteSpot = () => {
    Alert.alert(
      'Delete Spot',
      `Are you sure you want to delete "${spot?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await api.delete(`/spots/${spotId}`);
              Alert.alert('Deleted', 'Spot deleted successfully');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete spot');
            } finally {
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleGetDirections = () => {
    const { latitude, longitude, name } = spot;
    const label = encodeURIComponent(name);
    const url = Platform.OS === 'ios'
      ? `maps:?q=${label}&ll=${latitude},${longitude}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
      }
    });
  };

  if (loading) return (
    <View style={styles.center}>
      <Text style={styles.loadingEmoji}>🍜</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 12 }} />
    </View>
  );

  if (!spot) return null;

  const primaryPhoto = spot.photos?.find(p => p.isPrimary) || spot.photos?.[0];
  const isOwner = currentUserId && spot.user?.id === currentUserId;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* Hero */}
      <View style={styles.hero}>
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto.url }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={{ fontSize: 64 }}>🍽️</Text>
          </View>
        )}
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{spot.category}</Text>
          </View>
          <Text style={styles.heroTitle}>{spot.name}</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>
              📍 {spot.address ? `${spot.address}, ` : ''}{spot.city}
            </Text>
            <Text style={styles.heroDot}> · </Text>
            <Text style={styles.heroMetaText}>
              ⭐ {spot.avgRating > 0 ? spot.avgRating.toFixed(1) : 'New'}
            </Text>
            <Text style={styles.heroDot}> · </Text>
            <Text style={styles.heroMetaText}>{PRICE_LABELS[spot.priceRange]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.main}>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this place</Text>
          <Text style={styles.description}>{spot.description}</Text>
          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>📍 {spot.city}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{PRICE_LABELS[spot.priceRange]}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>🏷️ {spot.category}</Text></View>
          </View>
          <Text style={styles.addedBy}>
            ✦ Added by <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{spot.user?.name}</Text>
          </Text>
        </View>

        {/* Location */}
        {spot.latitude && spot.longitude && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPreview}>
              <Image
                source={{ uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${spot.latitude},${spot.longitude}&zoom=15&size=600x200&markers=${spot.latitude},${spot.longitude},red` }}
                style={styles.mapImage}
                resizeMode="cover"
              />
              <View style={styles.mapPinOverlay}>
                <Text style={styles.mapPin}>📍</Text>
              </View>
            </View>
            <View style={styles.locationInfo}>
              <View style={styles.locationInfoLeft}>
                <Text style={styles.locationName}>{spot.name}</Text>
                <Text style={styles.locationAddress}>
                  {spot.address ? `${spot.address}, ` : ''}{spot.city}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={handleGetDirections}
                activeOpacity={0.85}
              >
                <Text style={styles.directionsBtnText}>🗺️ Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('AddSpot', { editMode: true, spot })}
            >
              <Text style={styles.editBtnText}>✏️ Edit Spot</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteSpot}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <ActivityIndicator color="#cc0000" size="small" />
              ) : (
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Photos */}
        {spot.photos && spot.photos.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {spot.photos.map((photo, i) => (
                <View key={i} style={styles.photoThumbWrapper}>
                  <Image source={{ uri: photo.url }} style={styles.photoThumb} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Reviews
              {spot.reviews?.length > 0 && (
                <Text style={styles.reviewCount}> ({spot.reviews.length})</Text>
              )}
            </Text>
            {spot.avgRating > 0 && (
              <View style={styles.avgRatingBox}>
                <Text style={styles.avgRatingNum}>{spot.avgRating.toFixed(1)}</Text>
                <Text style={styles.avgRatingStars}>{'⭐'.repeat(Math.round(spot.avgRating))}</Text>
              </View>
            )}
          </View>

          {spot.reviews?.length > 0 ? (
            spot.reviews.map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{r.user?.name?.[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.user?.name}</Text>
                    <Text style={styles.reviewStars}>{'⭐'.repeat(r.rating)}</Text>
                  </View>
                </View>
                {r.title ? <Text style={styles.reviewTitle}>{r.title}</Text> : null}
                <Text style={styles.reviewBody}>{r.body}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noReviewsBox}>
              <Text style={styles.noReviewsEmoji}>💬</Text>
              <Text style={styles.noReviews}>No reviews yet — be the first!</Text>
            </View>
          )}
        </View>

        {/* Write Review */}
        {isLoggedIn ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Write a Review</Text>

            {reviewSuccess && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ Review submitted successfully!</Text>
              </View>
            )}

            <Text style={styles.label}>RATING</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setReview(r => ({ ...r, rating: n }))}
                  style={[styles.starBtn, n <= review.rating && styles.starBtnActive]}
                >
                  <Text style={styles.starBtnText}>⭐ {n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>TITLE (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief summary"
              placeholderTextColor={COLORS.textLight}
              value={review.title}
              onChangeText={t => setReview(r => ({ ...r, title: t }))}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>YOUR REVIEW *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Tell others what you loved about this place..."
              placeholderTextColor={COLORS.textLight}
              value={review.body}
              onChangeText={t => setReview(r => ({ ...r, body: t }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>✦ Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginPrompt}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginPromptText}>Login to write a review →</Text>
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cream },
  loadingEmoji: { fontSize: 48 },
  hero: { position: 'relative', height: 360 },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: COLORS.dark, alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 28, backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, marginBottom: 10,
  },
  heroBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 10, lineHeight: 34 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroDot: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  main: { padding: 16, paddingBottom: 48 },
  section: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark, marginBottom: 14 },
  reviewCount: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  description: { fontSize: 15, color: COLORS.text, lineHeight: 24, marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  tag: { backgroundColor: COLORS.cream, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  tagText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  addedBy: { fontSize: 13, color: COLORS.textLight },
  ownerActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  editBtn: {
    flex: 1, borderWidth: 2, borderColor: COLORS.primary,
    borderRadius: 12, padding: 13, alignItems: 'center',
    backgroundColor: 'rgba(232,116,26,0.04)',
  },
  editBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  deleteBtn: {
    flex: 1, borderWidth: 2, borderColor: '#cc0000',
    borderRadius: 12, padding: 13, alignItems: 'center',
    backgroundColor: 'rgba(204,0,0,0.04)',
  },
  deleteBtnText: { color: '#cc0000', fontWeight: '600', fontSize: 14 },
  photoThumbWrapper: { marginRight: 10, borderRadius: 10, overflow: 'hidden' },
  photoThumb: { width: 130, height: 100, resizeMode: 'cover' },
  reviewsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  avgRatingBox: { backgroundColor: COLORS.cream, padding: 10, borderRadius: 12, alignItems: 'center' },
  avgRatingNum: { fontSize: 24, fontWeight: '700', color: COLORS.dark },
  avgRatingStars: { fontSize: 12, marginTop: 2 },
  reviewCard: { backgroundColor: COLORS.cream, borderRadius: 14, padding: 14, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  reviewName: { fontWeight: '600', color: COLORS.dark, fontSize: 14, marginBottom: 2 },
  reviewStars: { fontSize: 12 },
  reviewTitle: { fontWeight: '700', color: COLORS.dark, fontSize: 15, marginBottom: 6 },
  reviewBody: { fontSize: 14, color: COLORS.text, lineHeight: 21 },
  noReviewsBox: { alignItems: 'center', paddingVertical: 20 },
  noReviewsEmoji: { fontSize: 36, marginBottom: 8 },
  noReviews: { color: COLORS.textLight, fontSize: 14, fontStyle: 'italic' },
  successBox: {
    backgroundColor: '#f0fff4', borderWidth: 1, borderColor: '#86efac',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  successText: { color: '#166534', fontSize: 14, fontWeight: '500' },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  starBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100,
    borderWidth: 1.5, borderColor: COLORS.creamDark, backgroundColor: COLORS.cream,
  },
  starBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  starBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  input: {
    backgroundColor: COLORS.cream, borderWidth: 2, borderColor: COLORS.creamDark,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 15, alignItems: 'center', marginTop: 16,
  },
  submitBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  loginPrompt: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  loginPromptText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  mapPreview: {
    height: 160, borderRadius: 12, overflow: 'hidden',
    marginBottom: 14, backgroundColor: COLORS.creamDark, position: 'relative',
  },
  mapImage: { width: '100%', height: '100%' },
  mapPinOverlay: {
    position: 'absolute', top: '50%', left: '50%',
    marginTop: -20, marginLeft: -12,
  },
  mapPin: { fontSize: 24 },
  locationInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationInfoLeft: { flex: 1, paddingRight: 12 },
  locationName: { fontSize: 15, fontWeight: '700', color: COLORS.dark, marginBottom: 3 },
  locationAddress: { fontSize: 13, color: COLORS.textLight, lineHeight: 18 },
  directionsBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 100, flexShrink: 0,
  },
  directionsBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
});