import Colors from '@/constants/colors';
import { AlertCircle, Calendar, CheckCircle2, Droplet, Gauge, Info } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OilMaintenanceCardProps {
  currentOdo: number;
  lastServiceOdo: number;
  serviceInterval: number;
  lastServiceDate: string;
  oilType: string;
  oilFilterStatus?: string;
}

export function OilMaintenanceCard({
  currentOdo,
  lastServiceOdo,
  serviceInterval,
  lastServiceDate,
  oilType,
  oilFilterStatus = 'Good',
}: OilMaintenanceCardProps) {
  const nextServiceOdo = lastServiceOdo + serviceInterval;
  const distanceDriven = currentOdo - lastServiceOdo;
  const remainingDistance = nextServiceOdo - currentOdo;
  const progress = Math.min(Math.max(distanceDriven / serviceInterval, 0), 1);
  const percentageRemaining = Math.max(0, Math.round((1 - progress) * 100));

  // Determine status color and text
  let statusColor = Colors.dark.success;
  let statusText = 'Good';
  let StatusIcon = CheckCircle2;

  if (percentageRemaining <= 10) {
    statusColor = Colors.dark.error;
    statusText = 'Critical';
    StatusIcon = AlertCircle;
  } else if (percentageRemaining <= 25) {
    statusColor = '#EAB308'; // Warning Yellow
    statusText = 'Due Soon';
    StatusIcon = Info;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Droplet size={20} color={Colors.dark.primary} />
          <Text style={styles.title}>Oil Maintenance</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <StatusIcon size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>{percentageRemaining}% Life Remaining</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.max(5, (1 - progress) * 100)}%`, // Show at least a sliver
                backgroundColor: statusColor 
              }
            ]} 
          />
        </View>
        <View style={styles.odoLabels}>
          <Text style={styles.odoText}>Last: {lastServiceOdo.toLocaleString()} km</Text>
          <Text style={styles.odoText}>Next: {nextServiceOdo.toLocaleString()} km</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Last Service</Text>
          <View style={styles.detailValueContainer}>
            <Calendar size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.detailValue}>{lastServiceDate}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Oil Type</Text>
          <View style={styles.detailValueContainer}>
            <Droplet size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.detailValue}>{oilType}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current Odo</Text>
          <View style={styles.detailValueContainer}>
            <Gauge size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.detailValue}>{currentOdo.toLocaleString()} km</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  odoLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  odoText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    gap: 4,
    minWidth: '30%',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: '500',
  },
});
