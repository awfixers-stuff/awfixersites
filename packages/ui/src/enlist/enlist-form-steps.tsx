"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@awfixersites/ui/components/field";
import { Input } from "@awfixersites/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@awfixersites/ui/components/select";
import { Textarea } from "@awfixersites/ui/components/textarea";

import {
  BRANCH_RANKS,
  CLEARANCE_LEVELS,
  DISCHARGE_TYPES,
  EMS_CERTIFICATIONS,
  FEDERAL_AGENCIES,
  FIRE_DEPARTMENT_TYPES,
  MILITARY_BRANCHES,
  POLICE_AGENCY_TYPES,
  POLICE_STATUSES,
  PUBLIC_SERVICE_TYPES,
  type MilitaryBranch,
  type PublicServiceType,
} from "./enlist-data";
import type { EnlistFormDraft } from "./enlist-schema";
import { getBranchLabel, getPublicServiceLabel } from "./enlist-schema";
import type { StepErrors } from "./enlist-flow";
import { ChoiceCard, YesNoChoice } from "@awfixersites/ui/components/choice-card";

type StepProps = {
  values: EnlistFormDraft;
  errors: StepErrors;
  onChange: <K extends keyof EnlistFormDraft>(key: K, value: EnlistFormDraft[K]) => void;
};

export function AgeStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.age}>
        <FieldLabel htmlFor="age" className="font-mono text-bleach">
          Your age
        </FieldLabel>
        <Input
          id="age"
          name="age"
          type="number"
          inputMode="numeric"
          min={16}
          max={80}
          placeholder="e.g. 24"
          value={values.age === "" ? "" : values.age}
          onChange={(event) => {
            const next = event.target.value;
            onChange("age", next === "" ? "" : Number.parseInt(next, 10));
          }}
          aria-invalid={!!errors.age}
          className="font-mono"
        />
        <FieldDescription>
          Must be 18 or older to file. Full standing opens at 19 — a junior division is in the works
          for younger applicants.
        </FieldDescription>
        <FieldError>{errors.age}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function ScreeningStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.isUsCitizen}>
        <FieldLabel className="font-mono text-bleach">Are you a U.S. citizen?</FieldLabel>
        <YesNoChoice
          value={values.isUsCitizen}
          onChange={(value) => onChange("isUsCitizen", value)}
          error={errors.isUsCitizen}
        />
      </Field>

      <Field data-invalid={!!errors.isSecondGeneration}>
        <FieldLabel className="font-mono text-bleach">
          Are you a second-generation American citizen?
        </FieldLabel>
        <FieldDescription>
          Both you and at least one parent must be U.S. citizens by birth or naturalization. Others
          may file as recruit with a sponsor.
        </FieldDescription>
        <YesNoChoice
          value={values.isSecondGeneration}
          onChange={(value) => onChange("isSecondGeneration", value)}
          error={errors.isSecondGeneration}
        />
      </Field>

      <Field data-invalid={!!errors.onRegistry}>
        <FieldLabel className="font-mono text-bleach">
          Are you on any registry (sex offender or similar)?
        </FieldLabel>
        <FieldDescription>
          Felony record alone does not bar you. Registry status does.
        </FieldDescription>
        <YesNoChoice
          value={values.onRegistry}
          onChange={(value) => onChange("onRegistry", value)}
          error={errors.onRegistry}
        />
      </Field>
    </FieldGroup>
  );
}

export function VeteranStep({ values, errors, onChange }: StepProps) {
  return (
    <YesNoChoice
      value={values.isVeteran}
      onChange={(value) => onChange("isVeteran", value)}
      yesLabel="Yes — I served"
      noLabel="No — no prior military service"
      error={errors.isVeteran}
    />
  );
}

export function BranchStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.branch}>
        <div className="grid gap-3 sm:grid-cols-2">
          {MILITARY_BRANCHES.map((branch) => (
            <ChoiceCard
              key={branch.value}
              selected={values.branch === branch.value}
              onSelect={() => onChange("branch", branch.value)}
              title={branch.label}
            />
          ))}
        </div>
        <FieldError>{errors.branch}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function BranchDetailsStep({ values, errors, onChange }: StepProps) {
  const branch = values.branch as MilitaryBranch;
  const specialtyLabel =
    MILITARY_BRANCHES.find((item) => item.value === branch)?.specialtyLabel ?? "Specialty code";
  const ranks = branch ? BRANCH_RANKS[branch] : [];

  return (
    <FieldGroup>
      <p className="font-mono text-[0.65rem] tracking-[0.14em] text-crimson uppercase">
        {getBranchLabel(values.branch)}
      </p>

      <Field data-invalid={!!errors.militaryRank}>
        <FieldLabel htmlFor="militaryRank" className="font-mono text-bleach">
          Rank at separation
        </FieldLabel>
        <Select
          value={values.militaryRank}
          onValueChange={(value) => onChange("militaryRank", value)}
        >
          <SelectTrigger
            id="militaryRank"
            className="w-full font-mono"
            aria-invalid={!!errors.militaryRank}
          >
            <SelectValue placeholder="Select rank" />
          </SelectTrigger>
          <SelectContent>
            {ranks.map((rank) => (
              <SelectItem key={rank} value={rank}>
                {rank}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.militaryRank}</FieldError>
      </Field>

      <Field data-invalid={!!errors.militaryUnit}>
        <FieldLabel htmlFor="militaryUnit" className="font-mono text-bleach">
          Last unit / command
        </FieldLabel>
        <Input
          id="militaryUnit"
          value={values.militaryUnit}
          onChange={(event) => onChange("militaryUnit", event.target.value)}
          placeholder="e.g. 1st Battalion, 8th Marines"
          aria-invalid={!!errors.militaryUnit}
          className="font-mono"
        />
        <FieldError>{errors.militaryUnit}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.militarySpecialty}>
          <FieldLabel htmlFor="militarySpecialty" className="font-mono text-bleach">
            {specialtyLabel}
          </FieldLabel>
          <Input
            id="militarySpecialty"
            value={values.militarySpecialty}
            onChange={(event) => onChange("militarySpecialty", event.target.value)}
            placeholder={
              branch === "marines"
                ? "e.g. 0311 Rifleman"
                : branch === "navy" || branch === "coast-guard"
                  ? "e.g. BM Boatswain's Mate"
                  : "e.g. 11B Infantryman"
            }
            aria-invalid={!!errors.militarySpecialty}
            className="font-mono"
          />
          <FieldError>{errors.militarySpecialty}</FieldError>
        </Field>

        <Field data-invalid={!!errors.yearsOfService}>
          <FieldLabel htmlFor="yearsOfService" className="font-mono text-bleach">
            Years of service
          </FieldLabel>
          <Input
            id="yearsOfService"
            value={values.yearsOfService}
            onChange={(event) => onChange("yearsOfService", event.target.value)}
            placeholder="e.g. 6"
            aria-invalid={!!errors.yearsOfService}
            className="font-mono"
          />
          <FieldError>{errors.yearsOfService}</FieldError>
        </Field>
      </div>

      <Field data-invalid={!!errors.dischargeType}>
        <FieldLabel htmlFor="dischargeType" className="font-mono text-bleach">
          Discharge characterization
        </FieldLabel>
        <Select
          value={values.dischargeType}
          onValueChange={(value) => onChange("dischargeType", value)}
        >
          <SelectTrigger
            id="dischargeType"
            className="w-full font-mono"
            aria-invalid={!!errors.dischargeType}
          >
            <SelectValue placeholder="Select discharge type" />
          </SelectTrigger>
          <SelectContent>
            {DISCHARGE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.dischargeType}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="combatDeployments" className="font-mono text-bleach">
          Combat deployments (optional)
        </FieldLabel>
        <Textarea
          id="combatDeployments"
          rows={3}
          value={values.combatDeployments}
          onChange={(event) => onChange("combatDeployments", event.target.value)}
          placeholder="Theater, dates, and role — if applicable."
        />
      </Field>
    </FieldGroup>
  );
}

export function PublicServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <YesNoChoice
      value={values.hasPublicService}
      onChange={(value) => onChange("hasPublicService", value)}
      yesLabel="Yes — I have public service experience"
      noLabel="No — none to report"
      error={errors.hasPublicService}
    />
  );
}

export function PublicServiceSelectStep({ values, errors, onChange }: StepProps) {
  function toggleType(type: PublicServiceType) {
    const current = values.publicServiceTypes;
    const next = current.includes(type)
      ? current.filter((item) => item !== type)
      : [...current, type];
    onChange("publicServiceTypes", next);
  }

  return (
    <FieldGroup>
      <Field data-invalid={!!errors.publicServiceTypes}>
        <div className="grid gap-3 sm:grid-cols-2">
          {PUBLIC_SERVICE_TYPES.map((type) => (
            <ChoiceCard
              key={type.value}
              selected={values.publicServiceTypes.includes(type.value)}
              onSelect={() => toggleType(type.value)}
              title={type.label}
              description={type.description}
            />
          ))}
        </div>
        <FieldError>{errors.publicServiceTypes}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function PoliceServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.policeAgencyType}>
        <FieldLabel className="font-mono text-bleach">Agency type</FieldLabel>
        <Select
          value={values.policeAgencyType}
          onValueChange={(value) => onChange("policeAgencyType", value)}
        >
          <SelectTrigger className="w-full font-mono" aria-invalid={!!errors.policeAgencyType}>
            <SelectValue placeholder="Select agency type" />
          </SelectTrigger>
          <SelectContent>
            {POLICE_AGENCY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.policeAgencyType}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.policeStatus}>
          <FieldLabel className="font-mono text-bleach">Duty status</FieldLabel>
          <Select
            value={values.policeStatus}
            onValueChange={(value) => onChange("policeStatus", value)}
          >
            <SelectTrigger className="w-full font-mono" aria-invalid={!!errors.policeStatus}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {POLICE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.policeStatus}</FieldError>
        </Field>

        <Field data-invalid={!!errors.policeYears}>
          <FieldLabel htmlFor="policeYears" className="font-mono text-bleach">
            Years of service
          </FieldLabel>
          <Input
            id="policeYears"
            value={values.policeYears}
            onChange={(event) => onChange("policeYears", event.target.value)}
            placeholder="e.g. 4"
            aria-invalid={!!errors.policeYears}
            className="font-mono"
          />
          <FieldError>{errors.policeYears}</FieldError>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="policeTraining" className="font-mono text-bleach">
          Academy / POST training (optional)
        </FieldLabel>
        <Input
          id="policeTraining"
          value={values.policeTraining}
          onChange={(event) => onChange("policeTraining", event.target.value)}
          placeholder="e.g. State POST academy, 2021"
          className="font-mono"
        />
      </Field>
    </FieldGroup>
  );
}

export function FireServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.fireDepartmentType}>
        <FieldLabel className="font-mono text-bleach">Department type</FieldLabel>
        <Select
          value={values.fireDepartmentType}
          onValueChange={(value) => onChange("fireDepartmentType", value)}
        >
          <SelectTrigger className="w-full font-mono" aria-invalid={!!errors.fireDepartmentType}>
            <SelectValue placeholder="Select department type" />
          </SelectTrigger>
          <SelectContent>
            {FIRE_DEPARTMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.fireDepartmentType}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.fireYears}>
          <FieldLabel htmlFor="fireYears" className="font-mono text-bleach">
            Years of service
          </FieldLabel>
          <Input
            id="fireYears"
            value={values.fireYears}
            onChange={(event) => onChange("fireYears", event.target.value)}
            placeholder="e.g. 8"
            aria-invalid={!!errors.fireYears}
            className="font-mono"
          />
          <FieldError>{errors.fireYears}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="fireCertifications" className="font-mono text-bleach">
            Certifications (optional)
          </FieldLabel>
          <Input
            id="fireCertifications"
            value={values.fireCertifications}
            onChange={(event) => onChange("fireCertifications", event.target.value)}
            placeholder="e.g. FF-I, EMT-B, Hazmat Ops"
            className="font-mono"
          />
        </Field>
      </div>
    </FieldGroup>
  );
}

export function FederalServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.federalAgency}>
        <FieldLabel className="font-mono text-bleach">Federal agency</FieldLabel>
        <Select
          value={values.federalAgency}
          onValueChange={(value) => onChange("federalAgency", value)}
        >
          <SelectTrigger className="w-full font-mono" aria-invalid={!!errors.federalAgency}>
            <SelectValue placeholder="Select agency" />
          </SelectTrigger>
          <SelectContent>
            {FEDERAL_AGENCIES.map((agency) => (
              <SelectItem key={agency} value={agency}>
                {agency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.federalAgency}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.federalYears}>
          <FieldLabel htmlFor="federalYears" className="font-mono text-bleach">
            Years of federal service
          </FieldLabel>
          <Input
            id="federalYears"
            value={values.federalYears}
            onChange={(event) => onChange("federalYears", event.target.value)}
            placeholder="e.g. 5"
            aria-invalid={!!errors.federalYears}
            className="font-mono"
          />
          <FieldError>{errors.federalYears}</FieldError>
        </Field>

        <Field data-invalid={!!errors.federalClearance}>
          <FieldLabel className="font-mono text-bleach">Clearance level</FieldLabel>
          <Select
            value={values.federalClearance}
            onValueChange={(value) => onChange("federalClearance", value)}
          >
            <SelectTrigger className="w-full font-mono" aria-invalid={!!errors.federalClearance}>
              <SelectValue placeholder="Select clearance" />
            </SelectTrigger>
            <SelectContent>
              {CLEARANCE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.federalClearance}</FieldError>
        </Field>
      </div>
    </FieldGroup>
  );
}

export function EmsServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.emsCertification}>
        <FieldLabel className="font-mono text-bleach">Certification level</FieldLabel>
        <Select
          value={values.emsCertification}
          onValueChange={(value) => onChange("emsCertification", value)}
        >
          <SelectTrigger className="w-full font-mono" aria-invalid={!!errors.emsCertification}>
            <SelectValue placeholder="Select certification" />
          </SelectTrigger>
          <SelectContent>
            {EMS_CERTIFICATIONS.map((cert) => (
              <SelectItem key={cert} value={cert}>
                {cert}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.emsCertification}</FieldError>
      </Field>

      <Field data-invalid={!!errors.emsYears}>
        <FieldLabel htmlFor="emsYears" className="font-mono text-bleach">
          Years of EMS experience
        </FieldLabel>
        <Input
          id="emsYears"
          value={values.emsYears}
          onChange={(event) => onChange("emsYears", event.target.value)}
          placeholder="e.g. 3"
          aria-invalid={!!errors.emsYears}
          className="font-mono"
        />
        <FieldError>{errors.emsYears}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function CorrectionsServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.correctionsAgency}>
        <FieldLabel htmlFor="correctionsAgency" className="font-mono text-bleach">
          Agency / facility
        </FieldLabel>
        <Input
          id="correctionsAgency"
          value={values.correctionsAgency}
          onChange={(event) => onChange("correctionsAgency", event.target.value)}
          placeholder="e.g. County detention center"
          aria-invalid={!!errors.correctionsAgency}
          className="font-mono"
        />
        <FieldError>{errors.correctionsAgency}</FieldError>
      </Field>

      <Field data-invalid={!!errors.correctionsYears}>
        <FieldLabel htmlFor="correctionsYears" className="font-mono text-bleach">
          Years of service
        </FieldLabel>
        <Input
          id="correctionsYears"
          value={values.correctionsYears}
          onChange={(event) => onChange("correctionsYears", event.target.value)}
          placeholder="e.g. 2"
          aria-invalid={!!errors.correctionsYears}
          className="font-mono"
        />
        <FieldError>{errors.correctionsYears}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function OtherPublicServiceStep({ values, errors, onChange }: StepProps) {
  return (
    <Field data-invalid={!!errors.otherPublicService}>
      <FieldLabel htmlFor="otherPublicService" className="font-mono text-bleach">
        Describe your public service
      </FieldLabel>
      <Textarea
        id="otherPublicService"
        rows={4}
        value={values.otherPublicService}
        onChange={(event) => onChange("otherPublicService", event.target.value)}
        placeholder="Role, agency, years served, and relevant certifications."
        aria-invalid={!!errors.otherPublicService}
      />
      <FieldError>{errors.otherPublicService}</FieldError>
    </Field>
  );
}

export function ProfileStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.callsign}>
        <FieldLabel htmlFor="callsign" className="font-mono text-bleach">
          Callsign
        </FieldLabel>
        <Input
          id="callsign"
          autoComplete="nickname"
          placeholder="your-callsign"
          value={values.callsign}
          onChange={(event) => onChange("callsign", event.target.value)}
          aria-invalid={!!errors.callsign}
          className="font-mono"
        />
        <FieldDescription>How the unit addresses you in the field.</FieldDescription>
        <FieldError>{errors.callsign}</FieldError>
      </Field>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email" className="font-mono text-bleach">
          Email
        </FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          aria-invalid={!!errors.email}
        />
        <FieldError>{errors.email}</FieldError>
      </Field>

      <Field data-invalid={!!errors.state}>
        <FieldLabel htmlFor="state" className="font-mono text-bleach">
          State of residence
        </FieldLabel>
        <Input
          id="state"
          autoComplete="address-level1"
          placeholder="e.g. Texas"
          value={values.state}
          onChange={(event) => onChange("state", event.target.value)}
          aria-invalid={!!errors.state}
        />
        <FieldDescription>We operate as a U.S.-based legal militia.</FieldDescription>
        <FieldError>{errors.state}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function ApplicationStep({ values, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.specialty}>
          <FieldLabel htmlFor="specialty" className="font-mono text-bleach">
            Primary specialty
          </FieldLabel>
          <Select value={values.specialty} onValueChange={(value) => onChange("specialty", value)}>
            <SelectTrigger
              id="specialty"
              className="w-full font-mono"
              aria-invalid={!!errors.specialty}
            >
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="security">Security / defense</SelectItem>
              <SelectItem value="medical">Medical / first aid</SelectItem>
              <SelectItem value="logistics">Logistics / transport</SelectItem>
              <SelectItem value="communications">Communications</SelectItem>
              <SelectItem value="intelligence">Intelligence / recon</SelectItem>
              <SelectItem value="general">General infantry</SelectItem>
            </SelectContent>
          </Select>
          <FieldError>{errors.specialty}</FieldError>
        </Field>

        <Field data-invalid={!!errors.rank}>
          <FieldLabel htmlFor="rank" className="font-mono text-bleach">
            Applying for
          </FieldLabel>
          <Select value={values.rank} onValueChange={(value) => onChange("rank", value)}>
            <SelectTrigger id="rank" className="w-full font-mono" aria-invalid={!!errors.rank}>
              <SelectValue placeholder="Choose a rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enlisty">Enlisty</SelectItem>
              <SelectItem value="recruit">Recruit</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            {values.isSecondGeneration === false
              ? "Non second-generation citizens typically file as recruit."
              : "Enlisty is the public form track."}
          </FieldDescription>
          <FieldError>{errors.rank}</FieldError>
        </Field>
      </div>

      <Field data-invalid={!!errors.message}>
        <FieldLabel htmlFor="message" className="font-mono text-bleach">
          Why enlist?
        </FieldLabel>
        <Textarea
          id="message"
          rows={5}
          placeholder="Who are you willing to stand for, what can you bring to the unit, and why now?"
          value={values.message}
          onChange={(event) => onChange("message", event.target.value)}
          aria-invalid={!!errors.message}
        />
        <FieldError>{errors.message}</FieldError>
      </Field>
    </FieldGroup>
  );
}

export function ReviewStep({ values }: { values: EnlistFormDraft }) {
  const sections: Array<{ label: string; items: Array<{ term: string; detail: string }> }> = [
    {
      label: "Eligibility",
      items: [
        { term: "Age", detail: values.age === "" ? "—" : String(values.age) },
        {
          term: "U.S. citizen",
          detail: values.isUsCitizen === null ? "—" : values.isUsCitizen ? "Yes" : "No",
        },
        {
          term: "Second-generation",
          detail:
            values.isSecondGeneration === null ? "—" : values.isSecondGeneration ? "Yes" : "No",
        },
        {
          term: "On registry",
          detail: values.onRegistry === null ? "—" : values.onRegistry ? "Yes" : "No",
        },
      ],
    },
  ];

  if (values.isVeteran) {
    sections.push({
      label: "Military service",
      items: [
        { term: "Branch", detail: getBranchLabel(values.branch) },
        { term: "Rank", detail: values.militaryRank || "—" },
        { term: "Unit", detail: values.militaryUnit || "—" },
        { term: "Specialty", detail: values.militarySpecialty || "—" },
        { term: "Years", detail: values.yearsOfService || "—" },
        { term: "Discharge", detail: values.dischargeType || "—" },
        ...(values.combatDeployments
          ? [{ term: "Deployments", detail: values.combatDeployments }]
          : []),
      ],
    });
  }

  if (values.hasPublicService && values.publicServiceTypes.length > 0) {
    sections.push({
      label: "Public service",
      items: values.publicServiceTypes.map((type) => ({
        term: getPublicServiceLabel(type),
        detail: "Filed",
      })),
    });
  }

  sections.push(
    {
      label: "Contact",
      items: [
        { term: "Callsign", detail: values.callsign || "—" },
        { term: "Email", detail: values.email || "—" },
        { term: "State", detail: values.state || "—" },
      ],
    },
    {
      label: "Application",
      items: [
        { term: "Specialty", detail: values.specialty || "—" },
        { term: "Rank track", detail: values.rank || "—" },
        { term: "Statement", detail: values.message || "—" },
      ],
    },
  );

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.label} className="border border-border/40 p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-crimson uppercase">
            {section.label}
          </p>
          <dl className="mt-3 space-y-2">
            {section.items.map((item) => (
              <div
                key={`${section.label}-${item.term}`}
                className="grid gap-1 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="font-mono text-xs text-muted-foreground">{item.term}</dt>
                <dd className="text-sm text-bleach/90">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
