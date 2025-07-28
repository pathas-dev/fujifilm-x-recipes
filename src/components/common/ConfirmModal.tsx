'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon?: React.ReactNode;
  confirmButtonClass?: string;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  icon,
  confirmButtonClass = 'bg-error text-error-content hover:bg-error/90',
}: ConfirmModalProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isClient || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          className="border-base-300/50 bg-base-100 relative z-10 mx-4 w-full max-w-md rounded-xl border p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center gap-3">
            {icon && (
              <div className="bg-error/10 flex h-10 w-10 items-center justify-center rounded-full">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-base-content text-lg font-semibold">
                {title}
              </h3>
            </div>
          </div>

          <p className="text-base-content/70 mb-6 text-sm">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="border-base-300 bg-base-200 text-base-content hover:bg-base-300 flex-1 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
