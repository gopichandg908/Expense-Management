import React, { useState } from 'react';
import Modal from '../components/Modal.jsx';
import { formatCurrency } from '../utils/formatters.js';

const DepartmentsPage = ({ departments, setDepartments, users, setUsers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [reassignDeptId, setReassignDeptId] = useState('');
    const [error, setError] = useState('');

    const openModal = (dept = null) => {
        setEditingDepartment(dept);
        setNewDepartmentName(dept ? dept.name : '');
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDepartment(null);
    };
    
    const openDeleteModal = (dept) => {
        if (dept.userCount > 0) {
            setDepartmentToDelete(dept);
            setReassignDeptId('');
            setIsDeleteModalOpen(true);
        } else {
            handleDeleteDepartment(dept.id);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDepartmentToDelete(null);
    };

    const handleSave = () => {
        if (!newDepartmentName.trim()) {
            setError('Department name cannot be empty.');
            return;
        }

        const isNameTaken = Object.values(departments).some(
            d => d.name.toLowerCase() === newDepartmentName.trim().toLowerCase() && d.id !== editingDepartment?.id
        );

        if (isNameTaken) {
            setError('Department name must be unique.');
            return;
        }

        if (editingDepartment) {
            // Edit existing department - O(1)
            setDepartments(prev => ({
                ...prev,
                [editingDepartment.id]: { ...prev[editingDepartment.id], name: newDepartmentName.trim() }
            }));
        } else {
            // Add new department - O(1)
            const newId = `dept-${Date.now()}`;
            setDepartments(prev => ({
                ...prev,
                [newId]: { id: newId, name: newDepartmentName.trim(), userCount: 0, totalSpending: 0 }
            }));
        }
        closeModal();
    };

    const handleDeleteDepartment = (deptId, reassignToDeptId = null) => {
        const deptToDelete = departments[deptId];
        if (!deptToDelete) return;
    
        const newDepartments = { ...departments };
        const newUsers = { ...users };
    
        if (reassignToDeptId && deptToDelete.userCount > 0) {
            Object.values(users).forEach(user => {
                if (user.departmentId === deptId) {
                    newUsers[user.id] = { ...user, departmentId: reassignToDeptId };
                }
            });
    
            // O(1) updates
            newDepartments[reassignToDeptId] = {
                ...newDepartments[reassignToDeptId],
                userCount: newDepartments[reassignToDeptId].userCount + deptToDelete.userCount,
                totalSpending: newDepartments[reassignToDeptId].totalSpending + deptToDelete.totalSpending,
            };
        }
    
        // O(1) deletion
        delete newDepartments[deptId];
    
        setDepartments(newDepartments);
        setUsers(newUsers);
        if (isDeleteModalOpen) closeDeleteModal();
    };
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Department Management</h1>
                <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow">
                    Add Department
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department Name</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Users</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Spending</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(departments).map(dept => (
                            <tr key={dept.id} className="hover:bg-gray-50">
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{dept.name}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{dept.userCount}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">{formatCurrency(dept.totalSpending)}</td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm text-right">
                                    <button onClick={() => openModal(dept)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                    <button onClick={() => openDeleteModal(dept)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingDepartment ? 'Edit Department' : 'Add Department'}>
                <div className="mt-4">
                    <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700">Department Name</label>
                    <input
                        type="text"
                        id="dept-name"
                        value={newDepartmentName}
                        onChange={(e) => setNewDepartmentName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                </div>
            </Modal>
            
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete Department">
                <p>This department has users. Please select a new department to reassign them to.</p>
                <select 
                    value={reassignDeptId}
                    onChange={e => setReassignDeptId(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
                >
                    <option value="">Select a department</option>
                    {Object.values(departments)
                        .filter(d => d.id !== departmentToDelete?.id)
                        .map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => handleDeleteDepartment(departmentToDelete.id, reassignDeptId)} 
                        disabled={!reassignDeptId}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:bg-red-300"
                    >
                        Delete and Reassign
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default DepartmentsPage;

