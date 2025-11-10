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
    <div className="min-h-screen gradient-subtle">
      {/* Modern Header */}
      <header className="glass-strong border-b border-white/30 shadow-medium sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient-primary mb-1 tracking-tight">
                FuelEU Maritime
              </h1>
              <p className="text-slate-600 font-medium text-sm">Compliance Management System</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow"></div>
              <span className="text-sm font-semibold text-slate-700">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            © 2024 FuelEU Maritime Compliance System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
