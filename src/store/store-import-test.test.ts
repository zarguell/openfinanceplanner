/**
 * Test file to verify @/store path alias resolves correctly
 * This test validates that the store can be imported via the configured alias
 */

import { describe, it, expect } from "vitest";
import { useStore } from "@/store";

describe("Store Import Path Alias", () => {
  it("should import useStore from @/store alias", () => {
    expect(useStore).toBeDefined();
    expect(typeof useStore).toBe("function");
  });

  it("should have initial state structure", () => {
    const state = useStore.getState();

    expect(state).toHaveProperty("profile", null);
    expect(state).toHaveProperty("projection", null);
    expect(state).toHaveProperty("_hasHydrated", false);
    expect(state).toHaveProperty("setProfile");
    expect(state).toHaveProperty("clearProfile");
    expect(state).toHaveProperty("setProjection");
    expect(state).toHaveProperty("clearProjection");
    expect(state).toHaveProperty("setHasHydrated");
  });
});
