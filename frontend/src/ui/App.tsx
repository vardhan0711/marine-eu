import { useState } from 'react';
import { Tabs } from './components/Tabs';
import { RoutesTab } from './pages/RoutesTab';
import { CompareTab } from './pages/CompareTab';
import { BankingTab } from './pages/BankingTab';
import { PoolingTab } from './pages/PoolingTab';

function App() {
  const [activeTab, setActiveTab] = useState('routes');

  const tabs = [
    { id: 'routes', label: 'Routes', content: <RoutesTab /> },
    { id: 'compare', label: 'Compare', content: <CompareTab /> },
    { id: 'banking', label: 'Banking', content: <BankingTab /> },
    { id: 'pooling', label: 'Pooling', content: <PoolingTab /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">FuelEU Maritime</h1>
          <p className="text-blue-100 mt-1">Compliance Management System</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
