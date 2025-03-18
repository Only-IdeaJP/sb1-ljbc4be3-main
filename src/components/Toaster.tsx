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