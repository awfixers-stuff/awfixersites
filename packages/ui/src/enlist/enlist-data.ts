export const MILITARY_BRANCHES = [
  { value: "army", label: "U.S. Army", specialtyLabel: "MOS" },
  { value: "navy", label: "U.S. Navy", specialtyLabel: "Rating" },
  { value: "marines", label: "U.S. Marine Corps", specialtyLabel: "MOS" },
  { value: "air-force", label: "U.S. Air Force", specialtyLabel: "AFSC" },
  { value: "space-force", label: "U.S. Space Force", specialtyLabel: "SFSC / AFSC" },
  { value: "coast-guard", label: "U.S. Coast Guard", specialtyLabel: "Rating" },
] as const;

export type MilitaryBranch = (typeof MILITARY_BRANCHES)[number]["value"];

export const BRANCH_RANKS: Record<MilitaryBranch, string[]> = {
  army: [
    "E-1 Private",
    "E-2 Private",
    "E-3 Private First Class",
    "E-4 Specialist / Corporal",
    "E-5 Sergeant",
    "E-6 Staff Sergeant",
    "E-7 Sergeant First Class",
    "E-8 Master Sergeant / First Sergeant",
    "E-9 Sergeant Major",
    "W-1 through W-5 Warrant Officer",
    "O-1 through O-10 Commissioned Officer",
  ],
  navy: [
    "E-1 Seaman Recruit",
    "E-2 Seaman Apprentice",
    "E-3 Seaman",
    "E-4 Petty Officer Third Class",
    "E-5 Petty Officer Second Class",
    "E-6 Petty Officer First Class",
    "E-7 Chief Petty Officer",
    "E-8 Senior Chief Petty Officer",
    "E-9 Master Chief Petty Officer",
    "W-1 through W-5 Warrant Officer",
    "O-1 through O-10 Commissioned Officer",
  ],
  marines: [
    "E-1 Private",
    "E-2 Private First Class",
    "E-3 Lance Corporal",
    "E-4 Corporal",
    "E-5 Sergeant",
    "E-6 Staff Sergeant",
    "E-7 Gunnery Sergeant",
    "E-8 Master Sergeant / First Sergeant",
    "E-9 Sergeant Major / Master Gunnery Sergeant",
    "W-1 through W-5 Warrant Officer",
    "O-1 through O-10 Commissioned Officer",
  ],
  "air-force": [
    "E-1 Airman Basic",
    "E-2 Airman",
    "E-3 Airman First Class",
    "E-4 Senior Airman",
    "E-5 Staff Sergeant",
    "E-6 Technical Sergeant",
    "E-7 Master Sergeant",
    "E-8 Senior Master Sergeant",
    "E-9 Chief Master Sergeant",
    "O-1 through O-10 Commissioned Officer",
  ],
  "space-force": [
    "E-1 Specialist 1",
    "E-2 Specialist 2",
    "E-3 Specialist 3",
    "E-4 Specialist 4",
    "E-5 Sergeant",
    "E-6 Technical Sergeant",
    "E-7 Master Sergeant",
    "E-8 Senior Master Sergeant",
    "E-9 Chief Master Sergeant",
    "O-1 through O-10 Commissioned Officer",
  ],
  "coast-guard": [
    "E-1 Seaman Recruit",
    "E-2 Seaman Apprentice",
    "E-3 Seaman",
    "E-4 Petty Officer Third Class",
    "E-5 Petty Officer Second Class",
    "E-6 Petty Officer First Class",
    "E-7 Chief Petty Officer",
    "E-8 Senior Chief Petty Officer",
    "E-9 Master Chief Petty Officer",
    "W-1 through W-5 Warrant Officer",
    "O-1 through O-10 Commissioned Officer",
  ],
};

export const DISCHARGE_TYPES = [
  "Honorable",
  "General (Under Honorable Conditions)",
  "Other Than Honorable",
  "Bad Conduct",
  "Dishonorable",
  "Entry-Level Separation",
  "Medical / Disability",
  "Still serving / Active duty",
] as const;

export const PUBLIC_SERVICE_TYPES = [
  {
    value: "police",
    label: "Police / Law enforcement",
    description: "Municipal, county, state, or tribal police service.",
  },
  {
    value: "fire",
    label: "Fire department",
    description: "Career, volunteer, wildland, or industrial fire service.",
  },
  {
    value: "federal-le",
    label: "Federal law enforcement",
    description: "FBI, DEA, ATF, CBP, USSS, and other federal agencies.",
  },
  {
    value: "ems",
    label: "EMS / Paramedic",
    description: "Emergency medical services in the field or transport.",
  },
  {
    value: "corrections",
    label: "Corrections / Detention",
    description: "Jail, prison, or detention officer service.",
  },
  {
    value: "other",
    label: "Other public service",
    description: "Search & rescue, dispatch, public works, or similar.",
  },
] as const;

export type PublicServiceType = (typeof PUBLIC_SERVICE_TYPES)[number]["value"];

export const POLICE_AGENCY_TYPES = [
  "Municipal police",
  "County sheriff",
  "State police / highway patrol",
  "Tribal police",
  "University / campus police",
  "Transit / port authority police",
  "Private security with POST certification",
] as const;

export const POLICE_STATUSES = ["Active duty", "Reserve / auxiliary", "Former / retired"] as const;

export const FIRE_DEPARTMENT_TYPES = [
  "Career municipal",
  "Volunteer",
  "Wildland / forestry",
  "Industrial / ARFF",
  "Federal (DoD / USFS)",
] as const;

export const FEDERAL_AGENCIES = [
  "FBI",
  "DEA",
  "ATF",
  "U.S. Marshals Service",
  "U.S. Secret Service",
  "CBP / Border Patrol",
  "ICE / HSI",
  "TSA",
  "Diplomatic Security Service",
  "NCIS",
  "OSI",
  "CGIS",
  "Other federal agency",
] as const;

export const CLEARANCE_LEVELS = [
  "None / expired",
  "Public Trust",
  "Secret",
  "Top Secret",
  "Top Secret / SCI",
] as const;

export const EMS_CERTIFICATIONS = [
  "EMR",
  "EMT-Basic",
  "EMT-Advanced",
  "Paramedic",
  "Flight paramedic / CCP",
  "Other state certification",
] as const;

export const FORM_SECTIONS = [
  { id: "eligibility", label: "Eligibility" },
  { id: "service", label: "Service record" },
  { id: "profile", label: "Your file" },
  { id: "application", label: "Application" },
] as const;
