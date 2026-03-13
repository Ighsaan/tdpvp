import React from "react";

export const MenuButton = ({
  label,
  onClick,
  disabled = false
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
}): React.ReactElement => {
  return (
    <button className="menu-button" onClick={onClick} disabled={disabled} type="button">
      {label}
    </button>
  );
};
