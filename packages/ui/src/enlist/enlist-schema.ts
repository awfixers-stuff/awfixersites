import { z } from "zod";

import type { MilitaryBranch, PublicServiceType } from "./enlist-data";

export type EnlistFormDraft = {
  age: number | "";
  isUsCitizen: boolean | null;
  isSecondGeneration: boolean | null;
  onRegistry: boolean | null;
  isVeteran: boolean | null;
  branch: MilitaryBranch | "";
  militaryRank: string;
  militaryUnit: string;
  militarySpecialty: string;
  yearsOfService: string;
  dischargeType: string;
  combatDeployments: string;
  hasPublicService: boolean | null;
  publicServiceTypes: PublicServiceType[];
  policeAgencyType: string;
  policeYears: string;
  policeStatus: string;
  policeTraining: string;
  fireDepartmentType: string;
  fireYears: string;
  fireCertifications: string;
  federalAgency: string;
  federalYears: string;
  federalClearance: string;
  emsCertification: string;
  emsYears: string;
  correctionsAgency: string;
  correctionsYears: string;
  otherPublicService: string;
  callsign: string;
  email: string;
  state: string;
  specialty: string;
  rank: string;
  message: string;
};

export const enlistFormSchema = z.object({
  age: z
    .number({ error: "Enter your age." })
    .int("Age must be a whole number.")
    .min(18, "You must be at least 18 to enlist at this time.")
    .max(80, "Enter a valid age."),

  isUsCitizen: z
    .boolean()
    .refine((value) => value === true, { error: "U.S. citizenship is required." }),
  isSecondGeneration: z.boolean(),
  onRegistry: z
    .boolean()
    .refine((value) => value === false, { error: "Registry status disqualifies enlistment." }),

  isVeteran: z.boolean(),
  branch: z.string(),
  militaryRank: z.string().trim(),
  militaryUnit: z.string().trim(),
  militarySpecialty: z.string().trim(),
  yearsOfService: z.string().trim(),
  dischargeType: z.string().trim(),
  combatDeployments: z.string().trim(),

  hasPublicService: z.boolean(),
  publicServiceTypes: z.array(z.string()),

  policeAgencyType: z.string().trim(),
  policeYears: z.string().trim(),
  policeStatus: z.string().trim(),
  policeTraining: z.string().trim(),

  fireDepartmentType: z.string().trim(),
  fireYears: z.string().trim(),
  fireCertifications: z.string().trim(),

  federalAgency: z.string().trim(),
  federalYears: z.string().trim(),
  federalClearance: z.string().trim(),

  emsCertification: z.string().trim(),
  emsYears: z.string().trim(),

  correctionsAgency: z.string().trim(),
  correctionsYears: z.string().trim(),

  otherPublicService: z.string().trim(),

  callsign: z
    .string()
    .trim()
    .min(2, "Callsign must be at least 2 characters.")
    .max(32, "Callsign must be 32 characters or fewer."),
  email: z.email("Enter a valid email address."),
  state: z
    .string()
    .trim()
    .min(2, "Enter your state of residence.")
    .max(32, "State must be 32 characters or fewer."),

  specialty: z.string().min(1, "Select your primary specialty."),
  rank: z.string().min(1, "Select the rank you are applying for."),
  message: z
    .string()
    .trim()
    .min(24, "Tell us a little more about why you want to enlist.")
    .max(1_000, "Keep your message under 1,000 characters."),
});

export type EnlistFormValues = z.infer<typeof enlistFormSchema>;

export const defaultEnlistValues: EnlistFormDraft = {
  age: "",
  isUsCitizen: null,
  isSecondGeneration: null,
  onRegistry: null,
  isVeteran: null,
  branch: "",
  militaryRank: "",
  militaryUnit: "",
  militarySpecialty: "",
  yearsOfService: "",
  dischargeType: "",
  combatDeployments: "",
  hasPublicService: null,
  publicServiceTypes: [],
  policeAgencyType: "",
  policeYears: "",
  policeStatus: "",
  policeTraining: "",
  fireDepartmentType: "",
  fireYears: "",
  fireCertifications: "",
  federalAgency: "",
  federalYears: "",
  federalClearance: "",
  emsCertification: "",
  emsYears: "",
  correctionsAgency: "",
  correctionsYears: "",
  otherPublicService: "",
  callsign: "",
  email: "",
  state: "",
  specialty: "",
  rank: "",
  message: "",
};

export type RejectionReason = "age" | "citizenship" | "registry";

export function getRejectionReason(values: EnlistFormDraft): RejectionReason | null {
  if (typeof values.age === "number" && values.age < 18) return "age";
  if (values.isUsCitizen === false) return "citizenship";
  if (values.onRegistry === true) return "registry";
  return null;
}

export function isAgeEligible(age: number) {
  return age >= 18;
}

export function draftToSubmittedValues(draft: EnlistFormDraft): EnlistFormValues {
  return {
    ...draft,
    age: typeof draft.age === "number" ? draft.age : 0,
    isUsCitizen: draft.isUsCitizen === true,
    isSecondGeneration: draft.isSecondGeneration === true,
    onRegistry: draft.onRegistry === true,
    isVeteran: draft.isVeteran === true,
    hasPublicService: draft.hasPublicService === true,
    publicServiceTypes: draft.publicServiceTypes,
  };
}

export function getBranchLabel(branch: string) {
  const labels: Record<MilitaryBranch, string> = {
    army: "U.S. Army",
    navy: "U.S. Navy",
    marines: "U.S. Marine Corps",
    "air-force": "U.S. Air Force",
    "space-force": "U.S. Space Force",
    "coast-guard": "U.S. Coast Guard",
  };
  return labels[branch as MilitaryBranch] ?? branch;
}

export function getPublicServiceLabel(type: string) {
  const labels: Record<PublicServiceType, string> = {
    police: "Police / law enforcement",
    fire: "Fire department",
    "federal-le": "Federal law enforcement",
    ems: "EMS / paramedic",
    corrections: "Corrections / detention",
    other: "Other public service",
  };
  return labels[type as PublicServiceType] ?? type;
}
