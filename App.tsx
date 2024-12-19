import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

export default function App() {
  const [hour, setHour] = useState<string>('00');
  const [minute, setMinute] = useState<string>('00');
  const [alarms, setAlarms] = useState<any[]>([]);

  const hours = Array.from({ length: 24 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}`,
    value: `${String(i).padStart(2, '0')}`,
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    label: `${String(i).padStart(2, '0')}`,
    value: `${String(i).padStart(2, '0')}`,
  }));

  useEffect(() => {
    // Request notification permissions
    Notifications.requestPermissionsAsync();
    
    // Register background task
    TaskManager.defineTask('BACKGROUND_ALARM_CHECK', async () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const alarm = alarms.find(a => a.time === currentTime);
      if (alarm) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Alarm',
            body: `It's time for your alarm at ${alarm.time}`,
          },
          trigger: null, // trigger immediately when matched
        });
      }
      return "new-data"; // Use this string instead of BackgroundFetch.Result.NewData
    });
    

    BackgroundFetch.registerTaskAsync('BACKGROUND_ALARM_CHECK', {
      minimumInterval: 60, // check every minute
      stopOnTerminate: false, // keep running in the background
      startOnBoot: true, // restart task after reboot
    });

    return () => {
      // Clean up background task
      BackgroundFetch.unregisterTaskAsync('BACKGROUND_ALARM_CHECK');
    };
  }, [alarms]);

  const scheduleAlarm = () => {
    const alarmTime = `${hour}:${minute}`;
    setAlarms([...alarms, { time: alarmTime }]);
  };

  const removeAlarm = (index: number) => {
    const newAlarms = alarms.filter((_, i) => i !== index);
    setAlarms(newAlarms);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Set Your Alarm</Text>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Hour</Text>
          <Picker
            selectedValue={hour}
            onValueChange={setHour}
            style={styles.dropdown}
          >
            {hours.map((hour) => (
              <Picker.Item key={hour.value} label={hour.label} value={hour.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Minute</Text>
          <Picker
            selectedValue={minute}
            onValueChange={setMinute}
            style={styles.dropdown}
          >
            {minutes.map((minute) => (
              <Picker.Item key={minute.value} label={minute.label} value={minute.value} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={scheduleAlarm}>
        <Text style={styles.buttonText}>Set Alarm</Text>
      </TouchableOpacity>

      <ScrollView style={styles.alarmList}>
        {alarms.length === 0 ? (
          <Text style={styles.noAlarmsText}>No alarms set</Text>
        ) : (
          alarms.map((alarm, index) => (
            <View key={index} style={styles.alarmItem}>
              <Text style={styles.alarmTime}>{alarm.time}</Text>
              <TouchableOpacity onPress={() => removeAlarm(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 60,
    marginBottom: 30,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  dropdown: {
    height: 40,
    width: 120,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 30,
    elevation: 3,
    marginTop: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alarmList: {
    width: '100%',
    marginTop: 30,
  },
  noAlarmsText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 5,
    borderRadius: 5,
  },
  alarmTime: {
    fontSize: 18,
    color: '#333',
  },
  removeText: {
    color: '#ff6347',
    fontWeight: 'bold',
  },
});
