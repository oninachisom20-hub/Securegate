import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (e) {
    console.error("Failed to load .env file manually:", e);
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  console.log("Listing all users from Supabase...");
  try {
    const users = await prisma.user.findMany();
    console.log(`Total users found: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`[User ${index + 1}] ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, HasPassword: ${!!user.password}`);
    });
  } catch (error) {
    console.error("Failed to query users table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
