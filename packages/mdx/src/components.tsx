import type { MDXComponents } from "mdx/types";

import { MdxClink } from "@awfixersites/telemetry/link";

import {
  MdxH1,
  MdxH2,
  MdxH3,
  MdxP,
  MdxA,
  MdxUl,
  MdxOl,
  MdxLi,
  MdxBlockquote,
  MdxHr,
  MdxCode,
  MdxPre,
  MdxTable,
  MdxTh,
  MdxTd,
  MdxTr,
  MdxThead,
  MdxTbody,
  MdxStrong,
  MdxEm,
} from "@awfixersites/ui/components/mdx";

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    h1: MdxH1,
    h2: MdxH2,
    h3: MdxH3,
    p: MdxP,
    a: MdxA,
    ul: MdxUl,
    ol: MdxOl,
    li: MdxLi,
    blockquote: MdxBlockquote,
    hr: MdxHr,
    code: MdxCode,
    pre: MdxPre,
    table: MdxTable,
    th: MdxTh,
    td: MdxTd,
    tr: MdxTr,
    thead: MdxThead,
    tbody: MdxTbody,
    strong: MdxStrong,
    em: MdxEm,
    clink: MdxClink,
    ...components,
  };
}
