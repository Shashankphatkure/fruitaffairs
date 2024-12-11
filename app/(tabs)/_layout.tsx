import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarStyle: { display: 'none' }, // Hide bottom tabs
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => (
            <IconSymbol 
              size={28} 
              name="house.fill" 
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 15 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerRight: () => (
            <IconSymbol 
              size={28} 
              name="paperplane.fill" 
              color={Colors[colorScheme ?? 'light'].text}
              style={{ marginRight: 15 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
