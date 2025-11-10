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
      <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
        <nav className="flex space-x-1 px-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap border-b-2 px-6 py-4 text-sm font-semibold transition-all duration-300
                relative transform hover:scale-105
                ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-gradient-to-b from-blue-50 to-transparent'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{activeTabContent}</div>
    </div>
  );
}

