import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [userType, setUserType] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [adminId, setAdminId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userType || (!teacherId && !studentId && !adminId)) {
      Alert.alert('Error', 'Please select user type and enter ID');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call (replace with actual API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user session (replace with actual storage)
      if (userType === 'teacher' && teacherId) {
        // Simulate teacher login
        navigation.replace('TeacherDashboard');
      } else if (userType === 'student' && studentId) {
        // Simulate student login
        navigation.replace('StudentDashboard');
      } else if (userType === 'admin' && adminId) {
        // Simulate admin login
        navigation.replace('SchoolAdminDashboard');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Login Failed', 'Please try again');
    }
  };

  return (
    <LinearGradient
      colors={['#4CAF50', '#45a049']}
      style={styles.container}
    >
      <KeyboardAvoidingView behavior="padding">
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>XYP QUANTUM SCHOOL</Text>
            <Text style={styles.subtitle}>Attendance Management System</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Select User Type</Text>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, userType === 'teacher' && styles.buttonActive]}
                onPress={() => setUserType('teacher')}
              >
                <Ionicons name="school" size={20} color="#fff" />
                <Text style={styles.buttonText}>Teacher</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, userType === 'student' && styles.buttonActive]}
                onPress={() => setUserType('student')}
              >
                <Ionicons name="person" size={20} color="#fff" />
                <Text style={styles.buttonText}>Student</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, userType === 'admin' && styles.buttonActive]}
                onPress={() => setUserType('admin')}
              >
                <Ionicons name="shield" size={20} color="#fff" />
                <Text style={styles.buttonText}>Admin</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Enter ID</Text>
            
            {userType === 'teacher' && (
              <TextInput
                style={styles.input}
                placeholder="Enter Teacher ID (TCH001)"
                value={teacherId}
                onChangeText={setTeacherId}
                placeholderTextColor="#999"
              />
            )}
            
            {userType === 'student' && (
              <TextInput
                style={styles.input}
                placeholder="Enter Student ID (STU001)"
                value={studentId}
                onChangeText={setStudentId}
                placeholderTextColor="#999"
              />
            )}
            
            {userType === 'admin' && (
              <TextInput
                style={styles.input}
                placeholder="Enter Admin ID (ADM001)"
                value={adminId}
                onChangeText={setAdminId}
                placeholderTextColor="#999"
              />
            )}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.buttonText}>Logging in...</Text>
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  form: {
    width: '100%',
    paddingHorizontal: 30,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;
