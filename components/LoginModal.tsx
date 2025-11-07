
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { User } from '../types';
import * as dataService from '../services/dataService';
import { XIcon } from './icons';
import Spinner from './Spinner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = dataService.login(username, password);
      onLogin(user);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">เข้าสู่ระบบ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
              <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
              <input type="password" id="password-login" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
              {isLoading ? <Spinner /> : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
};

export default LoginModal;
   