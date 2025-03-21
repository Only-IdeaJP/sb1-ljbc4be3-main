<<<<<<< HEAD
import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Shared default style for the toasts
const defaultToastStyle = {
    borderRadius: '8px',
    padding: '16px 24px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

interface HotToastType {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const HotToast: HotToastType = {
    success: (message: string) =>
        toast.success(message, {
            style: { ...defaultToastStyle, background: '#4caf50', color: '#fff' },
        }),
    error: (message: string) =>
        toast.error(message, {
            style: { ...defaultToastStyle, background: '#f44336', color: '#fff' },
        }),
    info: (message: string) =>
        toast(message, {
            style: { ...defaultToastStyle, background: '#2196f3', color: '#fff' },
        }),
};

export { HotToast };

export const ToastContainer: React.FC = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: defaultToastStyle,
            }}
        />
    );
};
=======
import { Toaster, toast } from 'react-hot-toast';

interface HotToastType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const HotToast: HotToastType = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
};

const ToastContainer: React.FC = () => {
  return <Toaster position="top-right" toastOptions={{ duration: 3000 }} />;
};

export { HotToast, ToastContainer };
>>>>>>> main
