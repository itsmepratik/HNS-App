import { FadeInView } from '@/components/FadeInView';
import Colors from '@/constants/colors';
import { DrawerToggleButton } from '@react-navigation/drawer';
import {
    Check,
    Filter,
    List,
    Map as MapIcon,
    MapPin,
    Navigation,
    Phone,
    Search,
    X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = 370;
const SPACING = 12;

// Filter Options
const AVAILABLE_SERVICES = [
  'Oil Change',
  'Battery Replacement',
  'Tire Services',
  'Brake Services',
  'Engine Repair',
  'Car Wash'
];

// Mock Data for Service Centers
const SERVICE_CENTERS = [
  {
    id: '1',
    name: 'HNS Main Service Center',
    address: '123 Auto Park Blvd, Downtown',
    distance: '2.4 km',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=800&auto=format&fit=crop',
    status: 'Open',
    phone: '+1234567890',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    services: ['Oil Change', 'Details', 'Engine Repair', 'Tire Services', 'Brake Services']
  },
  {
    id: '2',
    name: 'HNS Express Lube',
    address: '45 Westside Highway, West End',
    distance: '5.1 km',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=800&auto=format&fit=crop',
    status: 'Open',
    phone: '+1987654321',
    coordinates: { latitude: 37.7849, longitude: -122.4294 },
    services: ['Oil Change', 'Car Wash']
  },
  {
    id: '3',
    name: 'HNS Heavy Repairs',
    address: '88 Industrial Way, North Zone',
    distance: '8.3 km',
    image: 'https://images.unsplash.com/photo-1599256821937-2804d9d83fb5?q=80&w=800&auto=format&fit=crop',
    status: 'Closed',
    phone: '+1122334455',
    coordinates: { latitude: 37.7949, longitude: -122.4394 },
    services: ['Engine Repair', 'Brake Services', 'Oil Change']
  },
  {
    id: '4',
    name: 'HNS Tire Center',
    address: '22 Rubber Road, Southside',
    distance: '12.0 km',
    image: 'https://images.unsplash.com/photo-1530263503756-b3848b7b250c?q=80&w=800&auto=format&fit=crop',
    status: 'Open',
    phone: '+1555666777',
    coordinates: { latitude: 37.8049, longitude: -122.4094 },
    services: ['Tire Services', 'Battery Replacement']
  }
];

export default function StationFinderScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredStations = SERVICE_CENTERS.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter Logic: Show station if it has ALL selected services.
    // Use .some() instead of .every() if you want "Show stations with ANY of selected"
    const matchesFilters = selectedServices.length === 0 || 
      selectedServices.every(service => station.services.includes(service));

    return matchesSearch && matchesFilters;
  });

  // Reset carousel and selection when data changes (search or filter)
  useEffect(() => {
    if (filteredStations.length > 0) {
        // Scroll to beginning
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        
        // Select first item to sync map
        setSelectedStationId(filteredStations[0].id);
        
        // Optional: Animate map to first item?
        // Maybe we just let the user tap, or we can auto-focus. 
        // For now, let's just select it so pin turns green.
    }
  }, [filteredStations.length, searchQuery, selectedServices]); // Dependency on length/inputs ensures it triggers on change

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleNavigate = (lat: number, lng: number, label: string) => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}?q=${label}&ll=${lat},${lng}`,
      android: `${scheme}0,0?q=${lat},${lng}(${label})`
    });
    if (url) {
        Linking.openURL(url);
    }
  };

  const toggleServiceFilter = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const onMarkerPress = (station: typeof SERVICE_CENTERS[0]) => {
    setSelectedStationId(station.id);
    const index = filteredStations.findIndex(s => s.id === station.id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + SPACING));
    if (filteredStations[index]) {
      const station = filteredStations[index];
      setSelectedStationId(station.id);
      
      // Clear any pending zoom animation
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }

      // Step 1: Start "Fly over" (Zoom out + Pan)
      // We aim for a higher point (0.06) with a long duration (1500ms)
      // This initiates the "Zoom out slowly kicks in" feel.
      mapRef.current?.animateToRegion({
        latitude: station.coordinates.latitude,
        longitude: station.coordinates.longitude,
        latitudeDelta: 0.06, 
        longitudeDelta: 0.06,
      }, 1500);

      // Step 2: "Connected" Landing
      // We interrupt the first animation midway (at 700ms) to start zooming in.
      // This overlaps the movements, removing the "stop" between animations.
      // The map continues panning to the same target, but Zoom seamlessly reverses.
      zoomTimeoutRef.current = setTimeout(() => {
        mapRef.current?.animateToRegion({
            latitude: station.coordinates.latitude,
            longitude: station.coordinates.longitude,
            latitudeDelta: 0.01, // Target street-level zoom
            longitudeDelta: 0.01,
          }, 1500); // Slow easing for "zoom in kicks in slowly"
      }, 700);
    }
  };

  // Switch between List and Map view
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  };

  const renderStationCard = ({ item }: { item: typeof SERVICE_CENTERS[0] }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.statusBadge}>
            <View style={[
                styles.statusDot, 
                { backgroundColor: item.status === 'Open' ? Colors.dark.success : Colors.dark.error }
            ]} />
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <LinearGradientOverlay />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                  <Text style={styles.stationName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.stationAddress} numberOfLines={1}>{item.address}</Text>
              </View>
              <View style={styles.distanceBadge}>
                  <Navigation size={12} color={Colors.dark.primary} />
                  <Text style={styles.distanceText}>{item.distance}</Text>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
                {item.services.map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                        <Text style={styles.serviceTagText}>{service}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>

        <View style={styles.actionRow}>
            <Pressable 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => handleCall(item.phone)}
            >
                <Phone size={18} color={Colors.dark.text} />
                <Text style={styles.secondaryButtonText}>Call</Text>
            </Pressable>
            
            <Pressable 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => handleNavigate(item.coordinates.latitude, item.coordinates.longitude, item.name)}
            >
                <MapPin size={18} color={Colors.dark.primaryForeground} />
                <Text style={styles.primaryButtonText}>Directions</Text>
            </Pressable>
        </View>
      </View>
    </View>
  );

  const LinearGradientOverlay = () => (
    <View style={styles.gradientOverlay} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView style={{ flex: 1 }}>
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <DrawerToggleButton tintColor={Colors.dark.text} />
                <Text style={styles.headerTitle}>Station Finder</Text>
                
                <Pressable onPress={toggleViewMode} style={styles.toggleButton}>
                   {viewMode === 'list' ? (
                     <MapIcon size={20} color={Colors.dark.primary} />
                   ) : (
                     <List size={20} color={Colors.dark.primary} />
                   )}
                   <Text style={styles.toggleText}>{viewMode === 'list' ? 'Map' : 'List'}</Text>
                </Pressable>
            </View>
            
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search size={20} color={Colors.dark.textSecondary} />
                    <TextInput 
                        placeholder="Search stations..." 
                        placeholderTextColor={Colors.dark.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <Pressable 
                  style={[styles.filterButton, selectedServices.length > 0 && styles.filterButtonActive]} 
                  onPress={() => setShowFilterModal(true)}
                >
                    <Filter size={20} color={selectedServices.length > 0 ? Colors.dark.primaryForeground : Colors.dark.text} />
                    {selectedServices.length > 0 && (
                        <View style={styles.filterBadge} />
                    )}
                </Pressable>
            </View>
        </View>

        {viewMode === 'list' ? (
            <FlatList
                data={filteredStations}
                renderItem={renderStationCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No service centers found matching your filters.</Text>
                    </View>
                }
            />
        ) : (
            <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: 37.7849,
              longitude: -122.4294,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            mapPadding={{ top: 0, right: 0, bottom: CARD_HEIGHT + 20, left: 0 }}
          >
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                coordinate={station.coordinates}
                onPress={() => onMarkerPress(station)}
              >
                <View style={[
                  styles.customMarker,
                  selectedStationId === station.id && styles.selectedMarker
                ]}>
                  <MapPin 
                    size={20} 
                    color={selectedStationId === station.id ? Colors.dark.primaryForeground : Colors.dark.text} 
                  />
                </View>
              </Marker>
            ))}
          </MapView>
                
                <View style={styles.carouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={filteredStations}
                        renderItem={({ item }) => (
                            <View style={{ width: CARD_WIDTH + SPACING, paddingRight: SPACING }}>
                                {renderStationCard({ item })}
                            </View>
                        )}
                        keyExtractor={item => item.id}
                        horizontal
                        pagingEnabled={false}
                        snapToInterval={CARD_WIDTH + SPACING}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContent}
                        onMomentumScrollEnd={onMomentumScrollEnd}
                    />
                </View>
            </View>
        )}

        {/* Filter Modal */}
        <Modal
            visible={showFilterModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter by Service</Text>
                        <Pressable onPress={() => setShowFilterModal(false)}>
                            <X size={24} color={Colors.dark.text} />
                        </Pressable>
                    </View>
                    
                    <Text style={styles.modalSubtitle}>Select services you are looking for</Text>
                    
                    <View style={styles.chipsContainer}>
                        {AVAILABLE_SERVICES.map((service) => {
                            const isSelected = selectedServices.includes(service);
                            return (
                                <Pressable
                                    key={service}
                                    style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                                    onPress={() => toggleServiceFilter(service)}
                                >
                                    {isSelected && <Check size={16} color={Colors.dark.primaryForeground} />}
                                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                                        {service}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    
                    <View style={styles.modalFooter}>
                        <Pressable 
                            style={styles.modalResetButton}
                            onPress={() => setSelectedServices([])}
                        >
                            <Text style={styles.modalResetText}>Reset</Text>
                        </Pressable>
                        <Pressable 
                            style={styles.modalApplyButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.modalApplyText}>Show {filteredStations.length} Stations</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>

      </FadeInView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.dark.background,
    gap: 16,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(223, 255, 0, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
  },
  toggleText: {
      color: Colors.dark.primary,
      fontWeight: '600',
      fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: { // Add this
    backgroundColor: Colors.dark.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.primary,
    borderWidth: 1.5,
    borderColor: Colors.dark.card,
  },
  listContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  // Map Styles
  mapContainer: {
      flex: 1,
      position: 'relative',
  },
  map: {
      ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
      backgroundColor: Colors.dark.card,
      padding: 8,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: Colors.dark.border,
      alignItems: 'center',
      justifyContent: 'center',
  },
  selectedMarker: {
      backgroundColor: Colors.dark.primary,
      borderColor: Colors.dark.primary,
      transform: [{ scale: 1.2 }],
  },
  carouselContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
  },
  carouselContent: {
      paddingHorizontal: (width - CARD_WIDTH) / 2 - SPACING / 2,
  },
  
  // Shared Card Styles
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    width: '100%', 
    height: CARD_HEIGHT, // Increased height to fit services
  },
  imageContainer: {
    height: 160,
    position: 'relative',
    backgroundColor: Colors.dark.cardHighlight,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)', 
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    gap: 16,
  },
  cardHeader: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start'
  },
  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  stationAddress: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    maxWidth: '100%',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  servicesScroll: {
    maxHeight: 30, // Limit height
    flexGrow: 0,
  },
  serviceTag: {
    backgroundColor: Colors.dark.cardHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  serviceTagText: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.dark.cardHighlight,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  primaryButtonText: {
    color: Colors.dark.primaryForeground,
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChipSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  filterChipText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: Colors.dark.primaryForeground,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalResetButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.dark.cardHighlight,
  },
  modalResetText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  modalApplyButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
  },
  modalApplyText: {
    color: Colors.dark.primaryForeground,
    fontWeight: '600',
  }
});
