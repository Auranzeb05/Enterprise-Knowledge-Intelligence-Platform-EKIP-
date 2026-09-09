import request from "supertest";

import {
  describe,
  expect,
  it,
} from "vitest";

import app from "../src/app.js";

interface ProtectedRoute {
  method:
    | "get"
    | "post";

  path:
    string;
}

const protectedRoutes:
  ProtectedRoute[] = [
    {
      method:
        "get",
      path:
        "/api/me",
    },
    {
      method:
        "get",
      path:
        "/api/admin/dashboard",
    },
    {
      method:
        "get",
      path:
        "/api/departments",
    },
    {
      method:
        "get",
      path:
        "/api/manager/dashboard",
    },
    {
      method:
        "get",
      path:
        "/api/employee/dashboard",
    },
    {
      method:
        "get",
      path:
        "/api/chat/conversations",
    },
    {
      method:
        "post",
      path:
        "/api/chat",
    },
    {
      method:
        "get",
      path:
        "/api/documents",
    },
    {
      method:
        "get",
      path:
        "/api/search?q=test",
    },
  ];

describe(
  "protected EKIP routes",
  () => {
    for (
      const route of
      protectedRoutes
    ) {
      it(
        `${route.method.toUpperCase()} ${route.path} requires authentication`,
        async () => {
          const agent =
            request(app);

          const response =
            route.method ===
            "get"
              ? await agent
                  .get(
                    route.path
                  )
              : await agent
                  .post(
                    route.path
                  )
                  .send({
                    message:
                      "test",
                  });

          expect(
            response.status
          ).toBe(401);

          expect(
            response.body
              .success
          ).toBe(false);
        }
      );
    }
  }
);
