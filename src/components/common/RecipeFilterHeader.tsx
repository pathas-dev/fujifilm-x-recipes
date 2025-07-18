import { HTMLInputTypeAttribute, useState } from "react";
import _some from "lodash/some";
import { SvgFilmMicro } from "../icon/svgs";
import { motion } from "framer-motion";

export interface IRecipeFilterHeader {
  bwOnly: boolean;
  onBwOnlyChange: (checked: boolean) => void;
  bwOnlyLabel: string;
  recipesCount: number;
  filters: IDropboxProps[];
}

const RecipeFilterHeader = ({
  bwOnly,
  onBwOnlyChange,
  bwOnlyLabel,
  recipesCount,
  filters,
}: IRecipeFilterHeader) => {
  return (
    <motion.header
      className="w-full h-14 shadow-md flex items-center p-2 bg-base-100 z-50 relative"
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0.3, translateY: "-150%" }}
      animate={{ opacity: 1, translateY: "0%" }}
    >
      {filters.map((dropboxProps, index) => (
        <Dropbox {...dropboxProps} key={index} />
      ))}
      <div className="form-control">
        <label className="cursor-pointer label">
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={bwOnly}
            onChange={({ target: { checked } }) => onBwOnlyChange(checked)}
          />
          <span className="label-text text-xs ml-1">{bwOnlyLabel}</span>
        </label>
      </div>
      <span className="flex ml-1 text-xs">
        <SvgFilmMicro />x{recipesCount}
      </span>
    </motion.header>
  );
};

export type DropboxItem = {
  value: string;
  label: string;
  isAsc?: boolean;
};

export interface IDropboxProps {
  items: DropboxItem[];
  selectedItems: DropboxItem[];
  onClickMenu: ({
    item,
    checked,
  }: {
    item: DropboxItem;
    checked: boolean;
  }) => void;
  children: React.ReactElement<any>;
  dropdownEnd?: boolean;
  type?: HTMLInputTypeAttribute;
}

export const Dropbox = ({
  items,
  selectedItems,
  onClickMenu,
  children,
  dropdownEnd,
  type = "checkbox",
}: IDropboxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  let inputClassName =
    type === "checkbox"
      ? "checkbox checkbox-primary checkbox-xs"
      : "radio radio-primary radio-xs";

  return (
    <div
      className={`dropdown ${dropdownEnd ? "dropdown-end" : ""} ${
        isOpen ? "dropdown-open" : ""
      }`.trim()}
    >
      <div
        tabIndex={0}
        role="button"
        className="btn btn-sm m-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1]  p-2 shadow"
      >
        <div className="overflow-y-auto max-h-64 w-full">
          {items.map((item) => (
            <li key={item.label}>
              <label className="label cursor-pointer justify-between">
                <span className="label-text">{item.label}</span>
                <input
                  type={type}
                  checked={!!_some(selectedItems, item)}
                  onChange={({ target: { checked } }) => {
                    onClickMenu({ item: item, checked });
                  }}
                  className={inputClassName}
                />
              </label>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
};

export default RecipeFilterHeader;
