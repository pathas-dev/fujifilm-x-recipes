interface CuratedRecipeSettingItemProps {
  label: string;
  value: string | number;
}

const CuratedRecipeSettingItem = ({
  label,
  value,
}: CuratedRecipeSettingItemProps) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-base-content/70 text-xs">{label}</span>
    <span className="text-base-content text-xs font-medium">{value}</span>
  </div>
);

export default CuratedRecipeSettingItem;
