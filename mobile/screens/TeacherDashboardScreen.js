import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const TeacherDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: 'John Doe',
    classAssigned: '10A',
    totalStudents: 25,
    presentToday: 22,
    absentToday: 3
  });

  const dashboardCards = [
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      icon: 'checkmark-circle',
      color: '#4CAF50',
      count: '22 Present',
      onPress: () => navigation.navigate('MarkAttendance')
    },
    {
      id: 'send-alerts',
      title: 'Send Alerts',
      icon: 'notifications',
      color: '#2196F3',
      count: '5 Active',
      onPress: () => navigation.navigate('TeacherAlerts')
    },
    {
      id: 'admin-alerts',
      title: 'Admin Alerts',
      icon: 'shield',
      color: '#FF9800',
      count: '2 Pending',
      onPress: () => navigation.navigate('TeacherAlerts')
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'bar-chart',
      color: '#FF9800',
      count: 'View All',
      onPress: () => navigation.navigate('Reports')
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

  const statsCards = [
    {
      title: 'Today\'s Attendance',
      present: teacherData.presentToday,
      absent: teacherData.absentToday,
      total: teacherData.presentToday + teacherData.absentToday,
      percentage: Math.round((teacherData.presentToday / (teacherData.presentToday + teacherData.absentToday)) * 100)
    },
    {
      title: 'Class Overview',
      stats: [
        { label: 'Total Students', value: teacherData.totalStudents },
        { label: 'Class', value: `${teacherData.classAssigned}` },
        { label: 'Section', value: 'A' }
      ]
    }
  ];

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setTeacherData({
        ...teacherData,
        presentToday: Math.floor(Math.random() * 25) + 15,
        absentToday: Math.floor(Math.random() * 5) + 2
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
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Teacher Dashboard</Text>
              <Text style={styles.subtitle}>Welcome back, {teacherData.name}</Text>
            </View>
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {statsCards.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statTitle}>{stat.title}</Text>
                {stat.percentage !== undefined ? (
                  <View style={styles.attendanceCircle}>
                    <Text style={styles.attendancePercentage}>{stat.percentage}%</Text>
                  </View>
                ) : (
                  <View style={styles.statList}>
                    {stat.stats.map((item, idx) => (
                      <View key={idx} style={styles.statItem}>
                        <Text style={styles.statLabel}>{item.label}:</Text>
                        <Text style={styles.statValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>
                )}
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
                    <View style={styles.cardCount}>
                      <Text style={styles.countText}>{card.count}</Text>
                    </View>
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
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  attendanceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendancePercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statList: {
    width: '100%',
  },
  statItem: {
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
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#4CAF50',
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

export default TeacherDashboardScreen;
