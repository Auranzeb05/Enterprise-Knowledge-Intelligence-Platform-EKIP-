import "dotenv/config";

import {
  prisma,
} from "./config/prisma.js";

import {
  env,
} from "./config/env.js";

import {
  supabaseAdmin,
} from "./config/supabaseAdmin.js";

type DemoRole =
  | "admin"
  | "manager"
  | "employee";

type DemoAccount = {
  role: DemoRole;
  email: string;
  password: string;
  fullName: string;
};

function requireDemoValue(
  value: string | undefined,
  name: string
) {
  if (
    !value
  ) {
    throw new Error(
      `Missing ${name}`
    );
  }

  return value;
}

const accounts: DemoAccount[] = [
  {
    role:
      "admin",
    email:
      requireDemoValue(
        env.DEMO_ADMIN_EMAIL,
        "DEMO_ADMIN_EMAIL"
      ).toLowerCase(),
    password:
      requireDemoValue(
        env.DEMO_ADMIN_PASSWORD,
        "DEMO_ADMIN_PASSWORD"
      ),
    fullName:
      "Demo Administrator",
  },
  {
    role:
      "manager",
    email:
      requireDemoValue(
        env.DEMO_MANAGER_EMAIL,
        "DEMO_MANAGER_EMAIL"
      ).toLowerCase(),
    password:
      requireDemoValue(
        env.DEMO_MANAGER_PASSWORD,
        "DEMO_MANAGER_PASSWORD"
      ),
    fullName:
      "Demo Manager",
  },
  {
    role:
      "employee",
    email:
      requireDemoValue(
        env.DEMO_EMPLOYEE_EMAIL,
        "DEMO_EMPLOYEE_EMAIL"
      ).toLowerCase(),
    password:
      requireDemoValue(
        env.DEMO_EMPLOYEE_PASSWORD,
        "DEMO_EMPLOYEE_PASSWORD"
      ),
    fullName:
      "Demo Employee",
  },
];

async function resolveExistingAuthUser(
  email: string
) {
  const existingDbUser =
    await prisma.user
      .findUnique({
        where: {
          email,
        },
        select: {
          supabaseUserId:
            true,
        },
      });

  if (
    existingDbUser
  ) {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .auth
        .admin
        .getUserById(
          existingDbUser
            .supabaseUserId
        );

    if (
      !error &&
      data.user
    ) {
      return data.user;
    }
  }

  let page = 1;

  while (
    page <= 10
  ) {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .auth
        .admin
        .listUsers({
          page,
          perPage:
            1000,
        });

    if (
      error
    ) {
      throw error;
    }

    const match =
      data.users.find(
        (user) =>
          user.email
            ?.toLowerCase() ===
          email
      );

    if (
      match
    ) {
      return match;
    }

    if (
      data.users.length <
      1000
    ) {
      break;
    }

    page += 1;
  }

  return null;
}

async function ensureAuthUser(
  account: DemoAccount
) {
  const existing =
    await resolveExistingAuthUser(
      account.email
    );

  if (
    existing
  ) {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .auth
        .admin
        .updateUserById(
          existing.id,
          {
            email:
              account.email,
            password:
              account.password,
            email_confirm:
              true,
          }
        );

    if (
      error ||
      !data.user
    ) {
      throw (
        error ||
        new Error(
          `Failed to update ${account.role} demo auth user`
        )
      );
    }

    return data.user;
  }

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .auth
      .admin
      .createUser({
        email:
          account.email,
        password:
          account.password,
        email_confirm:
          true,
      });

  if (
    error ||
    !data.user
  ) {
    throw (
      error ||
      new Error(
        `Failed to create ${account.role} demo auth user`
      )
    );
  }

  return data.user;
}

async function chooseDemoDepartment() {
  const departments =
    await prisma.department
      .findMany({
        include: {
          _count: {
            select: {
              documents:
                true,
            },
          },
        },
        orderBy: {
          name:
            "asc",
        },
      });

  if (
    departments.length === 0
  ) {
    return prisma.department
      .create({
        data: {
          name:
            "Demo Department",
        },
      });
  }

  const rankedDepartments =
    departments
      .slice()
      .sort(
        (left, right) =>
          right._count
            .documents -
          left._count
            .documents
      );

  const selectedDepartment =
    rankedDepartments[0];

  if (
    !selectedDepartment
  ) {
    throw new Error(
      "Unable to resolve a demo department"
    );
  }

  return selectedDepartment;
}

async function main() {
  if (
    !env.DEMO_MODE_ENABLED
  ) {
    throw new Error(
      "DEMO_MODE_ENABLED must be true before running demo:setup"
    );
  }

  for (
    const account of
    accounts
  ) {
    if (
      account.password.length <
      12
    ) {
      throw new Error(
        `${account.role} demo password must be at least 12 characters`
      );
    }
  }

  const department =
    await chooseDemoDepartment();

  const adminAccount =
    accounts.find(
      (account) =>
        account.role ===
        "admin"
    )!;

  const managerAccount =
    accounts.find(
      (account) =>
        account.role ===
        "manager"
    )!;

  const employeeAccount =
    accounts.find(
      (account) =>
        account.role ===
        "employee"
    )!;

  const adminAuthUser =
    await ensureAuthUser(
      adminAccount
    );

  await prisma.user
    .upsert({
      where: {
        email:
          adminAccount.email,
      },
      update: {
        supabaseUserId:
          adminAuthUser.id,
        fullName:
          adminAccount.fullName,
        role:
          "admin",
        status:
          "active",
        departmentId:
          null,
        managerId:
          null,
      },
      create: {
        supabaseUserId:
          adminAuthUser.id,
        email:
          adminAccount.email,
        fullName:
          adminAccount.fullName,
        role:
          "admin",
        status:
          "active",
        departmentId:
          null,
        managerId:
          null,
      },
    });

  const managerAuthUser =
    await ensureAuthUser(
      managerAccount
    );

  const manager =
    await prisma.user
      .upsert({
        where: {
          email:
            managerAccount.email,
        },
        update: {
          supabaseUserId:
            managerAuthUser.id,
          fullName:
            managerAccount.fullName,
          role:
            "manager",
          status:
            "active",
          departmentId:
            department.id,
          managerId:
            null,
        },
        create: {
          supabaseUserId:
            managerAuthUser.id,
          email:
            managerAccount.email,
          fullName:
            managerAccount.fullName,
          role:
            "manager",
          status:
            "active",
          departmentId:
            department.id,
          managerId:
            null,
        },
      });

  const employeeAuthUser =
    await ensureAuthUser(
      employeeAccount
    );

  await prisma.user
    .upsert({
      where: {
        email:
          employeeAccount.email,
      },
      update: {
        supabaseUserId:
          employeeAuthUser.id,
        fullName:
          employeeAccount.fullName,
        role:
          "employee",
        status:
          "active",
        departmentId:
          department.id,
        managerId:
          manager.id,
      },
      create: {
        supabaseUserId:
          employeeAuthUser.id,
        email:
          employeeAccount.email,
        fullName:
          employeeAccount.fullName,
        role:
          "employee",
        status:
          "active",
        departmentId:
          department.id,
        managerId:
          manager.id,
      },
    });

  console.log(
    "EKIP demo accounts are ready."
  );
  console.log(
    `Demo department: ${department.name}`
  );
  console.log(
    "Admin demo: configured"
  );
  console.log(
    "Manager demo: configured"
  );
  console.log(
    "Employee demo: configured"
  );
}

main()
  .catch(
    (error) => {
      console.error(
        "Demo account setup failed:"
      );
      console.error(
        error
      );
      process.exit(1);
    }
  )
  .finally(
    async () => {
      await prisma
        .$disconnect();
    }
  );
