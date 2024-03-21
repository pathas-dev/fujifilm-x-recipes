import { SvgArrowDownTraySolid } from '../icon/svgs';
import { CUSTOM_RECIPES_STORAGE_KEY } from './CustomList';

const ExportButton = () => {
  const downloadCustomRecipes = async () => {
    const storedRecipes = JSON.parse(
      localStorage.getItem(CUSTOM_RECIPES_STORAGE_KEY) ?? '[]'
    );

    if (!storedRecipes || storedRecipes.length === 0) return;

    const fileCreateResponse = await fetch('/api/recipes/file', {
      method: 'POST',
      body: JSON.stringify({ data: storedRecipes }),
    });
    const { filename } = await fileCreateResponse.json();

    const fileGetResponse = await fetch(`/api/recipes/file/${filename}`);

    const file = await fileGetResponse.blob();
    const url = window.URL.createObjectURL(file);
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = filename;
    document.body.appendChild(linkElement);
    linkElement.click();
    linkElement.remove();
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
        <SvgArrowDownTraySolid />
      </button>
    </div>
  );
};

export default ExportButton;
