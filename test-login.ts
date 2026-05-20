import { authOptions } from "./src/lib/auth";
import fs from "fs";
import path from "path";

// Manually parse .env file to ensure correct credentials are in environment
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

async function main() {
  console.log("Connecting database and validating login...");
  const credentials = {
    email: "oninachisom20@gmail.com",
    password: "Password123!",
  };

  try {
    const provider = authOptions.providers.find(p => p.id === "credentials");
    if (!provider || !("authorize" in provider)) {
      throw new Error("Credentials provider not found");
    }

    console.log("Invoking NextAuth credentials authorize for:", credentials.email);
    const result = await provider.authorize(credentials, {} as any);
    console.log("Authorize result:", result);
  } catch (error) {
    console.error("Authorize function crashed! Error Details:", error);
  }
}

main();
