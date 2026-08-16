export type LogSeverity = "DEBUG" | "INFO" | "NOTICE" | "WARNING" | "ERROR" | "CRITICAL";

export interface StructuredLogFields {
  [key: string]: unknown;
}

const serviceName = process.env.K_SERVICE ?? "vitrion-web";
const revisionName = process.env.K_REVISION ?? process.env.NEXT_PUBLIC_COMMIT_SHA ?? "local";

export function logStructured(
  severity: LogSeverity,
  message: string,
  fields: StructuredLogFields = {}
) {
  const entry = {
    severity,
    message,
    service: serviceName,
    revision: revisionName,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);

  if (severity === "ERROR" || severity === "CRITICAL") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function measureLatency<T>(
  operation: string,
  callback: () => Promise<T>,
  fields: StructuredLogFields = {}
): Promise<T> {
  const startedAt = performance.now();

  try {
    const result = await callback();
    logStructured("INFO", `${operation} completed`, {
      operation,
      latencyMs: Math.round(performance.now() - startedAt),
      ...fields,
    });
    return result;
  } catch (error) {
    logStructured("ERROR", `${operation} failed`, {
      operation,
      latencyMs: Math.round(performance.now() - startedAt),
      error: errorMessage(error),
      ...fields,
    });
    throw error;
  }
}

