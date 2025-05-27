import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    <BrowserRouter>
      <UserProvider>
        <ChatProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/plan/:planId" element={<FullPlan />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </ChatProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;