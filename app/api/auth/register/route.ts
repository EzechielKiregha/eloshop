import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api-response";

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide").optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingPhone) {
      return fail(new Error("Ce numéro de téléphone est déjà utilisé"), 409);
    }

    // Check if email already exists
    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
      if (existingEmail) {
        return fail(new Error("Cet email est déjà utilisé"), 409);
      }
    }

    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email?.toLowerCase(),
        password: hashedPassword,
        role: "CUSTOMER",
      },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });

    return ok(user, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
