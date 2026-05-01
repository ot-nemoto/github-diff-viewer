"use client";

import { useState } from "react";
import ReactDiffViewer from "react-diff-viewer-continued";

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
}

type Mode = "split" | "unified";

export function DiffViewer({ leftContent, rightContent }: DiffViewerProps) {
  const [mode, setMode] = useState<Mode>("split");

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-600">差分</span>
        <div className="flex rounded-md overflow-hidden border border-gray-300 text-sm">
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`px-3 py-1 ${mode === "split" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setMode("unified")}
            className={`px-3 py-1 border-l border-gray-300 ${mode === "unified" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            Unified
          </button>
        </div>
      </div>
      <div className="overflow-auto text-sm">
        <ReactDiffViewer
          oldValue={leftContent}
          newValue={rightContent}
          splitView={mode === "split"}
        />
      </div>
    </div>
  );
}
