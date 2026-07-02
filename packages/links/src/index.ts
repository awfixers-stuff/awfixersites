export { LINKS, getLinkEntry, listTargetIds, type TargetId } from "./registry";
export {
  clinkUrl,
  isExternalTargetId,
  isTargetId,
  resolveLink,
  DEFAULT_API_BASE,
  type ResolveLinkContext,
  type ResolvedLink,
} from "./resolve";
export {
  internalLinkSchema,
  externalLinkSchema,
  linkEntrySchema,
  linkRegistrySchema,
  type InternalLinkEntry,
  type ExternalLinkEntry,
  type LinkEntry,
  type LinkRegistry,
} from "./schema";
export { TRUSTED_APEX_HOSTS, SITE_APEX, apexForSiteKey, isTrustedHost } from "./trusted-hosts";