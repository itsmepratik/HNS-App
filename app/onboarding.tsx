import Colors from '@/constants/colors';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Check, Settings, Thermometer, Wind, Zap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    subtitle: 'Stay Updated',
    title: 'Monitor Your Vehicle in Real Time',
    type: 'image',
  },
  {
    id: '2',
    subtitle: 'Detailed Overview',
    title: 'Comprehensive Service Details Provided',
    type: 'list',
  },
  {
    id: '3',
    subtitle: 'Detailed Check',
    title: 'Detailed Inspection and Condition Analysis',
    type: 'stats',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { completeOnboarding } = useOnboardingStatus();

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await completeOnboarding();
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        <View style={styles.contentContainer}>
          {item.type === 'image' && (
            <View style={styles.imageCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=800&auto=format&fit=crop' }} 
                style={styles.mainImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <View style={styles.iconButton}>
                  <Check size={20} color={Colors.dark.text} />
                </View>
                <View style={styles.iconButton}>
                  <Settings size={20} color={Colors.dark.text} />
                </View>
              </View>
            </View>
          )}

          {item.type === 'list' && (
            <View style={styles.listCard}>
               <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop' }} 
                style={styles.carImage}
                resizeMode="contain"
              />
              {/* Floating elements simulation */}
              <View style={[styles.floatItem, { top: 40, left: 20 }]}>
                <View style={styles.calendarIcon}>
                   <Text style={{fontSize: 10, color: '#fff'}}>26</Text>
                </View>
                <View>
                  <Text style={styles.floatLabel}>Service Date</Text>
                  <Text style={styles.floatValue}>Aug 26, 2024</Text>
                </View>
              </View>
            </View>
          )}

          {item.type === 'stats' && (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.checkbox} />
                  <Settings size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>90<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Rear Brakes</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.checkbox} />
                  <Wind size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>75<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Air Filter</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.checkbox} />
                  <Thermometer size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>83<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Cabin Filter</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={styles.checkbox} />
                  <Zap size={20} color={Colors.dark.textSecondary} />
                </View>
                <Text style={styles.statValue}>47<Text style={styles.percent}>%</Text></Text>
                <Text style={styles.statLabel}>Power Steering</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Pressable style={styles.navButton} onPress={() => router.replace('/login')}>
          <ArrowRight size={20} color={Colors.dark.text} style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot, 
                index === currentIndex && styles.paginationDotActive
              ]} 
            />
          ))}
        </View>

        <Pressable style={styles.navButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Pressable 
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.9 }
          ]}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentIndex === SLIDES.length - 1 ? "Let's Get Started" : "Next"}
          </Text>
          {currentIndex === SLIDES.length - 1 && (
            <View style={styles.arrowContainer}>
              <ArrowRight size={20} color="#000" />
            </View>
          )}
        </Pressable>

        <Text style={styles.helpText}>
          Looking for help? Find all the answers you need in our <Text style={styles.helpLink}>Help Center</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.cardHighlight,
  },
  paginationDotActive: {
    backgroundColor: Colors.dark.text,
  },
  slide: {
    width: width,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  subtitle: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: Colors.dark.text,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageCard: {
    width: '100%',
    height: 320,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Colors.dark.card,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomSection: {
    padding: 20,
    paddingBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  primaryButtonText: {
    color: Colors.dark.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  arrowContainer: {
    position: 'absolute',
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  helpLink: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  // Slide 2 styles
  listCard: {
    width: '100%',
    height: 320,
    backgroundColor: Colors.dark.card,
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  carImage: {
    width: '80%',
    height: '100%',
  },
  floatItem: {
    position: 'absolute',
    backgroundColor: Colors.dark.cardHighlight,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  floatLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 10,
  },
  floatValue: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // Slide 3 styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  percent: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.dark.textSecondary,
  },
  statLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
});
