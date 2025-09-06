import React from 'react';

const TabButton = ({ tabName, activeTab, setActiveTab, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

const Header = ({ activeTab, setActiveTab, handleGenerateData, isLoading }) => {
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-800">ExpenseManager</div>
                <div className="flex space-x-2">
                    <TabButton tabName="departments" activeTab={activeTab} setActiveTab={setActiveTab}>Departments</TabButton>
                    <TabButton tabName="users" activeTab={activeTab} setActiveTab={setActiveTab}>Users</TabButton>
                    <TabButton tabName="expenses" activeTab={activeTab} setActiveTab={setActiveTab}>Expenses</TabButton>
                </div>
                <button 
                    onClick={handleGenerateData} 
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-green-300"
                >
                    {isLoading ? 'Generating...' : 'Generate Mock Data'}
                </button>
            </nav>
        </header>
    );
};

export default Header;

