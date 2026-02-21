import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Urgent: Attendance Shortage for Sagar',
      message: 'Dear Parent, This is an alert regarding your child (Class 10A). His attendance in Science for the current semester is 78%, which is below the required 80% threshold. Please take necessary action.',
      time: '4:30 PM',
      date: 'Today',
      tags: ['#AttendanceShortage', '#SagarSingh']
    }
  ]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>XYP Quantum School</Text>
        <Text style={styles.headerSubtitle}>Messages</Text>
      </View>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Card key={notification.id} style={styles.card}>
          <Card.Content>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{notification.title}</Text>
            </View>

            {/* Detailed Message */}
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>XYP Quantum School</Text>
                <Text style={styles.messageTime}>({notification.time})</Text>
              </View>
              <Text style={styles.messageText}>{notification.message}</Text>
              
              {/* Tags */}
              <View style={styles.tagsContainer}>
                {notification.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={styles.button}
                >
                  VIEW REPORT
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {}}
                  style={[styles.button, styles.buttonSecondary]}
                >
                  REPLY TO SCHOOL
                </Button>
              </View>

              <Text style={styles.timestamp}>
                {notification.date} - {notification.time}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton}>
          <Icon name="send" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>
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
  card: {
    margin: 15,
    elevation: 4,
  },
  summaryCard: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messageCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#1e40af',
  },
  buttonSecondary: {
    backgroundColor: '#6b7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
  },
});

export default NotificationScreen;

