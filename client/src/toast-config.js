import { toast } from 'react-hot-toast';

// Custom success toast with glassmorphism
export const showSuccessToast = (message) => {
    toast.success(message, {
        duration: 3000,
        style: {
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
            fontWeight: '500',
        },
        iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
        },
    });
};

// Custom error toast
export const showErrorToast = (message) => {
    toast.error(message, {
        duration: 4000,
        style: {
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
            fontWeight: '500',
        },
        iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
        },
    });
};

// Custom info toast
export const showInfoToast = (message) => {
    toast(message, {
        duration: 3000,
        style: {
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#3b82f6',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
            fontWeight: '500',
        },
        icon: '💡',
    });
};

// Custom loading toast
export const showLoadingToast = (message) => {
    return toast.loading(message, {
        style: {
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#8b5cf6',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)',
            fontWeight: '500',
        },
    });
};
