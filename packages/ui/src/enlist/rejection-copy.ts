import type { RejectionReason } from "./enlist-schema";

export const ENLIST_REJECTION_COPY: Record<
  RejectionReason,
  { title: string; body: string; footnote?: string }
> = {
  age: {
    title: "Not eligible at this time",
    body: "We do not accept anyone under the age of 19 at this time. Applicants must be at least 18 to file — full standing opens at 19.",
    footnote:
      "A junior division is in the works. Check back later if you are 16 or 17 and still want to serve.",
  },
  citizenship: {
    title: "Citizenship requirement",
    body: "Enlistment through this form is open to U.S. citizens only. Non-citizens may pursue the recruit path with a unit sponsor.",
  },
  registry: {
    title: "Registry disqualification",
    body: "Felony status alone does not bar you — but registry status does. We cannot accept applicants who are on any registry.",
  },
};
