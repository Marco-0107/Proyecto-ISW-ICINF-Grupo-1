import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

const ToastNotification = ({ 
  message, 
  type = 'success', 
  duration = 4000, 
  onClose,
  isVisible 
}) => {

  useEffect(() => {
    if (isVisible && message) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, message, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-white" />;
      case 'info':
        return <Info className="w-6 h-6 text-white" />;
      default:
        return <CheckCircle className="w-6 h-6 text-white" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  if (!isVisible || !message) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center pointer-events-none">
      <div 
        className={`
          ${getBackgroundColor()} 
          text-white 
          px-6 py-4 
          rounded-xl 
          shadow-2xl 
          flex 
          items-center 
          gap-3 
          max-w-md 
          mx-4
          transform 
          transition-all 
          duration-300 
          ease-in-out
          pointer-events-auto
          min-w-[280px]
          opacity-100 translate-y-0 scale-100
        `}
      >
        {getIcon()}
        <span className="font-semibold text-base flex-1">{message}</span>
        <button
          onClick={() => {
            if (onClose) onClose();
          }}
          className="ml-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
