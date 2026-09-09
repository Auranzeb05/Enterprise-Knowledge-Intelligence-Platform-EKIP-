const API_URL =
  (
    process.env
      .EKIP_API_URL ||
    "http://localhost:4000"
  ).replace(
    /\/+$/,
    ""
  );

const FRONTEND_URL =
  process.env
    .EKIP_FRONTEND_URL
    ?.replace(
      /\/+$/,
      ""
    );

async function fetchWithTimeout(
  url,
  timeoutMs =
    10000
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      timeoutMs
    );

  try {
    return await fetch(
      url,
      {
        signal:
          controller.signal,
      }
    );
  } finally {
    clearTimeout(
      timeout
    );
  }
}

async function verifyJsonEndpoint(
  path,
  expectedStatus
) {
  const url =
    `${API_URL}${path}`;

  const response =
    await fetchWithTimeout(
      url
    );

  const body =
    await response
      .json()
      .catch(
        () => null
      );

  if (
    response.status !==
    expectedStatus
  ) {
    throw new Error(
      `${path} returned HTTP ${response.status}`
    );
  }

  console.log(
    `PASS ${path}`,
    body
  );

  return body;
}

async function verifyFrontend() {
  if (!FRONTEND_URL) {
    console.log(
      "SKIP frontend check: EKIP_FRONTEND_URL is not set"
    );

    return;
  }

  const response =
    await fetchWithTimeout(
      FRONTEND_URL
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Frontend returned HTTP ${response.status}`
    );
  }

  console.log(
    `PASS frontend ${FRONTEND_URL}`
  );
}

async function main() {
  console.log(
    `Verifying EKIP API at ${API_URL}`
  );

  const health =
    await verifyJsonEndpoint(
      "/api/health",
      200
    );

  if (
    health?.status !==
    "alive"
  ) {
    throw new Error(
      "Health endpoint did not report alive"
    );
  }

  const readiness =
    await verifyJsonEndpoint(
      "/api/ready",
      200
    );

  if (
    readiness?.status !==
      "ready" ||
    readiness?.checks
      ?.database !==
      "ok" ||
    readiness?.checks
      ?.ollama !==
      "ok"
  ) {
    throw new Error(
      "Readiness checks did not pass"
    );
  }

  await verifyFrontend();

  console.log(
    "EKIP runtime verification passed."
  );
}

main().catch(
  (error) => {
    console.error(
      "EKIP runtime verification failed:",
      error
    );

    process.exitCode =
      1;
  }
);
