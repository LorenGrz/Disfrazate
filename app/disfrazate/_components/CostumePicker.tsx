"use client";

import Image from "next/image";
import { useState } from "react";
import { matchesCostume } from "@/lib/catalog";

export type CostumeOption = {
  slug: string;
  name: string;
  tagline: string;
  field: 1 | 2 | 3;
  photo: string;
};

type CostumePickerProps = {
  costumes: readonly CostumeOption[];
  onPick: (slug: string) => void;
};

/** Filtro por texto (con `matchesCostume`) sobre una grilla compacta de miniaturas. */
export function CostumePicker({ costumes, onPick }: CostumePickerProps) {
  const [filter, setFilter] = useState("");
  const trimmed = filter.trim();
  const visible =
    trimmed === ""
      ? costumes
      : costumes.filter((costume) => matchesCostume(costume, trimmed));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-xl flex-col gap-2">
        <label htmlFor="filtro-disfraz" className="font-medium">
          Filtrar disfraces
        </label>
        <input
          id="filtro-disfraz"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          autoComplete="off"
          placeholder="vampiro, banana, pancho..."
          className="text-input"
        />
      </div>
      <p aria-live="polite" className="text-small">
        {visible.length} {visible.length === 1 ? "disfraz" : "disfraces"}
      </p>
      {visible.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {visible.map((costume) => (
            <li key={costume.slug}>
              <button
                type="button"
                onClick={() => onPick(costume.slug)}
                className="press flex w-full cursor-pointer flex-col gap-2 text-left"
              >
                <span
                  className={`relative block aspect-[4/5] w-full overflow-hidden field-${costume.field}`}
                >
                  <Image
                    src={costume.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 8vw, (min-width: 768px) 14vw, 30vw"
                    className="object-cover"
                  />
                </span>
                <span className="text-small font-medium">{costume.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Ninguno coincide. Probá con otra palabra.</p>
      )}
    </div>
  );
}
