"use client";

import { useState } from "react";
import type { FileSpec } from "@/hooks/useQueryParams";
import { fetchRefs, fetchTree } from "@/lib/github";
import { getToken } from "@/lib/storage";

interface FileSelectorProps {
  side: "left" | "right";
  value: FileSpec;
  onChange: (value: FileSpec) => void;
}

const BADGE = {
  left:  { bg: "bg-[#0550ae]", label: "L" },
  right: { bg: "bg-[#1a7f37]", label: "R" },
};
const HEADER_LABEL = { left: "比較元 (Left)", right: "比較先 (Right)" };

interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  refAndPath: string;
}

function parseGitHubUrlBase(url: string): ParsedGitHubUrl | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== "github.com") return null;
  const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:blob|blame|raw)\/(.+)$/);
  if (!match) return null;
  const [, owner, repo, refAndPath] = match;
  return { owner, repo, refAndPath };
}

function resolveRefAndPath(refAndPath: string, allRefs: string[]): { ref: string; path: string } {
  const matched = allRefs
    .filter((r) => refAndPath === r || refAndPath.startsWith(`${r}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (matched && refAndPath.startsWith(`${matched}/`)) {
    return { ref: matched, path: refAndPath.slice(matched.length + 1) };
  }
  const slashIdx = refAndPath.indexOf("/");
  if (slashIdx === -1) return { ref: refAndPath, path: "" };
  return { ref: refAndPath.slice(0, slashIdx), path: refAndPath.slice(slashIdx + 1) };
}

export function FileSelector({ side, value, onChange }: FileSelectorProps) {
  const [ownerRepo, setOwnerRepo] = useState(
    value.owner || value.repo ? `${value.owner}/${value.repo}` : "",
  );
  const [refs, setRefs] = useState<{ branches: string[]; tags: string[] }>({
    branches: [],
    tags: [],
  });
  const [refsOwnerRepo, setRefsOwnerRepo] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [urlError, setUrlError] = useState("");

  const update = (field: keyof FileSpec, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const isGitHubUrl = (raw: string) => {
    try {
      const { protocol, hostname } = new URL(raw);
      return (protocol === "http:" || protocol === "https:") && hostname === "github.com";
    } catch {
      return false;
    }
  };

  const handleOwnerRepoChange = async (raw: string) => {
    const base = parseGitHubUrlBase(raw);
    if (base) {
      setUrlError("");
      setOwnerRepo(`${base.owner}/${base.repo}`);
      const token = getToken() ?? undefined;
      const key = `${base.owner}/${base.repo}`;
      const result = await fetchRefs({ owner: base.owner, repo: base.repo, token });
      setRefs(result);
      setRefsOwnerRepo(key);
      const allRefs = [...result.branches, ...result.tags];
      const { ref, path } = resolveRefAndPath(base.refAndPath, allRefs);
      onChange({ owner: base.owner, repo: base.repo, ref, path });
      return;
    }
    if (isGitHubUrl(raw)) {
      setOwnerRepo(raw);
      setUrlError("ファイルの URL を入力してください（例: .../blob/main/README.md）");
      return;
    }
    setUrlError("");
    setOwnerRepo(raw);
    const idx = raw.indexOf("/");
    if (idx === -1) {
      onChange({ ...value, owner: raw, repo: "" });
    } else {
      onChange({ ...value, owner: raw.slice(0, idx), repo: raw.slice(idx + 1) });
    }
  };

  const handleOwnerRepoBlur = async () => {
    if (!value.owner || !value.repo) return;
    if (refsOwnerRepo === `${value.owner}/${value.repo}`) return;
    const token = getToken() ?? undefined;
    const result = await fetchRefs({ owner: value.owner, repo: value.repo, token });
    setRefs(result);
    setRefsOwnerRepo(`${value.owner}/${value.repo}`);
  };

  const handleRefBlur = async () => {
    if (!value.owner || !value.repo || !value.ref) return;
    const token = getToken() ?? undefined;
    const result = await fetchTree({ owner: value.owner, repo: value.repo, ref: value.ref, token });
    setFiles(result);
  };

  const badge = BADGE[side];

  return (
    <div className="bg-white border border-[#d0d7de] rounded-md overflow-hidden">
      <div className="px-3.5 py-2.5 border-b border-[#e8ebee] flex items-center gap-2">
        <span className={`w-[22px] h-[22px] rounded flex items-center justify-center text-[11px] font-bold text-white ${badge.bg}`}>
          {badge.label}
        </span>
        <span className="text-sm font-semibold text-[#1f2328]">{HEADER_LABEL[side]}</span>
      </div>
      <div className="px-3.5 py-3 space-y-2.5">
        <div>
          <label htmlFor={`${side}-owner-repo`} className="block text-xs font-medium text-[#636c76] mb-1">
            Owner / Repository
          </label>
          <input
            id={`${side}-owner-repo`}
            type="text"
            value={ownerRepo}
            placeholder="owner/repository または GitHub URL"
            className="w-full px-2.5 py-1.5 text-sm border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da]"
            aria-invalid={!!urlError}
            aria-describedby={urlError ? `${side}-url-error` : undefined}
            onChange={(e) => handleOwnerRepoChange(e.target.value)}
            onBlur={handleOwnerRepoBlur}
          />
          {urlError && (
            <p id={`${side}-url-error`} role="alert" className="mt-1 text-xs text-red-600">
              {urlError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${side}-ref`} className="block text-xs font-medium text-[#636c76] mb-1">
            Ref（ブランチ / タグ / コミット）
          </label>
          <input
            id={`${side}-ref`}
            type="text"
            value={value.ref}
            placeholder="main"
            list={`refs-${side}`}
            className="w-full px-2.5 py-1.5 text-sm border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da]"
            onChange={(e) => update("ref", e.target.value)}
            onBlur={handleRefBlur}
          />
          <datalist id={`refs-${side}`}>
            {refs.branches.map((b) => (
              <option key={`branch-${b}`} value={b} label={`branch: ${b}`} />
            ))}
            {refs.tags.map((t) => (
              <option key={`tag-${t}`} value={t} label={`tag: ${t}`} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor={`${side}-path`} className="block text-xs font-medium text-[#636c76] mb-1">
            File Path
          </label>
          <input
            id={`${side}-path`}
            type="text"
            value={value.path}
            placeholder="src/index.ts"
            list={`files-${side}`}
            className="w-full px-2.5 py-1.5 text-sm border border-[#d0d7de] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da]"
            onChange={(e) => update("path", e.target.value)}
          />
          <datalist id={`files-${side}`}>
            {files.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}
