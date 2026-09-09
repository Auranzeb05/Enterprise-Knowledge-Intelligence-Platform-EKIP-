import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  authenticate,
} from "../src/middleware/authenticate.js";

function createResponse() {
  const response = {
    statusCode:
      200,

    body:
      undefined as unknown,

    locals:
      {},

    status(
      code: number
    ) {
      this.statusCode =
        code;

      return this;
    },

    json(
      body: unknown
    ) {
      this.body =
        body;

      return this;
    },
  };

  return response;
}

describe(
  "authenticate middleware",
  () => {
    it(
      "rejects requests without an Authorization header",
      async () => {
        const req = {
          headers: {},
        } as Request;

        const res =
          createResponse();

        const next =
          vi.fn();

        await authenticate(
          req,
          res as unknown as
            Response,
          next as NextFunction
        );

        expect(
          res.statusCode
        ).toBe(401);

        expect(
          res.body
        ).toEqual({
          success:
            false,

          message:
            "Missing or invalid authorization header",
        });

        expect(
          next
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects malformed Authorization headers",
      async () => {
        const req = {
          headers: {
            authorization:
              "Basic invalid",
          },
        } as Request;

        const res =
          createResponse();

        const next =
          vi.fn();

        await authenticate(
          req,
          res as unknown as
            Response,
          next as NextFunction
        );

        expect(
          res.statusCode
        ).toBe(401);

        expect(
          next
        ).not.toHaveBeenCalled();
      }
    );
  }
);
