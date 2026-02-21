import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import api from '../config/api';

const TeacherDashboard = ({ navigation }) => {
  const [lowAttendanceAlerts, setLowAttendanceAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowAttendance();
  }, []);

  const fetchLowAttendance = async () => {
    try {
      const response = await api.get('/attendance/shortage', {
        params: { threshold: 80, academicYear: '2024-2025' }
      });
      setLowAttendanceAlerts(response.data.students || []);
    } catch (error) {
      console.error('Error fetching low attendance:', error);
      // Mock data for demonstration
      setLowAttendanceAlerts([
        {
          student: {
            name: 'Sagar Singh',
            class: '10A',
            section: 'A'
          },
          attendance: { percentage: 78 }
        },
        {
          student: {
            name: 'Fatima Ali',
            class: '10A',
            section: 'A'
          },
          attendance: { percentage: 72 }
        },
        {
          student: {
            name: 'Rajesh Kumar',
            class: '10A',
            section: 'A'
          },
          attendance: { percentage: 65 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>XYP Quantum School</Text>
        <Text style={styles.headerSubtitle}>TEACHER DASHBOARD</Text>
      </View>

      {/* Alert Banner */}
      {lowAttendanceAlerts.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>ACTION REQUIRED: Low Attendance Alert</Text>
        </View>
      )}

      {/* Urgent Attendance Card */}
      {lowAttendanceAlerts.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Class {lowAttendanceAlerts[0]?.student.class} - Urgent Attendance
              </Text>
              <Text style={styles.cardTime}>4:30 PM</Text>
            </View>

            <View style={styles.studentList}>
              {lowAttendanceAlerts.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.studentItem}>
                  <Text style={styles.studentName}>
                    {item.student.name}: {item.attendance.percentage}%
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.cardDescription}>
              These students in Class {lowAttendanceAlerts[0]?.student.class} have attendance
              below 80% threshold this semester. Please follow up with the students or view details.
            </Text>

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AttendanceDetails', {
                  students: lowAttendanceAlerts
                })}
                style={styles.button}
              >
                VIEW DETAILS
              </Button>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Contact Parents', 'Would send notification to parents')}
                style={[styles.button, styles.buttonSecondary]}
              >
                CONTACT PARENTS
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {!loading && lowAttendanceAlerts.length === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>No low attendance alerts</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  alertBanner: {
    backgroundColor: '#ef4444',
    padding: 15,
    alignItems: 'center',
  },
  alertText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  cardTime: {
    fontSize: 12,
    color: '#666',
  },
  studentList: {
    marginBottom: 15,
  },
  studentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentName: {
    fontSize: 16,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default TeacherDashboard;

