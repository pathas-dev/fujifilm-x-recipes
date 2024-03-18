export const toastType = {
  error: 'Error',
  success: 'Success',
} as const;

interface IToastProps {
  message: string;
  type: (typeof toastType)[keyof typeof toastType];
}

const Toast = ({ message, type }: IToastProps) => {
  const classNameMap: {
    [key: string]: string;
  } = {
    [toastType.success]: 'alert alert-success shadow-lg text-base-100',
    [toastType.error]: 'alert alert-error shadow-lg text-base-100',
  };

  const className = classNameMap[type];

  return (
    <div className="toast toast-center toast-middle z-10">
      <div className={className}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
