"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { FileSelector } from "@/components/FileSelector";
import { TokenSettings } from "@/components/TokenSettings";
import { useFileContent } from "@/hooks/useFileContent";
import { useQueryParams } from "@/hooks/useQueryParams";

function ComparePageContent() {
  const { state, update } = useQueryParams();
  const [localState, setLocalState] = useState(state);
  const [mode, setMode] = useState<"split" | "unified">("split");
  const [displayedPaths, setDisplayedPaths] = useState<{ left: string; right: string } | null>(
    isReady(state.left) && isReady(state.right)
      ? { left: state.left.path, right: state.right.path }
      : null,
  );
  const leftFile = useFileContent();
  const rightFile = useFileContent();
  const initialFetchDone = useRef(false);

  const isLoading = leftFile.loading || rightFile.loading;
  const hasContent = leftFile.content !== null && rightFile.content !== null;

  const isReady = (s: typeof localState.left) =>
    s.owner.trim() !== "" && s.repo.trim() !== "" && s.ref.trim() !== "" && s.path.trim() !== "";
  const canCompare = !isLoading && isReady(localState.left) && isReady(localState.right);

  const leftName = displayedPaths?.left.split("/").pop() ?? "";
  const rightName = displayedPaths?.right.split("/").pop() ?? "";
  const fileName = leftName === rightName ? leftName : `${leftName} / ${rightName}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    if (initialFetchDone.current) return;
    if (!isReady(state.left) || !isReady(state.right)) return;
    initialFetchDone.current = true;
    Promise.all([leftFile.fetch(state.left), rightFile.fetch(state.right)]);
  }, []);

  const handleCompare = async () => {
    update(localState);
    setDisplayedPaths({ left: localState.left.path, right: localState.right.path });
    await Promise.all([leftFile.fetch(localState.left), rightFile.fetch(localState.right)]);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <header className="h-12 bg-[#24292f] flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          {/* GitHub icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 16 16"
            fill="rgba(255,255,255,0.9)"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="text-[15px] font-semibold text-[#e6edf3] tracking-tight">
            Diff Viewer
          </span>
        </div>
        <TokenSettings />
      </header>

      <main className="max-w-screen-xl mx-auto p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
          <FileSelector
            side="left"
            value={localState.left}
            onChange={(value) => setLocalState((s) => ({ ...s, left: value }))}
          />
          <div className="pt-9 text-[#636c76]">
            {/* Right arrow icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06z" />
            </svg>
          </div>
          <FileSelector
            side="right"
            value={localState.right}
            onChange={(value) => setLocalState((s) => ({ ...s, right: value }))}
          />
        </div>

        {/* Action Bar */}
        <div className="bg-white border border-[#d0d7de] rounded-md flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            {hasContent && (
              <>
                <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
                <span className="text-sm text-[#636c76]">
                  差分を表示中 — <strong className="text-[#1f2328]">{fileName}</strong>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-[#d0d7de] overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setMode("split")}
                disabled={!hasContent}
                className={`px-3.5 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  mode === "split"
                    ? "bg-[#0969da] text-white"
                    : "bg-white text-[#1f2328] hover:bg-[#f6f8fa]"
                }`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setMode("unified")}
                disabled={!hasContent}
                className={`px-3.5 py-1 border-l border-[#d0d7de] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  mode === "unified"
                    ? "bg-[#0969da] text-white"
                    : "bg-white text-[#1f2328] hover:bg-[#f6f8fa]"
                }`}
              >
                Unified
              </button>
            </div>
            <button
              type="button"
              onClick={handleCompare}
              disabled={!canCompare}
              className="px-4 py-1.5 bg-[#0969da] text-white rounded-md text-sm font-semibold hover:bg-[#0860ca] disabled:opacity-50 disabled:cursor-not-allowed border border-black/10 transition-colors"
            >
              {isLoading ? "取得中..." : "比較する"}
            </button>
          </div>
        </div>

        {(leftFile.error || rightFile.error) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              {leftFile.error && (
                <div className="px-3 py-2 bg-[#ffebe9] border border-[#f5c6c6] rounded-md text-[#cf222e] text-sm">
                  <span className="font-semibold">Left: </span>
                  {leftFile.error}
                </div>
              )}
            </div>
            <div>
              {rightFile.error && (
                <div className="px-3 py-2 bg-[#ffebe9] border border-[#f5c6c6] rounded-md text-[#cf222e] text-sm">
                  <span className="font-semibold">Right: </span>
                  {rightFile.error}
                </div>
              )}
            </div>
          </div>
        )}

        {hasContent && (
          <DiffViewer
            leftContent={leftFile.content ?? ""}
            rightContent={rightFile.content ?? ""}
            splitView={mode === "split"}
            fileName={fileName}
          />
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-[#636c76]">
          読み込み中...
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
