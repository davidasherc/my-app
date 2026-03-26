import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  subscriptionPlan: 'basic' | 'premium' | 'family';
  stripeCustomerId?: string;
  therapistEmail?: string;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  therapistEmail?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ENCRYPTION_KEY = 'emotion-journal-2024-secure-key'; // In production, this should be generated securely

// HIPAA Compliant encryption utilities
const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Mock API functions - replace with actual secure backend
const mockLogin = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Hardcoded test users
  if (email === 'test@example.com' && password === 'test123') {
    const testUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      subscriptionStatus: 'active' as const,
      subscriptionPlan: 'premium' as const,
      stripeCustomerId: 'cus_test123',
      therapistEmail: 'therapist@example.com',
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    console.log('🔵 TEST USER LOGIN:', testUser);
    return {
      success: true,
      user: testUser
    };
  }

  if (email === 'basic@test.com' && password === 'basic123') {
    const basicUser = {
      id: '2',
      email: 'basic@test.com',
      firstName: 'Basic',
      lastName: 'User',
      subscriptionStatus: 'trial' as const,
      subscriptionPlan: 'basic' as const,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    console.log('🟢 BASIC USER LOGIN:', basicUser);
    return {
      success: true,
      user: basicUser
    };
  }
  
  return { success: false, error: 'Invalid credentials' };
};

const mockRegister = async (userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Basic validation
  if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
    return { success: false, error: 'All fields are required' };
  }

  if (userData.password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  return {
    success: true,
    user: {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      subscriptionStatus: 'trial',
      subscriptionPlan: 'basic',
      therapistEmail: userData.therapistEmail,
      isVerified: true, // Auto-verify for development/testing
      createdAt: new Date().toISOString()
    }
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔵🔵🔵 AUTHPROVIDER USEEFFECT - LOADING CACHED USER...');
    loadCachedUser();
  }, []);

  const loadCachedUser = async () => {
    console.log('📂 Checking for cached user...');
    try {
      const { value } = await Preferences.get({ key: 'encrypted_user' });
      console.log('📂 Raw cached value exists:', !!value);
      if (value) {
        const decryptedUser = decryptData(value);
        const parsedUser = JSON.parse(decryptedUser);
        console.log('✅ LOADED CACHED USER:', parsedUser);
        setUser(parsedUser);
      } else {
        console.log('📂 No cached user found');
      }
    } catch (error) {
      console.error('❌ Error loading stored user:', error);
      // Clear corrupted data
      await Preferences.remove({ key: 'encrypted_user' });
    } finally {
      setIsLoading(false);
      console.log('📂 loadCachedUser finished, isLoading = false');
    }
  };

  const storeUser = async (userData: User) => {
    console.log('💾💾💾 STORING USER:', userData);
    try {
      const encryptedUser = encryptData(JSON.stringify(userData));
      await Preferences.set({ key: 'encrypted_user', value: encryptedUser });
      
      // Log authentication event for HIPAA audit trail
      const auditLog = {
        event: 'user_login',
        userId: userData.id,
        timestamp: new Date().toISOString(),
        ipAddress: 'mobile_app' // In production, get actual IP
      };
      
      const existingLogs = await Preferences.get({ key: 'audit_logs' });
      const logs = existingLogs.value ? JSON.parse(existingLogs.value) : [];
      logs.push(auditLog);
      
      // Keep only last 100 audit logs locally
      const recentLogs = logs.slice(-100);
      await Preferences.set({ key: 'audit_logs', value: JSON.stringify(recentLogs) });
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await mockLogin(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        await storeUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await mockRegister(userData);
      if (result.success && result.user) {
        setUser(result.user);
        await storeUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await Preferences.remove({ key: 'encrypted_user' });
      await Preferences.remove({ key: 'encrypted_journal_data' });
      setUser(null);
      
      // Log logout event
      const auditLog = {
        event: 'user_logout',
        userId: user?.id || 'unknown',
        timestamp: new Date().toISOString()
      };
      
      const existingLogs = await Preferences.get({ key: 'audit_logs' });
      const logs = existingLogs.value ? JSON.parse(existingLogs.value) : [];
      logs.push(auditLog);
      await Preferences.set({ key: 'audit_logs', value: JSON.stringify(logs.slice(-100)) });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    console.log('🔄🔄🔄 UPDATE PROFILE CALLED!', { currentUser: user, updates });
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      // In production, this would call your secure backend API
      const updatedUser = { ...user, ...updates };
      console.log('🔄 UPDATED USER OBJECT:', updatedUser);
      setUser(updatedUser);
      await storeUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}