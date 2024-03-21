import { useState } from 'react';
import { SvgEnvelopeSolid } from '../icon/svgs';
import { CUSTOM_RECIPES_STORAGE_KEY } from './CustomList';

const ExportButton = () => {
  const [inputOpen, setInputOpen] = useState(false);

  const downloadCustomRecipes = async () => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY) ?? '[]'
    );

    if (!storedRecipes || storedRecipes.length === 0) return;

    const fileCreateResponse = await fetch('/api/recipes/file', {
      method: 'POST',
      body: JSON.stringify({ data: storedRecipes, email: '' }),
    });
  };

  const handleClick = async () => {
    await downloadCustomRecipes();
  };

  return (
    <div>
      <button
        className="btn btn-ghost btn-circle btn-primary btn-sm fill-info"
        onClick={handleClick}
      >
        <SvgEnvelopeSolid />
      </button>
    </div>
  );
};

export default ExportButton;
