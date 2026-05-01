import { render, screen } from "@testing-library/react";
import { DiffViewer } from "@/components/DiffViewer";

vi.mock("react-diff-viewer-continued", () => ({
  default: ({ splitView }: { splitView: boolean }) => (
    <div data-testid="diff-viewer" data-split-view={splitView ? "true" : "false"} />
  ),
}));

const defaultProps = { leftContent: "old content", rightContent: "new content" };

describe("DiffViewer", () => {
  test("renders in split mode by default", () => {
    render(<DiffViewer {...defaultProps} />);
    expect(screen.getByTestId("diff-viewer")).toHaveAttribute("data-split-view", "true");
  });

  test("renders in split mode when splitView=true", () => {
    render(<DiffViewer {...defaultProps} splitView={true} />);
    expect(screen.getByTestId("diff-viewer")).toHaveAttribute("data-split-view", "true");
  });

  test("renders in unified mode when splitView=false", () => {
    render(<DiffViewer {...defaultProps} splitView={false} />);
    expect(screen.getByTestId("diff-viewer")).toHaveAttribute("data-split-view", "false");
  });

  test("shows file name bar when fileName is provided", () => {
    render(<DiffViewer {...defaultProps} fileName="index.ts" />);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  test("passes leftContent and rightContent to diff viewer", () => {
    render(<DiffViewer leftContent="old" rightContent="new" />);
    expect(screen.getByTestId("diff-viewer")).toBeInTheDocument();
  });
});
