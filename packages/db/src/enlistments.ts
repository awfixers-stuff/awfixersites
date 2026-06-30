import { enlistFormSchema, type EnlistFormValues } from "@awfixersites/ui/enlist";

import { prisma } from "./prisma";

export type EnlistmentInput = EnlistFormValues;

export type SubmitEnlistmentArgs = {
  enlistment: EnlistmentInput;
  idpUserId: string;
};

export async function submitEnlistment({ enlistment, idpUserId }: SubmitEnlistmentArgs) {
  const parsed = enlistFormSchema.safeParse(enlistment);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid enlistment data.";
    throw new Error(message);
  }

  const data = parsed.data;
  const callsign = data.callsign.trim();
  const email = data.email.trim().toLowerCase();
  const message = data.message.trim();

  const record = await prisma.enlistment.create({
    data: {
      ...data,
      callsign,
      email,
      message,
      idpUserId,
      publicServiceTypes: [...data.publicServiceTypes],
    },
  });

  return { enlistmentId: record.id };
}
