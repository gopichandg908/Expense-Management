import React, { useState } from 'react';
import Modal from '../components/Modal.jsx';
import { formatCurrency } from '../utils/formatters.js';

const UsersPage = ({ users, setUsers, departments, setDepartments, setExpenses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formState, setFormState] = useState({ firstName: '', lastName: '', departmentId: '' });
    const [error, setError] = useState('');

    const openModal = (user = null) => {
        setEditingUser(user);
        setFormState(user ? { firstName: user.firstName, lastName: user.lastName, departmentId: user.departmentId } : { firstName: '', lastName: '', departmentId: '' });
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = () => {
        if (!formState.firstName.trim() || !formState.lastName.trim() || !formState.departmentId) {
            setError('All fields are required.');
            return;
        }

        if (editingUser) {
            // Edit user - O(1)
            const oldDepartmentId = editingUser.departmentId;
            const newDepartmentId = formState.departmentId;

            setUsers(prev => ({
                ...prev,
                [editingUser.id]: { ...prev[editingUser.id], ...formState }
            }));

            if (oldDepartmentId !== newDepartmentId) {
                setDepartments(prev => {
                    const newDepts = { ...prev };
                    // Decrement old department
                    newDepts[oldDepartmentId] = {
                        ...newDepts[oldDepartmentId],
                        userCount: newDepts[oldDepartmentId].userCount - 1,
                        totalSpending: newDepts[oldDepartmentId].totalSpending - editingUser.totalSpending
                    };
                    // Increment new department
                    newDepts[newDepartmentId] = {
                        ...newDepts[newDepartmentId],
                        userCount: newDepts[newDepartmentId].userCount + 1,
                        totalSpending: newDepts[newDepartmentId].totalSpending + editingUser.totalSpending
                    };
                    return newDepts;
                });
            }
        } else {
            // Add user - O(1)
            const newId = `user-${Date.now()}`;
            setUsers(prev => ({
                ...prev,
                [newId]: { id: newId, ...formState, totalSpending: 0, expenseCount: 0 }
            }));
            setDepartments(prev => ({
                ...prev,
                [formState.departmentId]: {
                    ...prev[formState.departmentId],
                    userCount: prev[formState.departmentId].userCount + 1
                }
            }));
        }
        closeModal();
    };

    const handleDelete = (user) => {
        // O(1) for user and department updates
        setUsers(prev => {
            const newUsers = { ...prev };
            delete newUsers[user.id];
            return newUsers;
        });

        setDepartments(prev => ({
            ...prev,
            [user.departmentId]: {
                ...prev[user.departmentId],
                userCount: prev[user.departmentId].userCount - 1,
                totalSpending: prev[user.departmentId].totalSpending - user.totalSpending
            }
        }));

        // O(n) for expenses but acceptable as per requirements side-effect
        setExpenses(prev => {
            const newExpenses = { ...prev };
            Object.values(newExpenses).forEach(expense => {
                if (expense.userId === user.id) {
                    delete newExpenses[expense.id];
                }
            });
            return newExpenses;
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button 
                    onClick={() => openModal()} 
                    disabled={Object.keys(departments).length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-blue-300 disabled:cursor-not-allowed">
                    Add User
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Spending</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expenses</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(users).map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{`${user.firstName} ${user.lastName}`}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{departments[user.departmentId]?.name}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{formatCurrency(user.totalSpending)}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{user.expenseCount}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">
                                    <button onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingUser ? 'Edit User' : 'Add User'}>
                <div className="space-y-4">
                    <input type="text" placeholder="First Name" value={formState.firstName} onChange={e => setFormState({...formState, firstName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    <input type="text" placeholder="Last Name" value={formState.lastName} onChange={e => setFormState({...formState, lastName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                    <select value={formState.departmentId} onChange={e => setFormState({...formState, departmentId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">Select Department</option>
                        {Object.values(departments).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
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

export default UsersPage;

