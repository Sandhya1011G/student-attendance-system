import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import api from '../config/api';

const AdminDashboard = ({ navigation }) => {
  const [lowAttendanceData, setLowAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowAttendance();
  }, []);

  const fetchLowAttendance = async () => {
    try {
      const response = await api.get('/attendance/shortage', {
        params: { threshold: 80, academicYear: '2024-2025' }
      });
      setLowAttendanceData(response.data.students || []);
    } catch (error) {
      console.error('Error fetching low attendance:', error);
      // Mock data
      setLowAttendanceData([
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

  // Group by class
  const groupedByClass = lowAttendanceData.reduce((acc, item) => {
    const key = `${item.student.class}${item.student.section}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const classAverages = Object.entries(groupedByClass).map(([className, students]) => {
    const avg = students.reduce((sum, s) => sum + s.attendance.percentage, 0) / students.length;
    return { className, average: avg, students };
  }).sort((a, b) => a.average - b.average);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>XYP Quantum School</Text>
        <Text style={styles.headerSubtitle}>PRINCIPAL/ADMIN DASHBOARD</Text>
      </View>

      {/* Alert Banner */}
      {lowAttendanceData.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>URGENT: School-Wide Low Attendance Alerts</Text>
        </View>
      )}

      {/* Lowest Class Attendance Summary */}
      {classAverages.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>
              {classAverages[0].className} - Lowest Class Attendance
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                {classAverages[0].className} - {classAverages[0].average.toFixed(1)}% Average
              </Text>
            </View>
            {classAverages[1] && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>
                  {classAverages[1].className} - {classAverages[1].average.toFixed(1)}% Average
                </Text>
              </View>
            )}
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AttendanceDetails', {
                students: classAverages[0].students
              })}
              style={styles.button}
            >
              VIEW DETAILS
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Detailed Class Attendance */}
      {classAverages.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>
              {classAverages[0].className} - Lowest Class Attendance
            </Text>
            <View style={styles.studentList}>
              {classAverages[0].students.map((item, index) => (
                <View key={index} style={styles.studentItem}>
                  <Text style={styles.studentName}>
                    {item.student.name} {item.attendance.percentage}%
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.systemMessage}>
              System detected {classAverages[0].students.length} students below 80% threshold.
            </Text>
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => {}}
                style={[styles.button, styles.buttonSecondary]}
              >
                NOTIFY TEACHER
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AttendanceDetails', {
                  students: classAverages[0].students
                })}
                style={styles.button}
              >
                VIEW CLASS REPORT
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Empty State */}
      {!loading && lowAttendanceData.length === 0 && (
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
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
  systemMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
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

export default AdminDashboard;

