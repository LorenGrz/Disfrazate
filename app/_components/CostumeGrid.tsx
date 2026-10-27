import type { Costume } from "@/lib/catalog";
import { CostumeTile } from "./CostumeTile";

type CostumeGridProps = {
  costumes: readonly Costume[];
};

/** Grilla uniforme 4:5: 2 columnas en mobile, 3 en md, 5 en lg y 6 en xl. */
export function CostumeGrid({ costumes }: CostumeGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-4 xl:grid-cols-6">
      {costumes.map((costume, index) => (
        <CostumeTile key={costume.slug} costume={costume} index={index} />
      ))}
    </ul>
  );
}
