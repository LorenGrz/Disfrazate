"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCostume } from "@/lib/catalog";
import {
  EVENT_COOKIE,
  eventToken,
  isValidEventCode,
} from "@/lib/event-gate.server";

const unlockForm = z.object({
  code: z.string().trim().min(1).max(100),
});

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function destination(disfraz: string | undefined, error: boolean): string {
  const params = new URLSearchParams();
  if (disfraz !== undefined && getCostume(disfraz)) {
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
  if (!parsed.success || !isValidEventCode(parsed.data.code)) {
    redirect(destination(disfraz, true));
  }

  (await cookies()).set(EVENT_COOKIE, eventToken(parsed.data.code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
  redirect(destination(disfraz, false));
}
