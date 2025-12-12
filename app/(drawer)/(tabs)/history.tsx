import { FadeInView } from '@/components/FadeInView';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import Colors from '@/constants/colors';
import { CheckCircle2, Wrench } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HISTORY_DATA = [
  {
    id: '1',
    service: 'Full Synthetic Oil Change',
    date: 'Aug 26, 2024',
    mechanic: 'John Doe',
    price: '$89.99',
    status: 'Completed',
  },
  {
    id: '2',
    service: 'Air Filter Replacement',
    date: 'Jun 15, 2024',
    mechanic: 'Mike Smith',
    price: '$24.99',
    status: 'Completed',
  },
  {
    id: '3',
    service: 'Brake Inspection',
    date: 'Jan 10, 2024',
    mechanic: 'Sarah Connor',
    price: '$0.00',
    status: 'Completed',
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FadeInView style={{ flex: 1 }}>
        <View style={styles.header}>
          <HamburgerMenu />
          <Text style={styles.headerTitle}>Service History</Text>
        </View>

        <FlatList
          data={HISTORY_DATA}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Wrench size={20} color={Colors.dark.primary} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.serviceName}>{item.service}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <CheckCircle2 size={12} color={Colors.dark.background} />
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Text style={styles.footerLabel}>Mechanic</Text>
                  <Text style={styles.footerValue}>{item.mechanic}</Text>
                </View>
                <View style={styles.footerItemRight}>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            </View>
          )}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.background,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    gap: 2,
  },
  footerItemRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  footerValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
});
