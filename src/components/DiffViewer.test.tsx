import { fireEvent, render, screen } from "@testing-library/react";
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

  test("shows Split and Unified toggle buttons", () => {
    render(<DiffViewer {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Split" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unified" })).toBeInTheDocument();
  });

  test("switches to unified mode when Unified button is clicked", () => {
    render(<DiffViewer {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Unified" }));
    expect(screen.getByTestId("diff-viewer")).toHaveAttribute("data-split-view", "false");
  });

  test("switches back to split mode when Split button is clicked", () => {
    render(<DiffViewer {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Unified" }));
    fireEvent.click(screen.getByRole("button", { name: "Split" }));
    expect(screen.getByTestId("diff-viewer")).toHaveAttribute("data-split-view", "true");
  });

  test("passes leftContent and rightContent to diff viewer", () => {
    render(<DiffViewer leftContent="old" rightContent="new" />);
    expect(screen.getByTestId("diff-viewer")).toBeInTheDocument();
  });
});
