import { NextResponse } from "next-response";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/schemas/auth.schema";
import { NextResponse as NextResp } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod validation
    const validatedFields = RegisterSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResp.json(
        { error: "Invalid fields" },
        { status: 400 }
      );
    }

    const { email, password, name } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResp.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // bcrypt salt rounds = 12 as per master prompt
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // We do not return the password, even hashed
    return NextResp.json({ 
      success: true,
      message: "User created successfully. Please verify your email.",
      userId: user.id 
    });

  } catch (error) {
    // Generic error to prevent leaking stack traces
    return NextResp.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
