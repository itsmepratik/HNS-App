import CustomDialog from '@/components/CustomDialog';
import { FadeInView } from '@/components/FadeInView';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  image: string;
}

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1',
    name: 'Tesla Model 3',
    plate: 'HNS-8829',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Ford Mustang',
    plate: 'GT-2024',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=800&auto=format&fit=crop',
  }
];

export default function VehicleManagementScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  const handleAddVehicle = () => {
    if (!newVehicleName || !newVehiclePlate) return;

    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      name: newVehicleName,
      plate: newVehiclePlate,
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800&auto=format&fit=crop', // Default image
    };

    setVehicles([...vehicles, newVehicle]);
    setNewVehicleName('');
    setNewVehiclePlate('');
    setIsAdding(false);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    setVehicleToDelete(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <FadeInView>
            {vehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
                <View style={styles.vehicleInfo}>
                  <View>
                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                    <Text style={styles.vehiclePlate}>{vehicle.plate}</Text>
                  </View>
                  <Pressable 
                    onPress={() => setVehicleToDelete(vehicle.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={20} color={Colors.dark.error} />
                  </Pressable>
                </View>
              </View>
            ))}

            {isAdding ? (
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>Add New Vehicle</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vehicle Name (e.g. Toyota Camry)"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={newVehicleName}
                  onChangeText={setNewVehicleName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="License Plate"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={newVehiclePlate}
                  onChangeText={setNewVehiclePlate}
                />
                <View style={styles.formActions}>
                  <Pressable 
                    style={[styles.formButton, styles.cancelButton]} 
                    onPress={() => setIsAdding(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.formButton, styles.addButton]} 
                    onPress={handleAddVehicle}
                  >
                    <Text style={styles.addButtonText}>Add Vehicle</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.addNewButton} onPress={() => setIsAdding(true)}>
                <Plus size={24} color={Colors.dark.primary} />
                <Text style={styles.addNewText}>Add New Vehicle</Text>
              </Pressable>
            )}
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomDialog
        visible={!!vehicleToDelete}
        title="Remove Vehicle"
        message="Are you sure you want to remove this vehicle from your profile?"
        type="warning"
        actions={[
          {
            text: 'Cancel',
            onPress: () => setVehicleToDelete(null),
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: () => vehicleToDelete && handleDeleteVehicle(vehicleToDelete),
            style: 'destructive',
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.dark.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  vehicleImage: {
    width: '100%',
    height: 140,
  },
  vehicleInfo: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    backgroundColor: Colors.dark.cardHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    borderStyle: 'dashed',
    gap: 8,
  },
  addNewText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  addForm: {
    backgroundColor: Colors.dark.card,
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark.background,
    padding: 16,
    borderRadius: 12,
    color: Colors.dark.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.dark.cardHighlight,
  },
  addButton: {
    backgroundColor: Colors.dark.primary,
  },
  cancelButtonText: {
    color: Colors.dark.text,
    fontWeight: '600',
  },
  addButtonText: {
    color: Colors.dark.primaryForeground,
    fontWeight: '700',
  },
});
