
import React, { useState } from 'react';
import { User } from '../types';
import * as dataService from '../services/dataService';
import UserFormModal from './UserFormModal';
import { EditIcon, PlusIcon, TrashIcon } from './icons';

interface UserManagementProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleOpenModal = (user?: User) => {
        setUserToEdit(user || null);
        setIsModalOpen(true);
    };

    const handleSaveUser = (userData: Omit<User, 'id'>, userId?: string) => {
        try {
            if (userId) {
                dataService.updateUser(userId, userData);
                showToast('อัปเดตผู้ใช้สำเร็จ');
            } else {
                dataService.createUser(userData);
                showToast('เพิ่มผู้ใช้ใหม่สำเร็จ');
            }
            setUsers(dataService.getUsers());
            setIsModalOpen(false);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด', 'error');
        }
    };

    const handleDeleteUser = (userId: string) => {
        if(window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) {
            try {
                dataService.deleteUser(userId);
                setUsers(dataService.getUsers());
                showToast('ลบผู้ใช้สำเร็จ');
            } catch (error) {
                showToast(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด', 'error');
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้งาน</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
                    <PlusIcon className="w-5 h-5" />
                    เพิ่มผู้ใช้
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อผู้ใช้</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">การกระทำ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleOpenModal(user)} className="text-primary hover:text-primary-light p-1">
                                        <EditIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-danger hover:text-red-700 p-1 ml-2">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
            />
        </div>
    );
};

export default UserManagement;

   