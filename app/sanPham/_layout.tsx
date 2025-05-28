import { Stack } from 'expo-router';
import React from 'react';

export default function ProductLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Chi tiết sản phẩm",
        headerBackTitle: " ",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerTitle: "Chi tiết sản phẩm",
        }}
      />
    </Stack>
  );
}
