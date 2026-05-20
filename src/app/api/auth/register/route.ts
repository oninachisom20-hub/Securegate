import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schemas/auth.schema";
import { NextResponse } from "next/server";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await rateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    
    // Zod validation
    const validatedFields = RegisterSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields" },
        { status: 400 }
      );
    }

    const { email, password, name } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // bcrypt salt rounds = 12 as per master prompt
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    try {
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
      console.log(`Verification email successfully sent to ${email}`);
    } catch (err) {
      console.error("Failed to send verification email:", err);
      // Email sending is non-blocking; account is still created
    }

    // We do not return the password, even hashed
    return NextResponse.json({ 
      success: true,
      message: "User created successfully. Please verify your email.",
    });

  } catch (error) {
    console.error("REGISTER_API_ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
