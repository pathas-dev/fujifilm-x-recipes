import { ChangeEventHandler, useState } from 'react';
import { SvgAirplaneSolid, SvgEnvelopeSolid } from '../icon/svgs';
import { CUSTOM_RECIPES_STORAGE_KEY } from './CustomList';
import useToastStore from '@/stores/toast';
import { SendEmailMessages } from '@/types/language';

interface IExportButtonProps {
  sendEmailMessages?: SendEmailMessages;
}

const ExportButton = ({ sendEmailMessages }: IExportButtonProps) => {
  const placeholder = sendEmailMessages?.placeholder;
  const successMessage = sendEmailMessages?.success ?? '';
  const noDataErrorMessage = sendEmailMessages?.errors?.noData ?? '';
  const noEmailErrorMessage = sendEmailMessages?.errors?.noEmail ?? '';
  const tooltipMessage = sendEmailMessages?.tooltip ?? '';

  const setToastMessage = useToastStore((state) => state.setMessage);

  const [inputOpen, setInputOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMailRecipes = async () => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY) ?? '[]'
    );

    if (!storedRecipes || storedRecipes.length === 0)
      throw new Error(noDataErrorMessage);

    const response = await fetch('/api/recipes/email', {
      method: 'POST',
      body: JSON.stringify({ data: storedRecipes, email: email.trim() }),
    });

    return response;
  };

  const handleClick = async () => {
    setInputOpen((prev) => !prev);
  };

  const onEmailChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    setEmail(value);
  };

  const onSendClick = async () => {
    try {
      if (!email.trim()) throw Error(noEmailErrorMessage);
      setLoading(true);
      const res = await sendMailRecipes();
      if (res?.status !== 200) throw Error(res?.statusText);

      setToastMessage({ message: successMessage });
      setEmail('');
      setInputOpen(false);
    } catch (error) {
      setToastMessage({ message: (error as Error).message, type: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative tooltip tooltip-left z-50"
      data-tip={tooltipMessage}
    >
      <button
        className="btn btn-ghost btn-circle btn-primary btn-sm fill-info"
        onClick={handleClick}
      >
        <SvgEnvelopeSolid />
      </button>
      {inputOpen && (
        <div className="absolute w-80 right-0 top-7 flex bg-transparent z-50">
          <label className="input input-bordered w-full flex items-center gap-2 fill-current">
            <SvgEnvelopeSolid />
            <input
              type="text"
              className="grow"
              placeholder={placeholder}
              value={email}
              onChange={onEmailChange}
            />
          </label>

          {loading ? (
            <span className="loading loading-spinner absolute right-2 h-full" />
          ) : (
            <button
              className="btn btn-square btn-ghost fill-secondary absolute right-0"
              onClick={onSendClick}
            >
              <SvgAirplaneSolid />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportButton;
