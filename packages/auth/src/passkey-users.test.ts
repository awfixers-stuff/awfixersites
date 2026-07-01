import { beforeEach, describe, expect, it, vi } from "vitest";

import { createUserForPasskeySignup, PasskeyUsernameTakenError } from "./passkey-users";

vi.mock("./prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    account: {
      create: vi.fn(),
    },
  },
}));

vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(async () => "hashed"),
}));

vi.mock("./snowflake", () => ({
  generateSnowflakeId: vi.fn().mockReturnValueOnce("1001").mockReturnValueOnce("1002"),
}));

import { prisma } from "./prisma";

describe("createUserForPasskeySignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when username already exists", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "existing" } as never);

    await expect(createUserForPasskeySignup("awfixer")).rejects.toBeInstanceOf(
      PasskeyUsernameTakenError,
    );
  });

  it("creates a new user when username is available", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "1001",
      username: "newuser",
      displayUsername: "newuser",
    } as never);
    vi.mocked(prisma.account.create).mockResolvedValue({} as never);

    const user = await createUserForPasskeySignup("newuser");

    expect(user).toEqual({
      id: "1001",
      username: "newuser",
      displayUsername: "newuser",
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "newuser",
          role: "user",
        }),
      }),
    );
  });
});
