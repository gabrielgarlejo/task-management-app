import { NextResponse } from "next/server";
import { z } from "zod";

type ApiError = { error: string };

export function errorResponse(message: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function handleZodError(error: unknown): NextResponse<ApiError> {
  if (error instanceof z.ZodError) {
    return errorResponse(error.issues[0].message, 400);
  }
  return errorResponse("Invalid request", 400);
}

export function handleGenericError(error: unknown): NextResponse<ApiError> {
  console.error(error);
  return errorResponse("Internal server error", 500);
}