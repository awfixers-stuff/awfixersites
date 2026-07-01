import { rejectBotUnlessHuman } from "@awfixersites/auth/botid-server";
import { z } from "zod";
import { Resend } from "resend";

const tipSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  handle: z
    .string()
    .trim()
    .max(100, "Handle must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  tip: z
    .string()
    .trim()
    .min(10, "Tip must be at least 10 characters")
    .max(5000, "Tip must be less than 5000 characters")
    .refine(
      (val) => val.split(/\s+/).filter((w) => w.length > 0).length >= 10,
      "Tip must contain at least 10 words",
    ),
});

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const blocked = await rejectBotUnlessHuman();
  if (blocked) {
    return blocked;
  }

  try {
    const body = (await request.json()) as {
      name?: string;
      handle?: string;
      tip?: string;
    };

    const validatedData = tipSchema.parse({
      name: sanitizeInput(body.name || ""),
      handle: sanitizeInput(body.handle || ""),
      tip: sanitizeInput(body.tip || ""),
    });

    const emailContent = `
New Tip Submission

Name: ${validatedData.name}
${validatedData.handle ? `X Handle: ${validatedData.handle}` : ""}

Tip:
${validatedData.tip}
    `.trim();

    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return Response.json({ error: "Email service is not configured" }, { status: 503 });
    }

    const resend = new Resend(apiKey);

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "noreply@updates.awfixer.me",
      to: "tips@updates.awfixer.me",
      subject: `New Tip from ${validatedData.name}`,
      text: emailContent,
      html: `
        <div style="font-family: monospace; line-height: 1.6; color: #333;">
          <h2 style="margin-top: 0;">New Tip Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(validatedData.name)}</p>
          ${validatedData.handle ? `<p><strong>X Handle:</strong> ${escapeHtml(validatedData.handle)}</p>` : ""}
          <h3>Tip:</h3>
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">${escapeHtml(validatedData.tip)}</pre>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend error:", sendError);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    if (!sendData?.id) {
      console.error("Resend returned no email id");
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ success: true, message: "Tip submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Submit tip error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "An error occurred while processing your submission" },
      { status: 500 },
    );
  }
}
