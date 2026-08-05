import { withErrorHandling } from "@/backend/api/response";
import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

const specPath = join(process.cwd(), "backend/api-spec/openapi.json");

async function _GET() {
  const spec = readFileSync(specPath, "utf-8");
  return new NextResponse(spec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}


export const GET = withErrorHandling(_GET);
