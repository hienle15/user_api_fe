import { toast } from 'sonner';

export const toastSuccess = (title, message) => {
  toast.success(message || title, {
    position: "top-right",
    duration: 3000,
    style: {
      background: '#32CD32', // Lime/banana green background
      color: 'white',
      border: 'none'
    },
    className: 'border-0 bg-lime-500 text-white',
    descriptionClassName: 'text-lime-100',
  });
};

export const toastError = (title, message) => {
  toast.error(message || title, {
    position: "top-right",
    duration: 3000,
    style: {
      background: '#EF4444', // Red background
      color: 'white',
      border: 'none'
    },
    className: 'border-0 bg-red-500 text-white',
    descriptionClassName: 'text-red-100',
  });
};