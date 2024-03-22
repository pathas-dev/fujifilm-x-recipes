'use client';

import useToastStore, { toastType } from '@/stores/toast';
import { useEffect } from 'react';

const TOAST_ALIVE_TIME = 900;

const Toast = () => {
  const {
    toast: { message, type },
    clear,
  } = useToastStore();

  useEffect(() => {
    if (!!message) {
      setTimeout(() => clear(), TOAST_ALIVE_TIME);
    }
  }, [message, clear]);

  const classNameMap: {
    [key: string]: string;
  } = {
    [toastType.success]: 'alert alert-success shadow-lg text-base-100',
    [toastType.error]: 'alert alert-error shadow-lg text-base-100',
  };

  const className = classNameMap[type];

  if (!message) return null;

  return (
    <div className="toast toast-center toast-middle z-10">
      <div className={className}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
