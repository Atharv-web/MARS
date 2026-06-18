"use client";

import { useState } from "react";
import type { ReportRecord } from "@/types/report";

type ImageGridProps = {
  images: ReportRecord["images"];
};

export default function ImageGrid({ images }: ImageGridProps) {
  // Remote image URLs frequently 404 or hotlink-block. Track failures and drop
  // them so the grid never shows broken-image icons.
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  const usable = images.filter((image) => image.imageUrl && !broken[image.imageUrl]);

  if (!usable.length) {
    return null;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Images
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          Visual references from the research sweep
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {usable.map((image, index) => (
          <a
            key={`${index}-${image.imageUrl}`}
            href={image.sourceUrl || image.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="glass-card group overflow-hidden rounded-3xl"
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() =>
                  setBroken((current) => ({ ...current, [image.imageUrl]: true }))
                }
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
                {image.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
