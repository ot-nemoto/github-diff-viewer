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

function specToParam(spec: FileSpec): string {
  if (!spec.owner || !spec.repo || !spec.ref || !spec.path) return "";
  return `${spec.owner}/${spec.repo}/blob/${spec.ref}/${spec.path}`;
}

function paramToSpec(param: string | null): FileSpec {
  if (!param) return { ...DEFAULT_SPEC };
  const blobIdx = param.indexOf("/blob/");
  if (blobIdx === -1) return { ...DEFAULT_SPEC };
  const ownerRepo = param.slice(0, blobIdx);
  const refPath = param.slice(blobIdx + 6);
  const slashIdx = ownerRepo.indexOf("/");
  const refSlashIdx = refPath.indexOf("/");
  if (slashIdx === -1 || refSlashIdx === -1) return { ...DEFAULT_SPEC };
  return {
    owner: ownerRepo.slice(0, slashIdx),
    repo: ownerRepo.slice(slashIdx + 1),
    ref: refPath.slice(0, refSlashIdx),
    path: refPath.slice(refSlashIdx + 1),
  };
}

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const state: QueryState = {
    left: paramToSpec(searchParams.get("left")),
    right: paramToSpec(searchParams.get("right")),
  };

  const update = useCallback(
    (next: Partial<QueryState>) => {
      const merged = { ...state, ...next };
      const params = new URLSearchParams();
      const leftParam = specToParam(merged.left);
      const rightParam = specToParam(merged.right);
      if (leftParam) params.set("left", leftParam);
      if (rightParam) params.set("right", rightParam);
      router.replace(`?${params.toString()}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, searchParams],
  );

  return { state, update };
}
