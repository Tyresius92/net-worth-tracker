import React from "react";

export interface ButtonProps
  extends Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "onClick" | 'type' | 'name' | 'value'
  > { }

export const Button = (props: ButtonProps) => {
  return <button {...props} />;
};
