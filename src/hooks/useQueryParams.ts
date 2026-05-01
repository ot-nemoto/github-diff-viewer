"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface FileSpec {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}

export interface QueryState {
  left: FileSpec;
  right: FileSpec;
}

const DEFAULT_SPEC: FileSpec = { owner: "", repo: "", ref: "", path: "" };

function specToParams(prefix: "l" | "r", spec: FileSpec, params: URLSearchParams): void {
  if (!spec.owner || !spec.repo || !spec.ref || !spec.path) return;
  params.set(`${prefix}o`, spec.owner);
  params.set(`${prefix}r`, spec.repo);
  params.set(`${prefix}ref`, spec.ref);
  params.set(`${prefix}p`, spec.path);
}

function paramsToSpec(prefix: "l" | "r", searchParams: URLSearchParams): FileSpec {
  const owner = searchParams.get(`${prefix}o`) ?? "";
  const repo = searchParams.get(`${prefix}r`) ?? "";
  const ref = searchParams.get(`${prefix}ref`) ?? "";
  const path = searchParams.get(`${prefix}p`) ?? "";
  if (!owner || !repo || !ref || !path) return { ...DEFAULT_SPEC };
  return { owner, repo, ref, path };
}

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const state: QueryState = {
    left: paramsToSpec("l", searchParams),
    right: paramsToSpec("r", searchParams),
  };

  const update = useCallback(
    (next: Partial<QueryState>) => {
      const current = {
        left: paramsToSpec("l", searchParams),
        right: paramsToSpec("r", searchParams),
      };
      const merged = { ...current, ...next };
      const params = new URLSearchParams();
      specToParams("l", merged.left, params);
      specToParams("r", merged.right, params);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { state, update };
}
