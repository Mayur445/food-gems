import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  ScrollView, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { register } from '../api/auth';
import COLORS from '../constants/colors';

const FEATURES = [
  '🗺️ Discover spots on an interactive map',
  '📸 Share photos of amazing food',
  '⭐ Review and rate hidden gems',
  '🌍 Connect with fellow food travelers',
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name, email, password });
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Banner — mirrors web dark green left panel */}
        <View style={styles.banner}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          <View style={styles.bannerInner}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✦ Join the Community</Text>
            </View>
            <Text style={styles.bannerTitle}>Start your food{'\n'}adventure today.</Text>
            <Text style={styles.bannerSubtitle}>
              Create a free account and start sharing hidden food gems with travelers around the world.
            </Text>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <Text style={styles.cardSubtitle}>It's free and takes less than a minute</Text>

          <View style={styles.field}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a strong password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>By registering you agree to our terms of service.</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in here</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  banner: {
    backgroundColor: '#1a2a1a',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(232,116,26,0.08)',
  },
  circle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(232,116,26,0.05)',
  },
  bannerInner: { position: 'relative', zIndex: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232,116,26,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(232,116,26,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    marginBottom: 20,
  },
  badgeText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  bannerTitle: {
    fontSize: 30,
    color: COLORS.white,
    lineHeight: 38,
    marginBottom: 12,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  featureRow: { marginBottom: 10 },
  featureText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 20,
  },

  card: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: { fontSize: 26, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  cardSubtitle: { color: COLORS.textLight, fontSize: 14, marginBottom: 24 },

  field: { marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.cream,
    borderWidth: 2, borderColor: COLORS.creamDark,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12, padding: 15,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  terms: { textAlign: 'center', marginTop: 14, color: '#bbb', fontSize: 12 },

  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 20,
  },
  footerText: { fontSize: 14, color: COLORS.textLight },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});