import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, RefreshControl,
  ScrollView, ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getAllSpots } from '../api/spots';
import COLORS from '../constants/colors';

const CATEGORIES = ['All', 'Street Food', 'Tea Stall', 'Cafe', 'Restaurant', 'Bakery', 'Juice Shop', 'Biryani', 'Sweets'];

export default function HomeScreen({ navigation }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      };
      checkAuth();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate(isLoggedIn ? 'Profile' : 'Login')}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>{isLoggedIn ? '👤 Profile' : 'Sign In'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLoggedIn]);

  const fetchSpots = async (filters = {}) => {
    try {
      const data = await getAllSpots(filters);
      setSpots(data.data);
    } catch (err) {
      console.error('Failed to fetch spots', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSpots(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSpots({ search, category }), 400);
    return () => clearTimeout(timer);
  }, [search, category]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSpots({ search, category });
  };

  const renderHeader = () => (
    <View>
      {/* ── Hero Section ── */}
      <View style={styles.hero}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.heroInner}>
          <Text style={styles.heroTag}>✦ COMMUNITY POWERED</Text>
          <Text style={styles.heroTitle}>
            Find Hidden Food{'\n'}
            <Text style={styles.heroAccent}>Gems Near You</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Real spots. Real food. Shared by real travelers.
          </Text>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search spots, cities..."
              placeholderTextColor={COLORS.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ── Filters Card — floats over hero ── */}
      <View style={styles.filtersCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                (cat === 'All' && !category) || category === cat ? styles.pillActive : null
              ]}
              onPress={() => setCategory(cat === 'All' ? '' : cat)}
            >
              <Text style={[
                styles.pillText,
                (cat === 'All' && !category) || category === cat ? styles.pillTextActive : null
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Results Row ── */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {loading ? 'Searching...' : `${spots.length} spot${spots.length !== 1 ? 's' : ''} found`}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate(isLoggedIn ? 'AddSpot' : 'Login')}
        >
          <Text style={styles.addBtnText}>+ Share a Gem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSpotCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
      activeOpacity={0.88}
    >
      {/* Image with overlay */}
      <View style={styles.cardImageWrapper}>
        {item.photos && item.photos.length > 0 ? (
          <Image source={{ uri: item.photos[0].url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.placeholderIcon}>🍽️</Text>
          </View>
        )}
        {/* Gradient overlay */}
        <View style={styles.cardImageOverlay} />
        {/* Category badge on image */}
        <View style={styles.cardCategoryBadge}>
          <Text style={styles.cardCategoryBadgeText}>{item.category}</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ⭐ {item.avgRating > 0 ? item.avgRating.toFixed(1) : 'New'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardCity}>📍 {item.city}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            {item.priceRange === 'cheap' ? '💰 Budget' :
             item.priceRange === 'moderate' ? '💰💰 Moderate' : '💰💰💰 Premium'}
          </Text>
          <Text style={styles.cardAuthor}>by {item.user?.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyTitle}>No spots found</Text>
      <Text style={styles.emptyText}>Try a different search or add the first one!</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate(isLoggedIn ? 'AddSpot' : 'Login')}
      >
        <Text style={styles.emptyBtnText}>+ Add a Spot</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSpotCard}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  loaderContainer: {
    flex: 1,
  },

  // Header button
  headerBtn: {
    marginRight: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  headerBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // Hero
  hero: {
    background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B69 100%)',
    backgroundColor: COLORS.dark,
    paddingTop: 36,
    paddingBottom: 72,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(232,116,26,0.12)',
  },
  circle2: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(232,116,26,0.07)',
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
  },
  heroTag: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 34,
    color: COLORS.white,
    fontWeight: '700',
    lineHeight: 42,
    marginBottom: 10,
  },
  heroAccent: {
    color: COLORS.primary,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { color: COLORS.textLight, fontSize: 13 },

  // Filters card — floats up over hero
  filtersCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -28,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10,
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: COLORS.creamDark,
    backgroundColor: COLORS.cream,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  pillTextActive: {
    color: COLORS.white,
  },

  // Results row
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardImageWrapper: {
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 48 },
  cardImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  cardCategoryBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: { padding: 16 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
    paddingRight: 8,
  },
  ratingBadge: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  cardCity: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.creamDark,
  },
  cardPrice: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  cardAuthor: {
    fontSize: 12,
    color: '#aaa',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 100,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
});