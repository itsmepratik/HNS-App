import CustomDialog from '@/components/CustomDialog';
import { FadeInView } from '@/components/FadeInView';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVICE_TYPES = [
  'Oil Change',
  'Brake Inspection',
  'Tire Rotation',
  'General Service',
  'Battery Replacement'
];

export default function BookServiceScreen() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleBook = () => {
    if (!selectedService || !date) {
      setErrorMessage('Please select a service and date.');
      setShowErrorDialog(true);
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessDialog(true);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Book Service</Text>
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
            <Text style={styles.sectionLabel}>Select Service</Text>
            <View style={styles.serviceGrid}>
              {SERVICE_TYPES.map((service) => (
                <Pressable
                  key={service}
                  style={[
                    styles.serviceOption,
                    selectedService === service && styles.serviceOptionSelected
                  ]}
                  onPress={() => setSelectedService(service)}
                >
                  <Text style={[
                    styles.serviceText,
                    selectedService === service && styles.serviceTextSelected
                  ]}>{service}</Text>
                  {selectedService === service && (
                    <View style={styles.checkIcon}>
                      <Check size={14} color={Colors.dark.background} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Preferred Date & Time</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., Tomorrow at 10 AM"
                placeholderTextColor={Colors.dark.textSecondary}
                value={date}
                onChangeText={setDate}
              />
            </View>

            <Text style={styles.sectionLabel}>Additional Notes</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any specific issues or requests..."
                placeholderTextColor={Colors.dark.textSecondary}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </FadeInView>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable 
            style={[styles.bookButton, isSubmitting && styles.bookButtonDisabled]} 
            onPress={handleBook}
            disabled={isSubmitting}
          >
            <Text style={styles.bookButtonText}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <CustomDialog
        visible={showSuccessDialog}
        title="Booking Confirmed"
        message="Your service has been booked successfully!"
        type="success"
        actions={[
          {
            text: 'OK',
            onPress: () => {
              setShowSuccessDialog(false);
              router.back();
            },
            style: 'default',
          },
        ]}
      />

      <CustomDialog
        visible={showErrorDialog}
        title="Missing Information"
        message={errorMessage}
        type="error"
        actions={[
          {
            text: 'OK',
            onPress: () => setShowErrorDialog(false),
            style: 'cancel',
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
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 24,
    marginBottom: 12,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceOptionSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  serviceText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: '500',
  },
  serviceTextSelected: {
    color: Colors.dark.background,
    fontWeight: '700',
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    height: '100%',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    height: '100%',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  bookButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: Colors.dark.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
  },
});
