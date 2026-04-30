"use client";

import { useState } from "react";
import { fetchRefs, fetchTree } from "@/lib/github";
import { getToken } from "@/lib/storage";
import type { FileSpec } from "@/hooks/useQueryParams";

interface FileSelectorProps {
  side: "left" | "right";
  value: FileSpec;
  onChange: (value: FileSpec) => void;
}

const LABEL = { left: "比較元（Left）", right: "比較先（Right）" };

function parseGitHubUrl(url: string): FileSpec | null {
  const match = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
  );
  if (!match) return null;
  const [, owner, repo, ref, path] = match;
  return { owner, repo, ref, path };
}

export function FileSelector({ side, value, onChange }: FileSelectorProps) {
  const [ownerRepo, setOwnerRepo] = useState(
    value.owner || value.repo ? `${value.owner}/${value.repo}` : "",
  );
  const [refs, setRefs] = useState<{ branches: string[]; tags: string[] }>({
    branches: [],
    tags: [],
  });
  const [files, setFiles] = useState<string[]>([]);

  const update = (field: keyof FileSpec, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const handleOwnerRepoChange = (raw: string) => {
    const parsed = parseGitHubUrl(raw);
    if (parsed) {
      setOwnerRepo(`${parsed.owner}/${parsed.repo}`);
      onChange(parsed);
      return;
    }
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
    const token = getToken() ?? undefined;
    const result = await fetchRefs({ owner: value.owner, repo: value.repo, token });
    setRefs(result);
  };

  const handleRefBlur = async () => {
    if (!value.owner || !value.repo || !value.ref) return;
    const token = getToken() ?? undefined;
    const result = await fetchTree({ owner: value.owner, repo: value.repo, ref: value.ref, token });
    setFiles(result);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">{LABEL[side]}</h2>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Owner / Repository</label>
        <input
          type="text"
          value={ownerRepo}
          placeholder="owner/repository または GitHub URL"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleOwnerRepoChange(e.target.value)}
          onBlur={handleOwnerRepoBlur}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Ref（ブランチ / タグ / コミット）</label>
        <input
          type="text"
          value={value.ref}
          placeholder="main"
          list={`refs-${side}`}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label className="block text-xs text-gray-500 mb-1">File Path</label>
        <input
          type="text"
          value={value.path}
          placeholder="src/index.ts"
          list={`files-${side}`}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => update("path", e.target.value)}
        />
        <datalist id={`files-${side}`}>
          {files.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
