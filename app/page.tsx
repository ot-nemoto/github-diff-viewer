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
  const leftFile = useFileContent();
  const rightFile = useFileContent();
  const initialFetchDone = useRef(false);

  const isLoading = leftFile.loading || rightFile.loading;
  const hasContent = leftFile.content !== null && rightFile.content !== null;

  const isReady = (s: typeof localState.left) =>
    s.owner.trim() !== "" && s.repo.trim() !== "" && s.ref.trim() !== "" && s.path.trim() !== "";
  const canCompare = !isLoading && isReady(localState.left) && isReady(localState.right);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once on mount
  useEffect(() => {
    if (initialFetchDone.current) return;
    if (!isReady(state.left) || !isReady(state.right)) return;
    initialFetchDone.current = true;
    Promise.all([leftFile.fetch(state.left), rightFile.fetch(state.right)]);
  }, []);

  const handleCompare = async () => {
    update(localState);
    await Promise.all([leftFile.fetch(localState.left), rightFile.fetch(localState.right)]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">GitHub Diff Viewer</h1>
        <TokenSettings />
      </header>

      <main className="max-w-screen-xl mx-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FileSelector
            side="left"
            value={localState.left}
            onChange={(value) => setLocalState((s) => ({ ...s, left: value }))}
          />
          <FileSelector
            side="right"
            value={localState.right}
            onChange={(value) => setLocalState((s) => ({ ...s, right: value }))}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCompare}
            disabled={!canCompare}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "取得中..." : "比較する"}
          </button>
        </div>

        {(leftFile.error || rightFile.error) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              {leftFile.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <span className="font-semibold">Left: </span>
                  {leftFile.error}
                </div>
              )}
            </div>
            <div>
              {rightFile.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <span className="font-semibold">Right: </span>
                  {rightFile.error}
                </div>
              )}
            </div>
          </div>
        )}

        {hasContent && (
          <DiffViewer leftContent={leftFile.content ?? ""} rightContent={rightFile.content ?? ""} />
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          読み込み中...
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
