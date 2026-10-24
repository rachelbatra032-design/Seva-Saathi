import type { ReactNode } from "react";

/** Route param types for `tsc` in CI (before `next build` generates `.next/types`). */
export type SlugPageParams = { params: Promise<{ slug: string }> };

export type RootLayoutProps = { children: ReactNode };
