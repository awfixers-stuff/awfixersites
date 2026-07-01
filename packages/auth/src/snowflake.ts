const EPOCH_MS = 1_609_459_200_000n; // 2021-01-01T00:00:00.000Z
const WORKER_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;
const MAX_WORKER_ID = (1n << WORKER_ID_BITS) - 1n;
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n;
const WORKER_ID_SHIFT = SEQUENCE_BITS;
const TIMESTAMP_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;

let sequence = 0n;
let lastTimestamp = -1n;

function getWorkerId(): bigint {
  const raw = process.env.AUTH_SNOWFLAKE_WORKER_ID;
  if (!raw) return 0n;

  const parsed = BigInt(raw);
  if (parsed < 0n || parsed > MAX_WORKER_ID) {
    throw new Error(`AUTH_SNOWFLAKE_WORKER_ID must be between 0 and ${MAX_WORKER_ID}.`);
  }
  return parsed;
}

function currentTimestamp(): bigint {
  return BigInt(Date.now()) - EPOCH_MS;
}

function waitForNextMillis(timestamp: bigint): bigint {
  let next = currentTimestamp();
  while (next <= timestamp) {
    next = currentTimestamp();
  }
  return next;
}

export function generateSnowflakeId(): string {
  const workerId = getWorkerId();
  let timestamp = currentTimestamp();

  if (timestamp < lastTimestamp) {
    timestamp = waitForNextMillis(lastTimestamp);
  }

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & MAX_SEQUENCE;
    if (sequence === 0n) {
      timestamp = waitForNextMillis(lastTimestamp);
    }
  } else {
    sequence = 0n;
  }

  lastTimestamp = timestamp;

  const id = (timestamp << TIMESTAMP_SHIFT) | (workerId << WORKER_ID_SHIFT) | sequence;

  return id.toString();
}

const SNOWFLAKE_ID_PATTERN = /^\d{15,20}$/;

export function isSnowflakeId(value: string): boolean {
  return SNOWFLAKE_ID_PATTERN.test(value);
}

/** @internal Reset generator state between tests. */
export function resetSnowflakeGeneratorForTests() {
  sequence = 0n;
  lastTimestamp = -1n;
}
