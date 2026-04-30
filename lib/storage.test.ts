import { clearToken, getToken, setToken } from "./storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("getToken returns null when not set", () => {
    expect(getToken()).toBeNull();
  });

  test("setToken saves token to localStorage", () => {
    setToken("ghp_test_token");
    expect(getToken()).toBe("ghp_test_token");
  });

  test("setToken overwrites existing token", () => {
    setToken("old_token");
    setToken("new_token");
    expect(getToken()).toBe("new_token");
  });

  test("clearToken removes token from localStorage", () => {
    setToken("ghp_test_token");
    clearToken();
    expect(getToken()).toBeNull();
  });

  test("clearToken is safe when no token is set", () => {
    expect(() => clearToken()).not.toThrow();
    expect(getToken()).toBeNull();
  });
});
