import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string, errors?: unknown) {
  return NextResponse.json({ message, errors }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ message }, { status: 404 });
}

export function unprocessable(message: string) {
  return NextResponse.json({ message }, { status: 422 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ message }, { status: 500 });
}
