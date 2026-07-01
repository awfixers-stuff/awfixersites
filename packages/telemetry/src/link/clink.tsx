"use client";

import NextLink from "next/link";
import * as React from "react";

import { getDistinctId, track } from "../track";
import { useClinkConfig } from "./clink-provider";
import { resolveHref } from "./resolve-href";

type CLinkProps = Omit<React.ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

function CLink({ href, onClick, rel, target, ...rest }: CLinkProps) {
  const config = useClinkConfig();
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const resolved = resolveHref(href, config, currentOrigin, getDistinctId());

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    track(config.click.event, {
      ...config.click.properties,
      href: resolved.href,
      internal: resolved.internal,
    });
    onClick?.(event);
  }

  return (
    <NextLink
      {...rest}
      href={resolved.href}
      rel={resolved.rel ?? rel}
      target={resolved.target ?? target}
      onClick={handleClick}
    />
  );
}

export { CLink };
export type { CLinkProps };
