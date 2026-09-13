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

const demoEmails = [
  env.DEMO_EMPLOYEE_EMAIL,
  env.DEMO_MANAGER_EMAIL,
  env.DEMO_ADMIN_EMAIL,
]
  .filter(
    (email): email is string =>
      Boolean(email)
  )
  .map(
    (email) =>
      email.toLowerCase()
  );

async function main() {
  if (
    demoEmails.length === 0
  ) {
    console.log(
      "No demo accounts are configured."
    );
    return;
  }

  for (
    const email of
    demoEmails
  ) {
    const user =
      await prisma.user
        .findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            supabaseUserId:
              true,
            email: true,
          },
        });

    if (
      !user
    ) {
      continue;
    }

    await prisma.user
      .delete({
        where: {
          id:
            user.id,
        },
      });

    const {
      error,
    } =
      await supabaseAdmin
        .auth
        .admin
        .deleteUser(
          user.supabaseUserId
        );

    if (
      error
    ) {
      console.warn(
        `Database demo user removed, but Supabase cleanup failed for ${email}: ${error.message}`
      );
    }
  }

  console.log(
    "EKIP demo accounts were removed."
  );
}

main()
  .catch(
    (error) => {
      console.error(
        "Demo account cleanup failed:"
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
