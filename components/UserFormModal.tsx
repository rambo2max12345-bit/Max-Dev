
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { User, UserRole } from '../types';
import { XIcon } from './icons';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>, userId?: string) => void;
  userToEdit?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TEACHER);

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setFullName(userToEdit.fullName);
      setRole(userToEdit.role);
      setPassword(''); // Don't pre-fill password for security
    } else {
      setUsername('');
      setPassword('');
      setFullName('');
      setRole(UserRole.TEACHER);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !fullName || (!userToEdit && !password)) {
        alert("Please fill all required fields.");
        return;
    }
    const userData: Omit<User, 'id'> = { username, fullName, role };
    if (password) {
        userData.password = password;
    }
    onSave(userData, userToEdit?.id);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{userToEdit ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
              <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="username-form" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
              <input type="text" id="username-form" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="password-form" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
              <input type="password" id="password-form" value={password} onChange={e => setPassword(e.target.value)} placeholder={userToEdit ? 'Leave blank to keep current' : ''} required={!userToEdit} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
              <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white">
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.TEACHER}>Teacher</option>
              </select>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              {userToEdit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างผู้ใช้'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default UserFormModal;
   