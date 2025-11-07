
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangleIcon, CheckCircleIcon, XIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const toastRoot = document.getElementById('toast-root');
  if (!toastRoot) return null;

  const bgColor = type === 'success' ? 'bg-secondary' : 'bg-danger';
  const Icon = type === 'success' ? CheckCircleIcon : AlertTriangleIcon;

  return ReactDOM.createPortal(
    <div className={`fixed top-5 right-5 z-[110] max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${bgColor} text-white`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="rounded-md inline-flex text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Close</span>
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    toastRoot
  );
};

export default Toast;
   