import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = ({ navigation }) => {
  const dashboardCards = [
    {
      id: 'teacher',
      title: 'Teacher Dashboard',
      icon: 'school',
      color: '#4CAF50',
      onPress: () => navigation.navigate('TeacherDashboard')
    },
    {
      id: 'student',
      title: 'Student Dashboard',
      icon: 'person',
      color: '#2196F3',
      onPress: () => navigation.navigate('StudentDashboard')
    },
    {
      id: 'admin',
      title: 'School Admin',
      icon: 'shield',
      color: '#FF9800',
      onPress: () => navigation.navigate('SchoolAdminDashboard')
    }
  ];

  const quickActions = [
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      icon: 'checkmark-circle',
      color: '#4CAF50',
      onPress: () => navigation.navigate('MarkAttendance')
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: 'bar-chart',
      color: '#2196F3',
      onPress: () => navigation.navigate('Reports')
    },
    {
      id: 'alerts',
      title: 'Alerts',
      icon: 'notifications',
      color: '#FF9800',
      onPress: () => navigation.navigate('TeacherAlerts')
    }
  ];

  return (
    <LinearGradient
      colors={['#4CAF50', '#45a049']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>XYP QUANTUM SCHOOL</Text>
          <Text style={styles.subtitle}>Attendance Management System</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Main Dashboard</Text>
          
          <View style={styles.cardContainer}>
            {dashboardCards.map((card, index) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.card, { backgroundColor: card.color }]}
                onPress={card.onPress}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name={card.icon} size={40} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={styles.actionContent}>
                  <Ionicons name={action.icon} size={24} color="#fff" />
                  <Text style={styles.actionTitle}>{action.title}</Text>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    width: '48%',
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '30%',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionContent: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
});

export default DashboardScreen;
