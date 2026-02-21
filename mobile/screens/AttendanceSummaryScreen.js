import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AttendanceSummaryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [attendanceData, setAttendanceData] = useState({
    percentage: 92,
    presentDays: 165,
    absentDays: 15,
    totalDays: 180,
    monthlyData: [
      { month: 'January', present: 22, absent: 0, total: 22, percentage: 100 },
      { month: 'February', present: 20, absent: 2, total: 22, percentage: 91 },
      { month: 'March', present: 21, absent: 1, total: 22, percentage: 95 },
      { month: 'April', present: 18, absent: 2, total: 20, percentage: 90 },
      { month: 'May', present: 22, absent: 0, total: 22, percentage: 100 },
      { month: 'June', present: 20, absent: 2, total: 22, percentage: 91 }
    ]
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2025-2026', '2024-2025', '2023-2024'];

  const getPerformanceColor = (percentage) => {
    if (percentage >= 95) return '#4CAF50';
    if (percentage >= 85) return '#FF9800';
    if (percentage >= 75) return '#FF9800';
    return '#F44336';
  };

  const getPerformanceStatus = (percentage) => {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 85) return 'Very Good';
    if (percentage >= 75) return 'Good';
    return 'Needs Improvement';
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAttendanceData({
        ...attendanceData,
        percentage: Math.floor(Math.random() * 20) + 75,
        presentDays: Math.floor(Math.random() * 20) + 150,
        absentDays: Math.floor(Math.random() * 5) + 20,
        totalDays: attendanceData.totalDays
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#45a049']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Summary</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Month and Year Selection */}
          <View style={styles.selectionContainer}>
            <View style={styles.selectionGroup}>
              <Text style={styles.selectionLabel}>Month:</Text>
              <TouchableOpacity style={styles.pickerButton}>
                <Text style={styles.pickerText}>{months[selectedMonth - 1]}</Text>
                <Ionicons name="chevron-down" size={16} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectionGroup}>
              <Text style={styles.selectionLabel}>Academic Year:</Text>
              <TouchableOpacity style={styles.pickerButton}>
                <Text style={styles.pickerText}>{selectedYear}</Text>
                <Ionicons name="chevron-down" size={16} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Circular Progress */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressCircle, { borderColor: getPerformanceColor(attendanceData.percentage) }]}>
              <Text style={[styles.progressPercentage, { color: getPerformanceColor(attendanceData.percentage) }]}>
                {attendanceData.percentage}%
              </Text>
            </View>
            <Text style={styles.progressLabel}>Overall Attendance</Text>
          </View>

          {/* Performance Status */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusCard, { backgroundColor: getPerformanceColor(attendanceData.percentage) }]}>
              <Ionicons name="trophy" size={30} color="#fff" />
              <Text style={styles.statusText}>{getPerformanceStatus(attendanceData.percentage)}</Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={24} color="#4CAF50" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{attendanceData.totalDays}</Text>
                <Text style={styles.statLabel}>Total Days</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{attendanceData.presentDays}</Text>
                <Text style={styles.statLabel}>Present Days</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="close-circle" size={24} color="#F44336" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{attendanceData.absentDays}</Text>
                <Text style={styles.statLabel}>Absent Days</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${attendanceData.percentage}%`, backgroundColor: getPerformanceColor(attendanceData.percentage) }]} />
              <View style={styles.progressMarker}>
                <Text style={styles.markerText}>75%</Text>
              </View>
            </View>
            <Text style={styles.progressLabelSmall}>Monthly Progress</Text>
          </View>

          {/* Achievement Badges */}
          <View style={styles.achievementContainer}>
            <Text style={styles.achievementTitle}>🏆 Achievements</Text>
            <View style={styles.badgeContainer}>
              {attendanceData.percentage >= 95 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🥇 Perfect Month</Text>
                </View>
              )}
              {attendanceData.percentage >= 90 && attendanceData.percentage < 95 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🥈 Excellent</Text>
                </View>
              )}
              {attendanceData.percentage >= 85 && attendanceData.percentage < 90 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🥉 Good Standing</Text>
                </View>
              )}
              {attendanceData.percentage >= 75 && attendanceData.percentage < 85 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>👍 Keep it Up</Text>
                </View>
              )}
            </View>
          </View>

          {/* Monthly Table */}
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Monthly Breakdown</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Month</Text>
              <Text style={styles.tableHeaderText}>Present</Text>
              <Text style={styles.tableHeaderText}>Absent</Text>
              <Text style={styles.tableHeaderText}>Total</Text>
              <Text style={styles.tableHeaderText}>%</Text>
            </View>
            {attendanceData.monthlyData.map((month, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{month.month}</Text>
                <Text style={styles.tableCell}>{month.present}</Text>
                <Text style={styles.tableCell}>{month.absent}</Text>
                <Text style={styles.tableCell}>{month.total}</Text>
                <Text style={styles.tableCell}>{month.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 20,
  },
  selectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  selectionGroup: {
    flex: 1,
    marginHorizontal: 10,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 10,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressMarker: {
    position: 'absolute',
    left: '75%',
    top: -10,
    backgroundColor: '#FF9800',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLabelSmall: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  achievementContainer: {
    marginBottom: 30,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 5,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
});

export default AttendanceSummaryScreen;
