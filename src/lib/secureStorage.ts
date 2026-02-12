import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/constants/config';

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(config.ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

export async function setAccessToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(config.ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting access token:', error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(config.REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(config.REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(config.ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(config.REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(config.USER_DATA_KEY),
    ]);
    console.log('[Storage] All auth data cleared');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

export async function getUserData<T>(): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(config.USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function setUserData<T>(data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(config.USER_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting user data:', error);
  }
}
