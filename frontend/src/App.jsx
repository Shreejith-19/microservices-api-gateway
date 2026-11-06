import React from 'react';
import { RequestProvider } from './context/RequestContext';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

function App() {
  return (
    <RequestProvider>
      <DashboardLayout />
    </RequestProvider>
  );
}

export default App;
