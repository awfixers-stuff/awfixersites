import { getAdminUsernames } from "../src/account-setup";
import { idpPrisma } from "../src/idp-prisma";

async function main() {
  const usernames = [...getAdminUsernames()];
  if (usernames.length === 0) {
    console.log("AUTH_ADMIN_USERNAMES is empty; nothing to promote.");
    return;
  }

  for (const username of usernames) {
    const user = await idpPrisma.user.findFirst({
      where: { username },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      console.log(`skip: ${username} (account does not exist yet)`);
      continue;
    }

    if (user.role === "admin") {
      console.log(`ok: ${username} (already admin)`);
      continue;
    }

    await idpPrisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });
    console.log(`promoted: ${username}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
