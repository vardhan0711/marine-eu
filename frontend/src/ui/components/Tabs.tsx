import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      <div className="glass-strong rounded-2xl p-2 mb-6">
        <nav className="flex space-x-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative whitespace-nowrap px-6 py-3 text-sm font-semibold rounded-xl
                transition-all duration-300 transform
                ${
                  activeTab === tab.id
                    ? 'text-gradient-primary bg-white shadow-medium scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 hover:scale-[1.02]'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="animate-fade-in">{activeTabContent}</div>
    </div>
  );
}

