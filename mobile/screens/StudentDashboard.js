import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import api from '../config/api';

const StudentDashboard = ({ navigation }) => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock student ID - in real app, get from auth context
    const studentId = '507f1f77bcf86cd799439011'; // Replace with actual student ID
    fetchStudentAttendance(studentId);
  }, []);

  const fetchStudentAttendance = async (studentId) => {
    try {
      const currentDate = new Date();
      const semesterStart = new Date(currentDate.getFullYear(), 6, 1); // July 1
      const semesterEnd = new Date(currentDate.getFullYear(), 11, 31); // December 31

      if (currentDate.getMonth() < 6) {
        semesterStart.setFullYear(semesterStart.getFullYear() - 1);
        semesterEnd.setFullYear(semesterEnd.getFullYear() - 1);
      }

      const response = await api.get(`/attendance/student/${studentId}/semester`, {
        params: {
          startDate: semesterStart.toISOString().split('T')[0],
          endDate: semesterEnd.toISOString().split('T')[0],
          academicYear: '2024-2025'
        }
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      // Mock data
      setAttendanceData({
        student: {
          name: 'Sagar Singh',
          class: '10A',
          section: 'A'
        },
        attendance: {
          percentage: 86.4,
          totalDays: 125,
          presentDays: 108,
          absentDays: 17
        },
        isBelowThreshold: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>XYP Quantum School</Text>
        <Text style={styles.headerSubtitle}>STUDENT DASHBOARD</Text>
      </View>

      {attendanceData && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>
              MY SEMESTER ATTENDANCE - {attendanceData.student.name.toUpperCase()} - SEMESTER 1
            </Text>
            <Text style={styles.classText}>CLASS: {attendanceData.student.class}{attendanceData.student.section}</Text>

            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>
                SEMESTER ATTENDANCE PERCENTAGE: {attendanceData.attendance.percentage}%
              </Text>
              {attendanceData.isBelowThreshold && (
                <Text style={styles.warningText}>
                  ⚠️ Below threshold
                </Text>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Days</Text>
                <Text style={styles.statValue}>{attendanceData.attendance.totalDays}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Present</Text>
                <Text style={[styles.statValue, styles.presentColor]}>
                  {attendanceData.attendance.presentDays}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Absent</Text>
                <Text style={[styles.statValue, styles.absentColor]}>
                  {attendanceData.attendance.absentDays}
                </Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={() => {}}
              style={styles.button}
            >
              DOWNLOAD PDF
            </Button>

            <Text style={styles.disclaimer}>
              Official attendance records are maintained by the school administration.
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  </SafeAreaView>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
  backgroundColor: '#1e40af',
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  classText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  presentColor: {
    color: '#10b981',
  },
  absentColor: {
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#1e40af',
    marginBottom: 15,
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default StudentDashboard;

