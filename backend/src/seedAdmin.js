require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("./prisma");

async function main() {
  const email = "admin@example.com";
  const pass = "Admin123!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const hashed = await bcrypt.hash(pass, 10);
  await prisma.user.create({
    data: { email, password: hashed, role: "ADMIN", name: "Admin" },
  });

  console.log("Admin created:", { email, pass });
}

main().finally(async () => prisma.$disconnect());
