import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <DashboardLayout />
      </RequestProvider>
    </AuthProvider>
  );
}

export default App;
