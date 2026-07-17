import React from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { TaskListTab } from './components/TaskListTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { CalendarTab } from './components/CalendarTab';


const MainAppContent: React.FC = () => {
  const { user, activeTab } = useTasks();



  if (!user) {
    return <LoginScreen />;
  }

  // Renderização das telas (Tabs) com base no estado de activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskListTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'calendar':
        return <CalendarTab />;
      default:
        return <TaskListTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Navbar Superior */}
      <Navbar />

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-300">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <TaskProvider>
      <MainAppContent />
    </TaskProvider>
  );
}

export default App;
