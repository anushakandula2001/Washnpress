import { NextResponse } from "next/server";

export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[api] Unhandled server error:", error);
      return serverError(error instanceof Error ? error.message : "Internal server error");
    }
  };
}

interface ApiSuccess<T> {
  success: true;
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiError {
  success: false;
  status: number;
  message: string;
  errors?: unknown;
  timestamp: string;
}

function timestamp() {
  return new Date().toISOString();
}

export function ok<T>(
  data: T,
  message = "Request successful",
  status = 200,
) {
  const body: ApiSuccess<T> = {
    success: true,
    status,
    message,
    data,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status });
}

export function created<T>(
  data: T,
  message = "Resource created successfully",
) {
  const body: ApiSuccess<T> = {
    success: true,
    status: 201,
    message,
    data,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 201 });
}

export function badRequest(
  message = "Bad Request",
  errors?: unknown,
) {
  const body: ApiError = {
    success: false,
    status: 400,
    message,
    errors,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 400 });
}

export function unauthorized(
  message = "Unauthorized",
) {
  const body: ApiError = {
    success: false,
    status: 401,
    message,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 401 });
}

export function forbidden(
  message = "Forbidden",
) {
  const body: ApiError = {
    success: false,
    status: 403,
    message,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 403 });
}

export function notFound(
  message = "Resource not found",
) {
  const body: ApiError = {
    success: false,
    status: 404,
    message,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 404 });
}

export function unprocessable(
  message = "Validation failed",
  errors?: unknown,
) {
  const body: ApiError = {
    success: false,
    status: 422,
    message,
    errors,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 422 });
}

export function serverError(
  message = "Internal server error",
  errors?: unknown,
) {
  const body: ApiError = {
    success: false,
    status: 500,
    message,
    errors,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status: 500 });
}