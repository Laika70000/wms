import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users with proper UUID format
const MOCK_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'logistician@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'logistician'
  },
  {
    id: '987fcdeb-51a2-43d7-9b56-254415174000',
    email: 'merchant@example.com',
    password: 'password123',
    name: 'Jane Smith',
    role: 'merchant'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!mockUser) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword as User);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};