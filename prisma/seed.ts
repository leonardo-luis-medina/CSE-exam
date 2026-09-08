import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "leonardo.luis.medina99@gmail.com"; // change this
  const plainPassword = "leo-password"; // change this

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
    },
  });

  console.log("Admin account ready:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });