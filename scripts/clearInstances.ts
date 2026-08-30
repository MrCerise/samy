import prisma from "../src/libs/prisma";

async function main() {
  const count = await prisma.afk.count();

  if (count === 0) {
    console.log("No AFK instances to clear.");
    return; // Very useful line again :3
  }

  await prisma.afk.deleteMany({});

  console.log(`Cleared ${count} AFK instance(s) from the database.`);
}

main()
  .catch((err) => {
    console.error("Failed to clear instances:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
