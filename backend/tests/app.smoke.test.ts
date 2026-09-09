import request from "supertest";

import {
  describe,
  expect,
  it,
} from "vitest";

import app from "../src/app.js";

describe(
  "EKIP application smoke tests",
  () => {
    it(
      "returns a healthy liveness response",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/health"
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body
            .success
        ).toBe(true);

        expect(
          response.body
            .service
        ).toBe(
          "ekip-backend"
        );

        expect(
          response.body
            .status
        ).toBe(
          "alive"
        );

        expect(
          response.headers[
            "x-request-id"
          ]
        ).toBeTruthy();
      }
    );

    it(
      "does not expose Express through X-Powered-By",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/health"
            );

        expect(
          response.headers[
            "x-powered-by"
          ]
        ).toBeUndefined();
      }
    );

    it(
      "adds security headers",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/health"
            );

        expect(
          response.headers[
            "x-content-type-options"
          ]
        ).toBe(
          "nosniff"
        );
      }
    );

    it(
      "returns structured 404 responses",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/route-that-does-not-exist"
            );

        expect(
          response.status
        ).toBe(404);

        expect(
          response.body
            .message
        ).toBe(
          "API route not found"
        );

        expect(
          response.body
            .requestId
        ).toBeTruthy();
      }
    );

    it(
      "rejects disallowed browser origins",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/health"
            )
            .set(
              "Origin",
              "https://not-allowed.example"
            );

        expect(
          response.status
        ).toBe(403);

        expect(
          response.body
            .message
        ).toBe(
          "Origin is not allowed"
        );

        expect(
          response.body
            .requestId
        ).toBeTruthy();
      }
    );

    it(
      "accepts the configured frontend origin",
      async () => {
        const response =
          await request(app)
            .get(
              "/api/health"
            )
            .set(
              "Origin",
              "http://localhost:5173"
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.headers[
            "access-control-allow-origin"
          ]
        ).toBe(
          "http://localhost:5173"
        );
      }
    );
  }
);
