import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="play"
                options={{
                    title: 'Play',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="game-controller-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="me"
                options={{
                    title: 'Me',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="feed"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="start"
                options={{
                    title: 'Start',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="walk-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#0D0D0D',
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        paddingTop: 10,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
});
