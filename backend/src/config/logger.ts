interface LogFields {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined;
}

function writeLog(
  level:
    | "info"
    | "warn"
    | "error",
  type: string,
  fields: LogFields = {}
) {
  const payload = {
    level,
    type,
    timestamp:
      new Date()
        .toISOString(),
    ...fields,
  };

  const serialized =
    JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

export function logInfo(
  type: string,
  fields?: LogFields
) {
  writeLog(
    "info",
    type,
    fields
  );
}

export function logWarn(
  type: string,
  fields?: LogFields
) {
  writeLog(
    "warn",
    type,
    fields
  );
}

export function logError(
  type: string,
  error?: unknown,
  fields: LogFields = {}
) {
  writeLog(
    "error",
    type,
    {
      ...fields,

      error:
        error instanceof Error
          ? error.message
          : error
            ? String(error)
            : undefined,
    }
  );
}
