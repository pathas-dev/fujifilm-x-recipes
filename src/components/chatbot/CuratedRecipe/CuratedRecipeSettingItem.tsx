interface CuratedRecipeSettingItemProps {
  label: string;
  value: string | number;
}

const CuratedRecipeSettingItem = ({
  label,
  value,
}: CuratedRecipeSettingItemProps) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-xs text-base-content/70">{label}</span>
    <span className="text-xs font-medium text-base-content">{value}</span>
  </div>
);

export default CuratedRecipeSettingItem;
