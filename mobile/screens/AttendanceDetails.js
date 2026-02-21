import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Card } from 'react-native-paper';

const AttendanceDetails = ({ route }) => {
  const { students } = route.params || { students: [] };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Details</Text>
      </View>

      {students.map((item, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Text style={styles.studentName}>{item.student.name}</Text>
            <Text style={styles.classInfo}>
              Class: {item.student.class}{item.student.section}
            </Text>
            <View style={styles.attendanceInfo}>
              <Text style={styles.percentage}>
                Attendance: {item.attendance.percentage}%
              </Text>
              <Text style={styles.details}>
                Present: {item.attendance.presentDays} / Total: {item.attendance.totalDays}
              </Text>
            </View>
            {item.student.parentContact && (
              <Text style={styles.contact}>
                Parent Contact: {item.student.parentContact}
              </Text>
            )}
          </Card.Content>
        </Card>
      ))}
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
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  classInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  attendanceInfo: {
    marginBottom: 10,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#666',
  },
  contact: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
});

export default AttendanceDetails;

