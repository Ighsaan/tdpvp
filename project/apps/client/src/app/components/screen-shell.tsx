import React from "react";

export const ScreenShell = ({
  title,
  subtitle,
  children
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: React.ReactNode;
}): React.ReactElement => {
  return (
    <div className="screen-shell">
      <h1 className="screen-title">{title}</h1>
      {subtitle ? <p className="screen-subtitle">{subtitle}</p> : null}
      <div className="screen-content">{children}</div>
    </div>
  );
};
