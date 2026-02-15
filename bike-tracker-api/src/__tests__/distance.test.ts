import { describe, it, expect } from "vitest";
import { haversineDistance } from "../utils/distance";

describe("haversineDistance", () => {
  it("同じ地点は距離0", () => {
    const d = haversineDistance(35.6812, 139.7671, 35.6812, 139.7671);
    expect(d).toBe(0);
  });

  it("東京駅〜渋谷駅（約3.3km）", () => {
    // 東京駅: 35.6812, 139.7671
    // 渋谷駅: 35.6580, 139.7016
    const d = haversineDistance(35.6812, 139.7671, 35.658, 139.7016);
    expect(d).toBeGreaterThan(6000);
    expect(d).toBeLessThan(7000);
  });

  it("短い距離（100m程度）", () => {
    const d = haversineDistance(35.6812, 139.7671, 35.682, 139.768);
    expect(d).toBeGreaterThan(50);
    expect(d).toBeLessThan(200);
  });
});
