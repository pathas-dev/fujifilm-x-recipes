import { ChangeEventHandler, useState } from 'react';
import { SvgAirplaneSolid, SvgEnvelopeSolid } from '../icon/svgs';
import useCustomRecipeStore from '@/stores/customRecipe';
import useToastStore from '@/stores/toast';
import { useTranslations } from 'next-intl';

const ExportButton = () => {
  const tSendEmail = useTranslations('SendEmail');

  const placeholder = tSendEmail('placeholder');
  const successMessage = tSendEmail('success');
  const noDataErrorMessage = tSendEmail('errors.noData');
  const noEmailErrorMessage = tSendEmail('errors.noEmail');
  const tooltipMessage = tSendEmail('tooltip');

  const setToastMessage = useToastStore((state) => state.setMessage);
  const { customRecipes } = useCustomRecipeStore();

  const [inputOpen, setInputOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMailRecipes = async () => {
    if (!customRecipes || customRecipes.length === 0)
      throw new Error(noDataErrorMessage);

    const response = await fetch('/api/recipes/email', {
      method: 'POST',
      body: JSON.stringify({ data: customRecipes, email: email.trim() }),
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
    <div className="relative">
      <div className="tooltip tooltip-left z-50" data-tip={tooltipMessage}>
        <button
          className="btn btn-ghost btn-circle btn-primary btn-sm fill-info"
          onClick={handleClick}
        >
          <SvgEnvelopeSolid />
        </button>
      </div>
      {inputOpen && (
        <div className="absolute top-7 right-0 z-50 flex w-[66dvw] max-w-80 bg-transparent">
          <label className="input input-bordered flex w-full items-center gap-2 fill-current">
            <SvgEnvelopeSolid />
            <input
              type="email"
              className="grow pr-6"
              placeholder={placeholder}
              value={email}
              onChange={onEmailChange}
            />
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
          </label>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
