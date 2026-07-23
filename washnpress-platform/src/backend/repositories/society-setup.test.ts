import { describe, expect, it } from "vitest";
import {
  generateFlatNumber,
  createBuildingAndGenerateStructure,
  getSocietyMasterData,
  markSocietySetupComplete,
  getBuildingsBySociety,
  getFloorsByBuilding,
  getFlatsByFloor,
} from "./society-setup";

describe("Society Master Setup Workflow", () => {
  it("generates flat numbers correctly based on formatting rules", () => {
    // 101 format: Floor 1, Flat 1 -> 101; Floor 10, Flat 4 -> 1004
    expect(generateFlatNumber("A Block", 1, 1, "101")).toBe("101");
    expect(generateFlatNumber("A Block", 1, 4, "101")).toBe("104");
    expect(generateFlatNumber("A Block", 10, 1, "101")).toBe("1001");
    expect(generateFlatNumber("A Block", 10, 4, "101")).toBe("1004");

    // A-101 format
    expect(generateFlatNumber("A Block", 1, 1, "A-101")).toBe("A-101");
    expect(generateFlatNumber("B Block", 2, 3, "A-101")).toBe("B-203");

    // A101 format
    expect(generateFlatNumber("Tower C", 5, 2, "A101")).toBe("T502");

    // Custom Prefix format
    expect(generateFlatNumber("A Block", 1, 1, "Custom Prefix", "PH-")).toBe("PH-101");
  });

  it("automatically generates building structure with floors and flats", async () => {
    const testSocietyId = "test-soc-auto-gen";

    const result = await createBuildingAndGenerateStructure({
      societyId: testSocietyId,
      buildingName: "A Block",
      floors: 10,
      flatsPerFloor: 4,
      numberingFormat: "101",
    });

    expect(result.society.id).toBe(testSocietyId);
    expect(result.buildings.length).toBeGreaterThanOrEqual(1);

    const aBlock = result.buildings.find((b) => b.name === "A Block");
    expect(aBlock).toBeDefined();
    expect(aBlock?.floors.length).toBe(10);

    const floor1 = aBlock?.floors.find((f) => f.floor_number === 1);
    expect(floor1?.flats.map((fl) => fl.flat_number)).toEqual(["101", "102", "103", "104"]);

    const floor10 = aBlock?.floors.find((f) => f.floor_number === 10);
    expect(floor10?.flats.map((fl) => fl.flat_number)).toEqual(["1001", "1002", "1003", "1004"]);
  });

  it("allows multiple buildings (A Block, B Block, C Block)", async () => {
    const testSocietyId = "test-soc-multi";

    await createBuildingAndGenerateStructure({
      societyId: testSocietyId,
      buildingName: "A Block",
      floors: 10,
      flatsPerFloor: 4,
      numberingFormat: "101",
    });

    await createBuildingAndGenerateStructure({
      societyId: testSocietyId,
      buildingName: "B Block",
      floors: 8,
      flatsPerFloor: 6,
      numberingFormat: "101",
    });

    const masterData = await getSocietyMasterData(testSocietyId);
    expect(masterData.buildings.length).toBe(2);
    expect(masterData.buildings.map((b) => b.name).sort()).toEqual(["A Block", "B Block"]);
  });

  it("marks society setup complete and updates status", async () => {
    const testSocietyId = "test-soc-complete";
    await markSocietySetupComplete(testSocietyId);

    const masterData = await getSocietyMasterData(testSocietyId);
    expect(masterData.society.status).toBe("Completed");
  });

  it("provides dynamic cascading dropdown data for residents", async () => {
    const testSocId = "test-soc-cascade";
    await createBuildingAndGenerateStructure({
      societyId: testSocId,
      buildingName: "A Block",
      floors: 2,
      flatsPerFloor: 2,
      numberingFormat: "101",
    });

    const buildings = await getBuildingsBySociety(testSocId);
    expect(buildings.length).toBeGreaterThan(0);
    const bId = buildings[0].id;

    const floors = await getFloorsByBuilding(bId);
    expect(floors.length).toBe(2);
    const fId = floors[0].id;

    const flats = await getFlatsByFloor(fId);
    expect(flats.length).toBe(2);
    expect(flats.map((fl) => fl.flat_number)).toEqual(["101", "102"]);
  });
});
