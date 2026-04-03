import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Image, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { createSpot } from '../api/spots';
import api from '../api/axios';
import COLORS from '../constants/colors';

const CATEGORIES = ['Street Food', 'Tea Stall', 'Cafe', 'Restaurant', 'Bakery', 'Juice Shop', 'Biryani', 'Sweets'];
const PRICE_RANGES = [
  { value: 'cheap', label: '💰 Budget', desc: 'Under ₹100' },
  { value: 'moderate', label: '💰💰 Moderate', desc: '₹100–₹300' },
  { value: 'expensive', label: '💰💰💰 Premium', desc: 'Above ₹300' },
];

export default function AddSpotScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', address: '', city: '',
    latitude: '', longitude: '', priceRange: 'cheap', category: 'Street Food',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Sign In Required', 'Please sign in to add a spot', [
          { text: 'Sign In', onPress: () => navigation.replace('Login') },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]);
      }
    };
    checkAuth();
  }, []);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = geocode[0];
      const city = place?.city || place?.subregion || place?.region || '';
      const address = place?.street || place?.district || '';
      setFormData(prev => ({ ...prev, latitude, longitude, city, address }));
      Alert.alert('✅ Location Set', `${city}${address ? `, ${address}` : ''}`);
    } catch {
      Alert.alert('Error', 'Could not get location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePhotoPress = () => {
    Alert.alert('Add Photo', 'Choose how to add a photo', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handlePickPhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Photo library permission required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera permission required.'); return; }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.city) {
      Alert.alert('Missing Fields', 'Please fill in name, description and city.');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Missing Location', 'Please use GPS or enter coordinates.');
      return;
    }
    setLoading(true);
    try {
      const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
      const spotRes = await createSpot({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      }, user?.id);
      const newSpotId = spotRes.data.id;

      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', { uri: photo.uri, type: 'image/jpeg', name: 'spot_photo.jpg' });
        photoFormData.append('caption', formData.name);
        photoFormData.append('isPrimary', 'true');
        await api.post(`/spots/${newSpotId}/photos`, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      Alert.alert('🎉 Success!', 'Your food gem has been added!', [
        { text: 'View Spot', onPress: () => navigation.replace('SpotDetail', { spotId: newSpotId }) },
        { text: 'Go Home', onPress: () => navigation.replace('Home') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add spot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Photo Zone — full width hero style */}
      <TouchableOpacity style={styles.photoZone} onPress={handlePhotoPress} activeOpacity={0.85}>
        {photo ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photo.uri }} style={styles.photoImage} />
            <View style={styles.photoOverlay}>
              <View style={styles.photoChangeBadge}>
                <Text style={styles.photoChangeText}>📸 Change Photo</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.photoEmpty}>
            <View style={styles.photoIconWrapper}>
              <Text style={styles.photoIcon}>📸</Text>
            </View>
            <Text style={styles.photoText}>Tap to add a photo</Text>
            <Text style={styles.photoHint}>Camera or Gallery · JPG, PNG · Max 5MB</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Tips banner — like web left panel tips */}
      <View style={styles.tipsBanner}>
        <Text style={styles.tipsTitle}>✦ TIPS FOR A GREAT LISTING</Text>
        <Text style={styles.tipsText}>📍 Be specific about location · ✍️ Describe what makes it special · 💰 Set the right price range</Text>
      </View>

      <View style={styles.form}>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>SPOT NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh Dosa Corner"
            placeholderTextColor={COLORS.textLight}
            value={formData.name}
            onChangeText={t => setFormData(f => ({ ...f, name: t }))}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>DESCRIPTION *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="What makes this place special? What should people try?"
            placeholderTextColor={COLORS.textLight}
            value={formData.description}
            onChangeText={t => setFormData(f => ({ ...f, description: t }))}
            multiline numberOfLines={4} textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>CATEGORY *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, formData.category === cat && styles.categoryPillActive]}
                onPress={() => setFormData(f => ({ ...f, category: cat }))}
              >
                <Text style={[styles.categoryPillText, formData.category === cat && styles.categoryPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>LOCATION *</Text>
          {formData.latitude && formData.longitude ? (
            <View style={styles.locationConfirmed}>
              <View>
                <Text style={styles.locationConfirmedText}>✅ Location captured!</Text>
                <Text style={styles.locationCoords}>
                  {typeof formData.latitude === 'number' ? formData.latitude.toFixed(4) : formData.latitude},{' '}
                  {typeof formData.longitude === 'number' ? formData.longitude.toFixed(4) : formData.longitude}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFormData(f => ({ ...f, latitude: '', longitude: '', city: '', address: '' }))}>
                <Text style={styles.locationClearText}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={handleGetLocation}
              disabled={locationLoading}
              activeOpacity={0.85}
            >
              {locationLoading ? (
                <ActivityIndicator color={COLORS.primary} size="small" />
              ) : (
                <>
                  <Text style={styles.locationBtnIcon}>📍</Text>
                  <View>
                    <Text style={styles.locationBtnTitle}>Use My Current Location</Text>
                    <Text style={styles.locationBtnDesc}>Like WhatsApp location sharing</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Manual entry */}
          <View style={styles.manualRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="City"
              placeholderTextColor={COLORS.textLight}
              value={formData.city}
              onChangeText={t => setFormData(f => ({ ...f, city: t }))}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Area / Street"
              placeholderTextColor={COLORS.textLight}
              value={formData.address}
              onChangeText={t => setFormData(f => ({ ...f, address: t }))}
            />
          </View>
          <View style={styles.manualRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Latitude"
              placeholderTextColor={COLORS.textLight}
              value={formData.latitude ? String(formData.latitude) : ''}
              onChangeText={t => setFormData(f => ({ ...f, latitude: t }))}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Longitude"
              placeholderTextColor={COLORS.textLight}
              value={formData.longitude ? String(formData.longitude) : ''}
              onChangeText={t => setFormData(f => ({ ...f, longitude: t }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.field}>
          <Text style={styles.label}>PRICE RANGE *</Text>
          <View style={styles.priceRow}>
            {PRICE_RANGES.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[styles.priceBtn, formData.priceRange === p.value && styles.priceBtnActive]}
                onPress={() => setFormData(f => ({ ...f, priceRange: p.value }))}
              >
                <Text style={[styles.priceBtnLabel, formData.priceRange === p.value && styles.priceBtnLabelActive]}>
                  {p.label}
                </Text>
                <Text style={styles.priceBtnDesc}>{p.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>
              🍽️ {photo ? 'Add Spot & Upload Photo' : 'Add This Gem'}
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },

  // Photo zone
  photoZone: { height: 240, backgroundColor: COLORS.dark },
  photoEmpty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10,
    borderBottomWidth: 3, borderBottomColor: COLORS.primary,
  },
  photoIconWrapper: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(232,116,26,0.15)',
    borderWidth: 2, borderColor: 'rgba(232,116,26,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  photoIcon: { fontSize: 32 },
  photoText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  photoHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', paddingHorizontal: 32 },
  photoPreview: { flex: 1, position: 'relative' },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  photoChangeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 100,
  },
  photoChangeText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },

  // Tips banner
  tipsBanner: {
    backgroundColor: '#2D1500',
    paddingHorizontal: 20, paddingVertical: 14,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 10, fontWeight: '700', color: COLORS.primary,
    letterSpacing: 1, marginBottom: 4,
  },
  tipsText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },

  // Form
  form: { padding: 20, paddingBottom: 48 },
  field: { marginBottom: 24 },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.text,
    marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 2, borderColor: COLORS.creamDark,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.text,
  },
  textarea: { minHeight: 100, paddingTop: 12 },

  // Category
  categoryScroll: { marginLeft: -4 },
  categoryPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 100, borderWidth: 1.5,
    borderColor: COLORS.creamDark, backgroundColor: COLORS.white,
    marginRight: 8,
  },
  categoryPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryPillText: { fontSize: 13, fontWeight: '500', color: COLORS.textLight },
  categoryPillTextActive: { color: COLORS.white },

  // Location
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white,
    borderWidth: 2, borderColor: COLORS.creamDark,
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  locationBtnIcon: { fontSize: 28 },
  locationBtnTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  locationBtnDesc: { fontSize: 12, color: COLORS.textLight },
  locationConfirmed: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f0fff4', borderWidth: 1, borderColor: '#86efac',
    borderRadius: 12, padding: 14, marginBottom: 12,
  },
  locationConfirmedText: { fontSize: 14, color: '#166534', fontWeight: '600', marginBottom: 2 },
  locationCoords: {
    fontSize: 11, color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  locationClearText: { fontSize: 13, color: '#999' },
  manualRow: { flexDirection: 'row', marginTop: 8 },

  // Price
  priceRow: { flexDirection: 'row', gap: 10 },
  priceBtn: {
    flex: 1, borderWidth: 2, borderColor: COLORS.creamDark,
    borderRadius: 12, padding: 12, alignItems: 'center', gap: 4,
    backgroundColor: COLORS.white,
  },
  priceBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(232,116,26,0.06)' },
  priceBtnLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  priceBtnLabelActive: { color: COLORS.primary },
  priceBtnDesc: { fontSize: 10, color: COLORS.textLight },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});