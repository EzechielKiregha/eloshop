import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number) {
  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export function fail(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Données invalides", details: error.flatten() },
      { status: 422 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ error: "Erreur inattendue" }, { status: 500 });
}

export function notFound(message = "Ressource introuvable") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function unauthorized(message = "Non autorisé") {
  return NextResponse.json({ error: message }, { status: 401 });
}
