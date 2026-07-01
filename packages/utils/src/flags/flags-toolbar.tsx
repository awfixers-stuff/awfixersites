"use client";

import type { FlagDefinitionsType, FlagValuesType } from "flags";
import { FlagDefinitions, FlagValues } from "flags/react";

type Encrypted = string;

type FlagsToolbarProps = {
  definitions?: FlagDefinitionsType | Encrypted;
  values?: FlagValuesType | Encrypted;
};

/**
 * Registers feature-flag definitions and values with the Vercel Toolbar.
 * Mount in the root layout during development or when toolbar overrides are enabled.
 */
function FlagsToolbar({ definitions, values }: FlagsToolbarProps) {
  return (
    <>
      {definitions ? <FlagDefinitions definitions={definitions} /> : null}
      {values ? <FlagValues values={values} /> : null}
    </>
  );
}

export { FlagsToolbar };
