import React, { useState, useMemo } from 'react';
import Modal from '../components/Modal.jsx';
import { formatCurrency } from '../utils/formatters.js';

const ExpensesPage = ({ expenses, setExpenses, users, setUsers, setDepartments }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formState, setFormState] = useState({ userId: '', category: 'Food', description: '', cost: '' });
    const [error, setError] = useState('');
    const expenseCategories = ['Supplies', 'Software', 'Gas', 'Food', 'Other'];

    const userList = useMemo(() => Object.values(users).map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`
    })), [users]);

    const openModal = (expense = null) => {
        setEditingExpense(expense);
        setFormState(expense ? { userId: expense.userId, category: expense.category, description: expense.description, cost: expense.cost } : { userId: '', category: 'Food', description: '', cost: '' });
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleSave = () => {
        const cost = parseFloat(formState.cost);
        if (!formState.userId || !formState.category || !formState.description.trim() || isNaN(cost) || cost <= 0) {
            setError('All fields are required and cost must be a positive number.');
            return;
        }

        if (editingExpense) {
            // Edit Expense - O(1)
            const oldUser = users[editingExpense.userId];
            const newUser = users[formState.userId];
            const costDifference = cost - editingExpense.cost;

            setExpenses(prev => ({
                ...prev,
                [editingExpense.id]: { ...editingExpense, ...formState, cost }
            }));
            
            if (editingExpense.userId === formState.userId) { // Same user
                setUsers(prev => ({
                    ...prev,
                    [oldUser.id]: { ...oldUser, totalSpending: oldUser.totalSpending + costDifference }
                }));
                setDepartments(prev => ({
                    ...prev,
                    [oldUser.departmentId]: { ...prev[oldUser.departmentId], totalSpending: prev[oldUser.departmentId].totalSpending + costDifference }
                }));
            } else { // Different user
                // Update old user
                setUsers(prev => ({
                    ...prev,
                    [oldUser.id]: { ...oldUser, totalSpending: oldUser.totalSpending - editingExpense.cost, expenseCount: oldUser.expenseCount - 1 }
                }));
                setDepartments(prev => ({
                    ...prev,
                    [oldUser.departmentId]: { ...prev[oldUser.departmentId], totalSpending: prev[oldUser.departmentId].totalSpending - editingExpense.cost }
                }));
                 // Update new user
                 setUsers(prev => ({
                    ...prev,
                    [newUser.id]: { ...newUser, totalSpending: newUser.totalSpending + cost, expenseCount: newUser.expenseCount + 1 }
                }));
                setDepartments(prev => ({
                    ...prev,
                    [newUser.departmentId]: { ...prev[newUser.departmentId], totalSpending: prev[newUser.departmentId].totalSpending + cost }
                }));
            }
        } else {
            // Add expense - O(1)
            const newId = `expense-${Date.now()}`;
            setExpenses(prev => ({
                ...prev,
                [newId]: { id: newId, ...formState, cost }
            }));
            const user = users[formState.userId];
            setUsers(prev => ({
                ...prev,
                [user.id]: { ...user, totalSpending: user.totalSpending + cost, expenseCount: user.expenseCount + 1 }
            }));
            setDepartments(prev => ({
                ...prev,
                [user.departmentId]: { ...prev[user.departmentId], totalSpending: prev[user.departmentId].totalSpending + cost }
            }));
        }
        closeModal();
    };
    
    const handleDelete = (expense) => {
        // O(1) updates
        const user = users[expense.userId];
        setExpenses(prev => {
            const newExpenses = {...prev};
            delete newExpenses[expense.id];
            return newExpenses;
        });

        setUsers(prev => ({
            ...prev,
            [user.id]: {...user, totalSpending: user.totalSpending - expense.cost, expenseCount: user.expenseCount - 1}
        }));

        setDepartments(prev => ({
            ...prev,
            [user.departmentId]: {...prev[user.departmentId], totalSpending: prev[user.departmentId].totalSpending - expense.cost}
        }));
    };
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
                <button 
                    onClick={() => openModal()} 
                    disabled={Object.keys(users).length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-blue-300 disabled:cursor-not-allowed">
                    Add Expense
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(expenses).map(expense => {
                            const user = users[expense.userId];
                            return (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">{user ? `${user.firstName} ${user.lastName}` : 'N/A'}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">{expense.category}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">{expense.description}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm">{formatCurrency(expense.cost)}</td>
                                    <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">
                                        <button onClick={() => openModal(expense)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(expense)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
                <div className="space-y-4">
                    <select value={formState.userId} onChange={e => setFormState({...formState, userId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select User</option>
                        {userList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                     <select value={formState.category} onChange={e => setFormState({...formState, category: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="Description" value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    <input type="number" placeholder="Cost" value={formState.cost} onChange={e => setFormState({...formState, cost: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                </div>
            </Modal>
        </div>
    );
};

export default ExpensesPage;

