import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import SchoolAdminDashboardScreen from './screens/SchoolAdminDashboardScreen';
import MarkAttendanceScreen from './screens/MarkAttendanceScreen';
import ReportsScreen from './screens/ReportsScreen';
import StudentReportScreen from './screens/StudentReportScreen';
import TeacherAlertsScreen from './screens/TeacherAlertsScreen';
import StudentAlertsScreen from './screens/StudentAlertsScreen';
import AttendanceSummaryScreen from './screens/AttendanceSummaryScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: 'transparent',
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TeacherDashboard"
          component={TeacherDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudentDashboard"
          component={StudentDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SchoolAdminDashboard"
          component={SchoolAdminDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MarkAttendance"
          component={MarkAttendanceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudentReport"
          component={StudentReportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TeacherAlerts"
          component={TeacherAlertsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudentAlerts"
          component={StudentAlertsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AttendanceSummary"
          component={AttendanceSummaryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Reports') {
            iconName = 'assessment';
          } else if (route.name === 'Messages') {
            iconName = 'message';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Reports" component={AdminDashboard} />
      <Tab.Screen name="Messages" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={AdminDashboard} />
    </Tab.Navigator>
  );
}

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Reports') {
            iconName = 'assessment';
          } else if (route.name === 'Messages') {
            iconName = 'message';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboard} />
      <Tab.Screen name="Reports" component={StudentDashboard} />
      <Tab.Screen name="Messages" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={StudentDashboard} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TeacherTabs" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
          <Stack.Screen name="AttendanceDetails" component={AttendanceDetails} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

