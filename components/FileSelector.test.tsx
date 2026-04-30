import { fireEvent, render, screen } from "@testing-library/react";
import { FileSelector } from "@/components/FileSelector";

const defaultValue = { owner: "", repo: "", ref: "", path: "" };
const ownerRepoPlaceholder = "owner/repository または GitHub URL";

describe("FileSelector", () => {
  test("renders label for left side", () => {
    render(<FileSelector side="left" value={defaultValue} onChange={() => {}} />);
    expect(screen.getByText("比較元（Left）")).toBeInTheDocument();
  });

  test("renders label for right side", () => {
    render(<FileSelector side="right" value={defaultValue} onChange={() => {}} />);
    expect(screen.getByText("比較先（Right）")).toBeInTheDocument();
  });

  test("displays owner/repo combined in input", () => {
    const value = { owner: "octocat", repo: "Hello-World", ref: "main", path: "README.md" };
    render(<FileSelector side="left" value={value} onChange={() => {}} />);
    expect(screen.getByPlaceholderText(ownerRepoPlaceholder)).toHaveValue("octocat/Hello-World");
  });

  test("calls onChange with split owner and repo on owner/repo input change", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
      target: { value: "octocat/Hello-World" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "octocat", repo: "Hello-World" }),
    );
  });

  test("parses GitHub URL and fills all fields", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
      target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md" },
    });
    expect(onChange).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });
  });

  test("parses GitHub URL with nested path", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
      target: { value: "https://github.com/octocat/Hello-World/blob/main/src/index.ts" },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "src/index.ts" }));
  });

  test("parses GitHub blame URL", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
      target: { value: "https://github.com/octocat/Hello-World/blame/main/README.md" },
    });
    expect(onChange).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });
  });

  test("strips line fragment (#L10) from GitHub URL", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
      target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md#L10" },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "README.md" }));
  });

  test("strips query string (?plain=1) from GitHub URL", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
      target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md?plain=1" },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "README.md" }));
  });

  test("calls onChange with updated ref", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("main"), { target: { value: "develop" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ref: "develop" }));
  });

  test("calls onChange with updated path", () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("src/index.ts"), {
      target: { value: "lib/utils.ts" },
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "lib/utils.ts" }));
  });
});
