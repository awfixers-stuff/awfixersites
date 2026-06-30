import type { PublicServiceType } from "./enlist-data";
import type { EnlistFormDraft } from "./enlist-schema";

export type StepId =
  | "age"
  | "screening"
  | "veteran"
  | "branch"
  | "branch-details"
  | "public-service"
  | "public-service-select"
  | "public-service-police"
  | "public-service-fire"
  | "public-service-federal"
  | "public-service-ems"
  | "public-service-corrections"
  | "public-service-other"
  | "profile"
  | "application"
  | "review";

export type StepMeta = {
  id: StepId;
  section: "eligibility" | "service" | "profile" | "application";
  title: string;
  subtitle: string;
};

export const STEP_META: Record<StepId, StepMeta> = {
  age: {
    id: "age",
    section: "eligibility",
    title: "How old are you?",
    subtitle: "Age determines which tracks are open to you right now.",
  },
  screening: {
    id: "screening",
    section: "eligibility",
    title: "Citizenship & screening",
    subtitle: "These are the non-negotiable standards from the enlistment brief.",
  },
  veteran: {
    id: "veteran",
    section: "service",
    title: "Are you a U.S. military veteran?",
    subtitle: "Prior service shapes your file and the questions that follow.",
  },
  branch: {
    id: "branch",
    section: "service",
    title: "Which branch did you serve?",
    subtitle: "All six branches plus Coast Guard and Space Force are listed.",
  },
  "branch-details": {
    id: "branch-details",
    section: "service",
    title: "Tell us about your service",
    subtitle: "Rank, unit, specialty, and discharge — straight answers only.",
  },
  "public-service": {
    id: "public-service",
    section: "service",
    title: "Public service experience?",
    subtitle: "Police, fire, federal law enforcement, EMS, corrections, and more.",
  },
  "public-service-select": {
    id: "public-service-select",
    section: "service",
    title: "Which public service?",
    subtitle: "Select every category that applies. We will ask follow-ups for each.",
  },
  "public-service-police": {
    id: "public-service-police",
    section: "service",
    title: "Police / law enforcement",
    subtitle: "Agency type, status, training, and time on the job.",
  },
  "public-service-fire": {
    id: "public-service-fire",
    section: "service",
    title: "Fire department service",
    subtitle: "Department type, certifications, and years served.",
  },
  "public-service-federal": {
    id: "public-service-federal",
    section: "service",
    title: "Federal law enforcement",
    subtitle: "Agency, clearance level, and years of federal service.",
  },
  "public-service-ems": {
    id: "public-service-ems",
    section: "service",
    title: "EMS / paramedic service",
    subtitle: "Certification level and field experience.",
  },
  "public-service-corrections": {
    id: "public-service-corrections",
    section: "service",
    title: "Corrections / detention",
    subtitle: "Agency and time served in custody operations.",
  },
  "public-service-other": {
    id: "public-service-other",
    section: "service",
    title: "Other public service",
    subtitle: "Search & rescue, dispatch, public works, or similar duty.",
  },
  profile: {
    id: "profile",
    section: "profile",
    title: "Your contact file",
    subtitle: "Callsign, email, and state of residence.",
  },
  application: {
    id: "application",
    section: "application",
    title: "Role & intent",
    subtitle: "Specialty, rank track, and why you want in.",
  },
  review: {
    id: "review",
    section: "application",
    title: "Review & file",
    subtitle: "Read your answers before you submit.",
  },
};

const PUBLIC_SERVICE_DETAIL_STEPS: Record<PublicServiceType, StepId> = {
  police: "public-service-police",
  fire: "public-service-fire",
  "federal-le": "public-service-federal",
  ems: "public-service-ems",
  corrections: "public-service-corrections",
  other: "public-service-other",
};

export function buildStepSequence(values: EnlistFormDraft): StepId[] {
  const steps: StepId[] = ["age", "screening", "veteran"];

  if (values.isVeteran === true) {
    steps.push("branch", "branch-details");
  }

  steps.push("public-service");

  if (values.hasPublicService === true) {
    steps.push("public-service-select");

    for (const type of values.publicServiceTypes as PublicServiceType[]) {
      const detailStep = PUBLIC_SERVICE_DETAIL_STEPS[type];
      if (detailStep) steps.push(detailStep);
    }
  }

  steps.push("profile", "application", "review");
  return steps;
}

export type StepErrors = Partial<Record<keyof EnlistFormDraft, string>>;

export function validateStep(stepId: StepId, values: EnlistFormDraft): StepErrors {
  const errors: StepErrors = {};

  switch (stepId) {
    case "age": {
      if (values.age === "" || values.age < 16) {
        errors.age = "Enter your age.";
      }
      break;
    }
    case "screening": {
      if (values.isUsCitizen === null || values.isUsCitizen === undefined) {
        errors.isUsCitizen = "Answer whether you are a U.S. citizen.";
      }
      if (values.isSecondGeneration === null || values.isSecondGeneration === undefined) {
        errors.isSecondGeneration = "Answer whether you are a second-generation American.";
      }
      if (values.onRegistry === null || values.onRegistry === undefined) {
        errors.onRegistry = "Answer whether you are on any registry.";
      }
      break;
    }
    case "veteran": {
      if (values.isVeteran === null || values.isVeteran === undefined) {
        errors.isVeteran = "Answer whether you are a military veteran.";
      }
      break;
    }
    case "branch": {
      if (!values.branch) errors.branch = "Select your branch of service.";
      break;
    }
    case "branch-details": {
      if (!values.militaryRank) errors.militaryRank = "Select or enter your rank at separation.";
      if (!values.militaryUnit.trim()) errors.militaryUnit = "Enter your last unit or command.";
      if (!values.militarySpecialty.trim())
        errors.militarySpecialty = "Enter your MOS, rating, or AFSC.";
      if (!values.yearsOfService.trim()) errors.yearsOfService = "Enter years of service.";
      if (!values.dischargeType) errors.dischargeType = "Select discharge characterization.";
      break;
    }
    case "public-service": {
      if (values.hasPublicService === null || values.hasPublicService === undefined) {
        errors.hasPublicService = "Answer whether you have public service experience.";
      }
      break;
    }
    case "public-service-select": {
      if (values.publicServiceTypes.length === 0) {
        errors.publicServiceTypes = "Select at least one public service category.";
      }
      break;
    }
    case "public-service-police": {
      if (!values.policeAgencyType) errors.policeAgencyType = "Select agency type.";
      if (!values.policeStatus) errors.policeStatus = "Select your duty status.";
      if (!values.policeYears.trim()) errors.policeYears = "Enter years of police service.";
      break;
    }
    case "public-service-fire": {
      if (!values.fireDepartmentType) errors.fireDepartmentType = "Select department type.";
      if (!values.fireYears.trim()) errors.fireYears = "Enter years of fire service.";
      break;
    }
    case "public-service-federal": {
      if (!values.federalAgency) errors.federalAgency = "Select your federal agency.";
      if (!values.federalYears.trim()) errors.federalYears = "Enter years of federal service.";
      if (!values.federalClearance) errors.federalClearance = "Select clearance level.";
      break;
    }
    case "public-service-ems": {
      if (!values.emsCertification) errors.emsCertification = "Select certification level.";
      if (!values.emsYears.trim()) errors.emsYears = "Enter years of EMS experience.";
      break;
    }
    case "public-service-corrections": {
      if (!values.correctionsAgency.trim())
        errors.correctionsAgency = "Enter your corrections agency.";
      if (!values.correctionsYears.trim())
        errors.correctionsYears = "Enter years of corrections service.";
      break;
    }
    case "public-service-other": {
      if (!values.otherPublicService.trim())
        errors.otherPublicService = "Describe your public service.";
      break;
    }
    case "profile": {
      if (!values.callsign.trim() || values.callsign.trim().length < 2) {
        errors.callsign = "Callsign must be at least 2 characters.";
      }
      if (!values.email.trim()) errors.email = "Enter a valid email address.";
      if (!values.state.trim() || values.state.trim().length < 2) {
        errors.state = "Enter your state of residence.";
      }
      break;
    }
    case "application": {
      if (!values.specialty) errors.specialty = "Select your primary specialty.";
      if (!values.rank) errors.rank = "Select the rank you are applying for.";
      if (!values.message.trim() || values.message.trim().length < 24) {
        errors.message = "Tell us a little more about why you want to enlist.";
      }
      break;
    }
    default:
      break;
  }

  return errors;
}

export function getSectionProgress(steps: StepId[], currentIndex: number) {
  const currentSection = STEP_META[steps[currentIndex] ?? "age"]?.section ?? "eligibility";
  const sectionOrder = ["eligibility", "service", "profile", "application"] as const;
  const currentSectionIndex = sectionOrder.indexOf(currentSection);

  const stepsInCurrentSection = steps.filter(
    (step) => STEP_META[step].section === currentSection,
  ).length;
  const stepIndexInSection = steps
    .slice(0, currentIndex + 1)
    .filter((step) => STEP_META[step].section === currentSection).length;

  return {
    currentSection,
    sectionIndex: currentSectionIndex,
    sectionCount: sectionOrder.length,
    stepInSection: stepIndexInSection,
    stepsInSection: stepsInCurrentSection,
  };
}
