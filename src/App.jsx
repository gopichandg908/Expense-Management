import React, { useState } from 'react';
import Header from './components/Header.jsx';
import DepartmentsPage from './pages/DepartmentsPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import { generateMockData } from './utils/mockData.js';

export default function App() {
    const [activeTab, setActiveTab] = useState('departments');
    const [departments, setDepartments] = useState({});
    const [users, setUsers] = useState({});
    const [expenses, setExpenses] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateData = () => {
        setIsLoading(true);
        // Simulate async data generation
        setTimeout(() => {
            const { departments, users, expenses } = generateMockData();
            setDepartments(departments);
            setUsers(users);
            setExpenses(expenses);
            setIsLoading(false);
        }, 50); 
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UsersPage 
                            users={users} 
                            setUsers={setUsers} 
                            departments={departments} 
                            setDepartments={setDepartments} 
                            expenses={expenses} 
                            setExpenses={setExpenses} 
                        />;
            case 'expenses':
                return <ExpensesPage 
                            expenses={expenses} 
                            setExpenses={setExpenses} 
                            users={users} 
                            setUsers={setUsers} 
                            departments={departments} 
                            setDepartments={setDepartments} 
                        />;
            case 'departments':
            default:
                return <DepartmentsPage 
                            departments={departments} 
                            setDepartments={setDepartments} 
                            users={users} 
                            setUsers={setUsers} 
                        />;
        }
    };

    return (
        <div className="font-sans bg-gray-100 min-h-screen">
            <Header 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleGenerateData={handleGenerateData}
                isLoading={isLoading}
            />
            <main>
                {renderContent()}
            </main>
        </div>
    );
}

