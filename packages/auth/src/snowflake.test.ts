import { afterEach, describe, expect, it } from "vitest";

import { generateSnowflakeId, isSnowflakeId, resetSnowflakeGeneratorForTests } from "./snowflake";

describe("generateSnowflakeId", () => {
  const previousWorkerId = process.env.AUTH_SNOWFLAKE_WORKER_ID;

  afterEach(() => {
    resetSnowflakeGeneratorForTests();
    if (previousWorkerId === undefined) {
      delete process.env.AUTH_SNOWFLAKE_WORKER_ID;
    } else {
      process.env.AUTH_SNOWFLAKE_WORKER_ID = previousWorkerId;
    }
  });

  it("returns decimal string snowflake ids", () => {
    const id = generateSnowflakeId();
    expect(isSnowflakeId(id)).toBe(true);
  });

  it("generates monotonically increasing ids within a process", () => {
    const first = generateSnowflakeId();
    const second = generateSnowflakeId();
    expect(BigInt(second) > BigInt(first)).toBe(true);
  });

  it("generates unique ids in a burst", () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateSnowflakeId()));
    expect(ids.size).toBe(500);
  });

  it("rejects out-of-range worker ids", () => {
    process.env.AUTH_SNOWFLAKE_WORKER_ID = "1024";
    expect(() => generateSnowflakeId()).toThrow(/AUTH_SNOWFLAKE_WORKER_ID/);
  });
});

describe("isSnowflakeId", () => {
  it("rejects uuid-shaped values", () => {
    expect(isSnowflakeId("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
  });
});
