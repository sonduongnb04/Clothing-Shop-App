import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Tài khoản',
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="personal-info"
        options={{
          headerTitle: 'Thông tin cá nhân',
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerTitle: 'Đổi mật khẩu',
        }}
      />
    </Stack>
  );
}
