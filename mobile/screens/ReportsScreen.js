import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('10A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState({
    totalStudents: 25,
    presentCount: 23,
    absentCount: 2,
    attendancePercentage: 92,
    records: [
      { studentName: 'Alice Johnson', status: 'Present' },
      { studentName: 'Bob Smith', status: 'Present' },
      { studentName: 'Charlie Brown', status: 'Absent' },
      { studentName: 'Diana Prince', status: 'Present' },
      { studentName: 'Eva Green', status: 'Present' },
      { studentName: 'Frank Harris', status: 'Present' },
      { studentName: 'Grace Lee', status: 'Absent' }
    ]
  });

  const classes = ['10A', '10B', '9A', '9B'];
  const getStatusColor = (status) => {
    return status === 'Present' ? '#4CAF50' : '#F44336';
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setReportData({
        ...reportData,
        attendancePercentage: Math.floor(Math.random() * 20) + 75,
        presentCount: Math.floor(Math.random() * 5) + 20,
        absentCount: Math.floor(Math.random() * 3) + 2
      });
      setLoading(false);
    }, 1000);
  };

  const handleDownloadAll = () => {
    Alert.alert(
      'Download All Reports',
      'This will generate a PDF report for all students. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Download all reports') }
      ]
    );
  };

  const handleViewReport = (studentName) => {
    Alert.alert(
      'Student Report',
      `View detailed attendance report for ${studentName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Report', onPress: () => navigation.navigate('StudentReport', { studentName }) }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#FF9800', '#F57C00']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Class Attendance Reports</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Filters */}
          <View style={styles.filterContainer}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Class:</Text>
              <View style={styles.classSelector}>
                {classes.map((cls, index) => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.classOption, selectedClass === cls && styles.classOptionSelected]}
                    onPress={() => setSelectedClass(cls)}
                  >
                    <Text style={styles.classText}>{cls}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Date:</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Text style={styles.dateText}>{selectedDate}</Text>
                <Ionicons name="calendar" size={16} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Overall Statistics</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{reportData.totalStudents}</Text>
                  <Text style={styles.statLabel}>Total Students</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{reportData.presentCount}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: '#F44336' }]}>{reportData.absentCount}</Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{reportData.attendancePercentage}%</Text>
                  <Text style={styles.statLabel}>Attendance Rate</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Download All Button */}
          <TouchableOpacity style={styles.downloadAllButton} onPress={handleDownloadAll}>
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.downloadAllText}>Download All Reports</Text>
          </TouchableOpacity>

          {/* Student List */}
          <View style={styles.studentListContainer}>
            <Text style={styles.listTitle}>Student Attendance Details</Text>
            {reportData.records.map((student, index) => (
              <TouchableOpacity
                key={index}
                style={styles.studentRow}
                onPress={() => handleViewReport(student.studentName)}
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.studentName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.status) }]}>
                    <Text style={styles.statusText}>{student.status}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
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
  filterContainer: {
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
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  classOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  classOptionSelected: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  classText: {
    fontSize: 14,
    color: '#333',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  downloadAllButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  downloadAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  studentListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    padding: 20,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ReportsScreen;
