import { z } from "zod";
import { requireResident } from "@/backend/api/guards";
import { uploadTicketAttachment } from "@/backend/repositories/profile-ext";
import { ok, badRequest, created } from "@/backend/api/response";

const schema = z.object({ fileName: z.string(), fileUrl: z.string().url() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireResident(request);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return badRequest("fileName and fileUrl required");
  const attachment = await uploadTicketAttachment(id, parsed.data.fileName, parsed.data.fileUrl);
  return created({ attachment });
}