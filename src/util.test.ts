import { extractVersionFromUrl } from "./util";

describe("extractVersionFromUrl", () => {
  test("returns the expected version", () => {
    let url = "https://github.com/mvdan/sh/releases/tag/v3.3.1";
    expect(extractVersionFromUrl(url)).toBe("3.3.1");
  });
});
