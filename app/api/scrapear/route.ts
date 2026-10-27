import { NextResponse } from "next/server";
import { readJson } from "@/lib/api-response.server";
import { nameCostume } from "@/lib/costume-namer.server";
import {
  countCustomCostumes,
  customPhotoUrl,
  insertCustomCostume,
  uploadCustomPhoto,
} from "@/lib/custom-costumes.server";
import { listAllCostumes } from "@/lib/costumes.server";
import { getEnv } from "@/lib/env.server";
import { hasEventAccess } from "@/lib/event-gate.server";
import { getImageProvider } from "@/lib/image-provider.server";
import { scrapeCostume } from "@/lib/scrape-costume.server";
import { isScraperConfigured } from "@/lib/supabase.server";
import { getUsageStore } from "@/lib/usage-store.server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const response = await scrapeCostume(
    {
      hasAccess: hasEventAccess,
      isEnabled: isScraperConfigured,
      listCostumes: listAllCostumes,
      countCustom: countCustomCostumes,
      maxCustom: getEnv().MAX_CUSTOM_COSTUMES,
      nameCostume,
      tryConsumeGeneration: () => getUsageStore().tryConsumeGeneration(),
      generate: (input) => getImageProvider().generate(input),
      uploadPhoto: uploadCustomPhoto,
      insertCostume: insertCustomCostume,
      photoUrl: customPhotoUrl,
    },
    await readJson(request),
  );
  return NextResponse.json(response.body, { status: response.status });
}
