import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const StudentDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState({
    name: 'Alice Johnson',
    class: '10A',
    section: 'A',
    rollNumber: 'STU001',
    attendancePercentage: 92,
    presentDays: 165,
    absentDays: 15,
    totalDays: 180
  });

  const dashboardCards = [
    {
      id: 'my-attendance',
      title: 'My Attendance',
      icon: 'calendar',
      color: '#2196F3',
      onPress: () => navigation.navigate('StudentAttendance')
    },
    {
      id: 'attendance-summary',
      title: 'Attendance Summary',
      icon: 'bar-chart',
      color: '#4CAF50',
      onPress: () => navigation.navigate('AttendanceSummary')
    },
    {
      id: 'alerts',
      title: 'Alerts',
      icon: 'notifications',
      color: '#FF9800',
      count: '3 New',
      onPress: () => navigation.navigate('StudentAlerts')
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person',
      color: '#9C27B0',
      count: 'Settings',
      onPress: () => Alert.alert('Profile', 'Profile settings coming soon!')
    }
  ];

  const attendanceStats = [
    {
      title: 'Overall Attendance',
      percentage: studentData.attendancePercentage,
      color: studentData.attendancePercentage >= 90 ? '#4CAF50' : studentData.attendancePercentage >= 75 ? '#FF9800' : '#F44336',
      status: studentData.attendancePercentage >= 90 ? 'Excellent' : studentData.attendancePercentage >= 75 ? 'Good' : 'Needs Improvement'
    },
    {
      title: 'This Month',
      present: studentData.presentDays,
      absent: studentData.absentDays,
      total: studentData.totalDays
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setStudentData({
        ...studentData,
        attendancePercentage: Math.floor(Math.random() * 20) + 75,
        presentDays: Math.floor(Math.random() * 20) + 150,
        absentDays: Math.floor(Math.random() * 5) + 20
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <LinearGradient
      colors={['#2196F3', '#C2185B']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Student Dashboard</Text>
              <Text style={styles.subtitle}>Welcome back, {studentData.name}</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Student Info Card */}
          <View style={styles.studentInfoCard}>
            <View style={styles.studentInfoHeader}>
              <Ionicons name="person" size={30} color="#2196F3" />
              <View style={styles.studentInfoText}>
                <Text style={styles.studentName}>{studentData.name}</Text>
                <Text style={styles.studentClass}>Class {studentData.class}{studentData.section}</Text>
                <Text style={styles.rollNumber}>Roll No: {studentData.rollNumber}</Text>
              </View>
            </View>
          </View>

          {/* Attendance Stats */}
          <View style={styles.statsContainer}>
            {attendanceStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  {stat.percentage !== undefined && (
                    <View style={[styles.percentageBadge, { backgroundColor: stat.color }]}>
                      <Text style={styles.percentageText}>{stat.percentage}%</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.statContent}>
                  {stat.present !== undefined && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Present:</Text>
                      <Text style={styles.statValue}>{stat.present} days</Text>
                    </View>
                  )}
                  {stat.absent !== undefined && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Absent:</Text>
                      <Text style={styles.statValue}>{stat.absent} days</Text>
                    </View>
                  )}
                  {stat.total !== undefined && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Total:</Text>
                      <Text style={styles.statValue}>{stat.total} days</Text>
                    </View>
                  )}
                  {stat.status !== undefined && (
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Status:</Text>
                      <Text style={[styles.statusValue, { color: stat.color }]}>{stat.status}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Action Cards */}
          <View style={styles.cardContainer}>
            {dashboardCards.map((card, index) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.card, { backgroundColor: card.color }]}
                onPress={card.onPress}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Ionicons name={card.icon} size={30} color="#fff" />
                    {card.count && (
                      <View style={styles.cardCount}>
                        <Text style={styles.countText}>{card.count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    padding: 20,
  },
  studentInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentInfoText: {
    marginLeft: 15,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  studentClass: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  rollNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
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
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statContent: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default StudentDashboardScreen;
