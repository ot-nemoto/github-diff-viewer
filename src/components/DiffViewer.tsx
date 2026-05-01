"use client";

import ReactDiffViewer from "react-diff-viewer-continued";

interface DiffViewerProps {
  leftContent: string;
  rightContent: string;
  splitView?: boolean;
  fileName?: string;
}

export function DiffViewer({ leftContent, rightContent, splitView = true, fileName }: DiffViewerProps) {
  return (
    <div className="border border-[#d0d7de] rounded-md overflow-hidden">
      {fileName && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f6f8fa] border-b border-[#d0d7de]">
          <span className="font-mono text-xs text-[#1f2328]">{fileName}</span>
        </div>
      )}
      <div className="overflow-auto text-sm">
        <ReactDiffViewer
          oldValue={leftContent}
          newValue={rightContent}
          splitView={splitView}
        />
      </div>
    </div>
  );
}
