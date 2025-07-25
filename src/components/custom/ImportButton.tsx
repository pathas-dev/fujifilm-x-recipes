import useToastStore from '@/stores/toast';
import { ImportFileMessages } from '@/types/language';
import _isEqual from 'lodash/isEqual';
import _unionWith from 'lodash/unionWith';
import { ChangeEventHandler, useState } from 'react';
import { SvgArrowRightEndOnRectangle, SvgCheckSolid } from '../icon/svgs';
import { STORAGE_CUSTOM_RECIPES_KEY } from './CustomList';
import { CustomRecipe } from './customRecipe';

interface IExportButtonProps {
  importFileMessages?: ImportFileMessages;
  onImportSuccess?: (unionRecipes: CustomRecipe[]) => void;
}

const ImportButton = ({
  importFileMessages,
  onImportSuccess,
}: IExportButtonProps) => {
  const successMessage = importFileMessages?.success ?? '';
  const noFileErrorMessage = importFileMessages?.errors?.noFile ?? '';
  const noDataErrorMessage = importFileMessages?.errors?.noData ?? '';
  const notJsonErrorMessage = importFileMessages?.errors?.notJson ?? '';

  const tooltipMessage = importFileMessages?.tooltip ?? '';

  const setToastMessage = useToastStore((state) => state.setMessage);

  const [inputOpen, setInputOpen] = useState(false);
  const [uploadedRecipes, setUploadedRecipes] = useState<CustomRecipe[]>([]);

  const handleClick = async () => {
    setInputOpen((prev) => !prev);
  };

  const readJsonFile = (file: File): Promise<{ data: CustomRecipe[] }> =>
    new Promise((resolve, reject) => {
      const onloader = new FileReader();
      onloader.onload = (e) => {
        if (!e.target?.result) return reject('');

        const uploadedRecipes = JSON.parse(e.target.result as string);
        resolve(uploadedRecipes);
      };
      onloader.readAsText(file);
    });

  const onFileChange: ChangeEventHandler<HTMLInputElement> = async ({
    target: { files },
  }) => {
    const file = files?.[0];

    if (!file)
      return setToastMessage({ message: noFileErrorMessage, type: 'Error' });
    if (file.type !== 'application/json')
      return setToastMessage({
        message: notJsonErrorMessage,
        type: 'Error',
      });

    try {
      const { data: uploadedRecipes } = await readJsonFile(file);

      if (!uploadedRecipes) throw Error(noDataErrorMessage);

      setUploadedRecipes(uploadedRecipes);
    } catch (error) {
      console.log(error);
      setToastMessage({ message: (error as Error).message, type: 'Error' });
    }
  };

  const onCheckClick = async () => {
    if (!uploadedRecipes || uploadedRecipes.length === 0)
      return setToastMessage({ type: 'Error', message: noFileErrorMessage });

    const storedRecipes = JSON.parse(
      localStorage.getItem(STORAGE_CUSTOM_RECIPES_KEY) ?? '[]'
    );

    const unionedRecipes = _unionWith(storedRecipes, uploadedRecipes, _isEqual);
    localStorage.setItem(
      STORAGE_CUSTOM_RECIPES_KEY,
      JSON.stringify(unionedRecipes)
    );

    setInputOpen(false);
    setUploadedRecipes([]);
    onImportSuccess?.(unionedRecipes);
    setToastMessage({ message: successMessage });
  };

  return (
    <div className="relative">
      <div className="tooltip tooltip-left z-50" data-tip={tooltipMessage}>
        <button
          className="btn btn-ghost btn-circle btn-sm fill-secondary"
          onClick={handleClick}
        >
          <SvgArrowRightEndOnRectangle />
        </button>
      </div>
      {inputOpen && (
        <div className="absolute w-[66dvw] max-w-72 right-0 top-7 flex bg-transparent z-50">
          <input
            type="file"
            className="file-input file-input-bordered file-input-secondary w-full max-w-xs pr-6"
            onChange={onFileChange}
          />

          <button
            className="btn btn-square btn-ghost fill-secondary absolute right-0"
            onClick={onCheckClick}
          >
            <SvgCheckSolid />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportButton;
