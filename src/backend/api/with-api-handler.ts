import { serverError } from "@/backend/api/response";

type ApiHandler = (request: Request, context?: any) => Promise<Response>;

/** Wrap route handlers so unexpected errors always return JSON, never empty/HTML bodies. */
export function withApiHandler(handler: ApiHandler): ApiHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("[api]", request.method, new URL(request.url).pathname, error);
      return serverError(
        error instanceof Error ? error.message : "Internal server error",
      );
    }
  };
}
