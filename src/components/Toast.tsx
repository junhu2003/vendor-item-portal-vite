import { useState, useEffect } from "react";
import { SquareXIcon } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, type = "success", duration = 3000, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed top-15 right-[10%] z-50 flex items-center space-x-4 rounded-lg px-4 py-3 text-white shadow-lg transition-all duration-300 ${typeClasses[type]}`}
    >
      <span>{message}</span>
      <SquareXIcon onClick={() => setVisible(false)} className="text-white hover:text-gray-300"/>      
    </div>
  );
};

export default Toast;
