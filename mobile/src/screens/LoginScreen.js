import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  ScrollView, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api/auth';
import COLORS from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const data = await login({ email, password });
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.data));
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.bannerInner}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🍜 Welcome Back</Text>
            </View>
            <Text style={styles.bannerTitle}>Every city hides{'\n'}a delicious secret.</Text>
            <Text style={styles.bannerSubtitle}>
              Login to discover hidden food gems with travelers worldwide.
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>100+</Text>
                <Text style={styles.statLabel}>HIDDEN SPOTS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>50+</Text>
                <Text style={styles.statLabel}>CITIES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>200+</Text>
                <Text style={styles.statLabel}>TRAVELERS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>Enter your credentials to continue</Text>

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
              placeholder="Your password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create one free</Text>
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
    backgroundColor: COLORS.dark,
    paddingTop: 48, paddingBottom: 48, paddingHorizontal: 28,
    position: 'relative', overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', top: -80, right: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(232,116,26,0.12)',
  },
  circle2: {
    position: 'absolute', bottom: -60, left: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(232,116,26,0.07)',
  },
  bannerInner: { position: 'relative', zIndex: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232,116,26,0.2)',
    borderWidth: 1, borderColor: 'rgba(232,116,26,0.35)',
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 100, marginBottom: 20,
  },
  badgeText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  bannerTitle: {
    fontSize: 30, color: COLORS.white, lineHeight: 38,
    marginBottom: 12, fontWeight: '700',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.6)', fontSize: 14,
    lineHeight: 21, marginBottom: 28,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stat: { alignItems: 'center', gap: 3 },
  statNum: { fontSize: 22, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },
  card: {
    backgroundColor: COLORS.white, margin: 20, borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },
  cardTitle: { fontSize: 26, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  cardSubtitle: { color: COLORS.textLight, fontSize: 14, marginBottom: 24 },
  field: { marginBottom: 18 },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: COLORS.cream, borderWidth: 2, borderColor: COLORS.creamDark,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 15, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  footer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: 20,
  },
  footerText: { fontSize: 14, color: COLORS.textLight },
  footerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});