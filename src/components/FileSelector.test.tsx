import { act, fireEvent, render, screen } from "@testing-library/react";
import { FileSelector } from "@/components/FileSelector";

vi.mock("@/lib/github", () => ({
  fetchRefs: vi.fn().mockResolvedValue({ branches: ["main", "develop"], tags: ["v1.0.0"] }),
  fetchTree: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/storage", () => ({ getToken: vi.fn().mockReturnValue(null) }));

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

  test("parses GitHub URL and fills all fields", async () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md" },
      });
    });
    expect(onChange).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });
  });

  test("parses GitHub URL with nested path", async () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/octocat/Hello-World/blob/main/src/index.ts" },
      });
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "src/index.ts" }));
  });

  test("parses GitHub blame URL", async () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/octocat/Hello-World/blame/main/README.md" },
      });
    });
    expect(onChange).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "Hello-World",
      ref: "main",
      path: "README.md",
    });
  });

  test("resolves branch name with slash using fetched refs", async () => {
    const { fetchRefs } = await import("@/lib/github");
    vi.mocked(fetchRefs).mockResolvedValueOnce({
      branches: ["revert/master-merge", "main"],
      tags: [],
    });
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: {
          value: "https://github.com/octocat/Hello-World/blob/revert/master-merge/CLAUDE.md",
        },
      });
    });
    expect(onChange).toHaveBeenCalledWith({
      owner: "octocat",
      repo: "Hello-World",
      ref: "revert/master-merge",
      path: "CLAUDE.md",
    });
  });

  test("strips line fragment (#L10) from GitHub URL", async () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md#L10" },
      });
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "README.md" }));
  });

  test("strips query string (?plain=1) from GitHub URL", async () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md?plain=1" },
      });
    });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ path: "README.md" }));
  });

  test("shows error message when non-file GitHub URL is pasted", async () => {
    render(<FileSelector side="left" value={defaultValue} onChange={() => {}} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/ot-nemoto/github-diff-viewer/actions/runs/12345" },
      });
    });
    expect(screen.getByRole("alert")).toHaveTextContent("ファイルの URL を入力してください");
  });

  test("clears error message when valid file URL is pasted after invalid URL", async () => {
    const onChange = vi.fn();
    render(<FileSelector side="left" value={defaultValue} onChange={onChange} />);
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/ot-nemoto/github-diff-viewer/actions/runs/12345" },
      });
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(ownerRepoPlaceholder), {
        target: { value: "https://github.com/octocat/Hello-World/blob/main/README.md" },
      });
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
