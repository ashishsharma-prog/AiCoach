import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Progress from './pages/Progress';
import Plans from './pages/Plans';
import FullPlan from './components/FullPlan';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <ChatProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="plans" element={<Plans />} />
                  <Route path="plan/:planId" element={<FullPlan />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </ChatProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;