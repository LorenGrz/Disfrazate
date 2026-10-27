"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCostume } from "@/lib/catalog";
import { isCustomSlug } from "@/lib/custom-costume";
import { grantEventAccess } from "@/lib/event-gate.server";

const unlockForm = z.object({
  code: z.string().trim().min(1).max(100),
});

function destination(disfraz: string | undefined, error: boolean): string {
  const params = new URLSearchParams();
  if (
    disfraz !== undefined &&
    (getCostume(disfraz) !== undefined || isCustomSlug(disfraz))
  ) {
    params.set("disfraz", disfraz);
  }
  if (error) params.set("error", "codigo");
  const query = params.toString();
  return query === "" ? "/disfrazate" : `/disfrazate?${query}`;
}

export async function unlockEvent(formData: FormData): Promise<void> {
  const rawDisfraz = formData.get("disfraz");
  const disfraz = typeof rawDisfraz === "string" ? rawDisfraz : undefined;
  const parsed = unlockForm.safeParse({ code: formData.get("code") });
  if (!parsed.success || !(await grantEventAccess(parsed.data.code))) {
    redirect(destination(disfraz, true));
  }
  redirect(destination(disfraz, false));
}
