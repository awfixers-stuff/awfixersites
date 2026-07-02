"use client";

import * as React from "react";

import { CLink } from "./clink";

type MdxClinkProps = {
  children?: React.ReactNode;
  id?: string;
};

function MdxClink({ children, id }: MdxClinkProps) {
  const childText =
    typeof children === "string"
      ? children
      : React.Children.toArray(children)
          .filter((child) => typeof child === "string")
          .join("");

  const targetId = (id ?? childText).trim();
  if (!targetId) {
    return <span>{children}</span>;
  }

  return <CLink href={targetId}>{children ?? targetId}</CLink>;
}

export { MdxClink };