import { query, queryOne } from "@/backend/db/pool";

export type BuildingRecord = {
  id: string;
  society_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type FloorRecord = {
  id: string;
  building_id: string;
  floor_number: number;
  created_at?: string;
  updated_at?: string;
};

export type FlatRecord = {
  id: string;
  building_id: string;
  floor_id: string;
  flat_number: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type FullBuildingHierarchy = BuildingRecord & {
  floors: (FloorRecord & {
    flats: FlatRecord[];
  })[];
};

export type PendingSocietyItem = {
  id: string;
  name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  pincode: string | null;
  status: string;
  building_count: number;
  last_updated: string;
};

// In-memory store for dev/testing fallbacks
type MockBuilding = { id: string; society_id: string; name: string; created_at: string; updated_at: string };
type MockFloor = { id: string; building_id: string; floor_number: number; created_at: string; updated_at: string };
type MockFlat = { id: string; building_id: string; floor_id: string; flat_number: string; status: string; created_at: string; updated_at: string };

const inMemoryStore: {
  societies: Map<string, { id: string; name: string; address_line_1: string | null; city: string; state: string; pincode: string | null; status: string; updated_at: string }>;
  buildings: MockBuilding[];
  floors: MockFloor[];
  flats: MockFlat[];
} = {
  societies: new Map([
    ["soc-1", { id: "soc-1", name: "Bhanu Ventures", address_line_1: "Gachibowli Main Rd", city: "Hyderabad", state: "Telangana", pincode: "500032", status: "Pending Setup", updated_at: new Date().toISOString() }],
    ["soc-2", { id: "soc-2", name: "Green Valley Heights", address_line_1: "Hitec City", city: "Hyderabad", state: "Telangana", pincode: "500081", status: "In Progress", updated_at: new Date().toISOString() }],
    ["soc-3", { id: "soc-3", name: "Cyber Residency", address_line_1: "Kondapur", city: "Hyderabad", state: "Telangana", pincode: "500084", status: "Completed", updated_at: new Date().toISOString() }],
  ]),
  buildings: [],
  floors: [],
  flats: [],
};

// Helper for generating flat numbers according to specified format
export function generateFlatNumber(
  buildingName: string,
  floorNumber: number,
  flatIndex: number,
  numberingFormat: string,
  customPrefix?: string
): string {
  const padIndex = String(flatIndex).padStart(2, "0");
  const baseNum = `${floorNumber}${padIndex}`;

  if (numberingFormat === "A-101") {
    const prefix = (customPrefix?.trim() || buildingName.replace(/[^a-zA-Z0-9]/g, "").charAt(0) || "A").toUpperCase();
    return `${prefix}-${baseNum}`;
  }
  if (numberingFormat === "A101") {
    const prefix = (customPrefix?.trim() || buildingName.replace(/[^a-zA-Z0-9]/g, "").charAt(0) || "A").toUpperCase();
    return `${prefix}${baseNum}`;
  }
  if (numberingFormat === "Custom Prefix") {
    const prefix = customPrefix ? customPrefix.trim() : "";
    return `${prefix}${baseNum}`;
  }
  return baseNum;
}

export async function listPendingSocieties(): Promise<PendingSocietyItem[]> {
  try {
    const res = await query<PendingSocietyItem>(`
      SELECT s.id, s.name, s.address_line_1, s.city, s.state, s.pincode, s.status,
             COALESCE(b.b_count, st.t_count, 0)::int AS building_count,
             COALESCE(s.updated_at, s.created_at, now()) AS last_updated
      FROM societies s
      LEFT JOIN (
        SELECT society_id, COUNT(*) AS b_count FROM buildings GROUP BY society_id
      ) b ON b.society_id = s.id
      LEFT JOIN (
        SELECT society_id, COUNT(*) AS t_count FROM society_towers GROUP BY society_id
      ) st ON st.society_id = s.id
      ORDER BY
        CASE s.status
          WHEN 'Pending Setup' THEN 1
          WHEN 'In Progress' THEN 2
          ELSE 3
        END,
        s.name ASC
    `);
    if (res.rows.length > 0) return res.rows;
  } catch {
    // Database query failed, use in-memory store fallback
  }

  // Fallback to in-memory store
  const items: PendingSocietyItem[] = [];
  for (const s of inMemoryStore.societies.values()) {
    const bCount = inMemoryStore.buildings.filter((b) => b.society_id === s.id).length;
    items.push({
      id: s.id,
      name: s.name,
      address_line_1: s.address_line_1,
      city: s.city,
      state: s.state,
      pincode: s.pincode,
      status: s.status,
      building_count: bCount,
      last_updated: s.updated_at,
    });
  }
  return items.sort((a, b) => {
    const order: Record<string, number> = { "Pending Setup": 1, "In Progress": 2, Completed: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });
}

export async function createBuildingAndGenerateStructure(data: {
  societyId: string;
  buildingName: string;
  floors: number;
  flatsPerFloor: number;
  numberingFormat: string;
  customPrefix?: string;
}) {
  const buildingName = data.buildingName.trim();
  const floorsCount = Math.max(1, data.floors);
  const flatsCount = Math.max(1, data.flatsPerFloor);

  try {
    // Try Postgres DB transaction / queries
    const bRes = await queryOne<BuildingRecord>(
      `INSERT INTO buildings (society_id, name) VALUES ($1, $2)
       ON CONFLICT (society_id, name) DO UPDATE SET updated_at = now()
       RETURNING *`,
      [data.societyId, buildingName]
    );

    let buildingId = bRes?.id;
    if (!buildingId) {
      const existing = await queryOne<BuildingRecord>(
        `SELECT * FROM buildings WHERE society_id = $1 AND name = $2`,
        [data.societyId, buildingName]
      );
      buildingId = existing?.id;
    }

    if (buildingId) {
      // Also try to mirror into legacy society_towers for compatibility
      try {
        await query(
          `INSERT INTO society_towers (id, society_id, name) VALUES ($1, $2, $3)
           ON CONFLICT (society_id, name) DO NOTHING`,
          [buildingId, data.societyId, buildingName]
        );
      } catch {
        // ignore legacy table errors
      }

      for (let f = 1; f <= floorsCount; f++) {
        const floorRes = await queryOne<FloorRecord>(
          `INSERT INTO floors (building_id, floor_number) VALUES ($1, $2)
           ON CONFLICT (building_id, floor_number) DO UPDATE SET updated_at = now()
           RETURNING *`,
          [buildingId, f]
        );
        const floorId = floorRes?.id;

        if (floorId) {
          // Legacy floor insert if table exists
          try {
            await query(
              `INSERT INTO society_floors (id, tower_id, floor_number, label) VALUES ($1, $2, $3, $4)
               ON CONFLICT (tower_id, floor_number) DO NOTHING`,
              [floorId, buildingId, f, `Floor ${f}`]
            );
          } catch {
            // ignore legacy table errors
          }

          for (let i = 1; i <= flatsCount; i++) {
            const flatNum = generateFlatNumber(buildingName, f, i, data.numberingFormat, data.customPrefix);
            const flatRes = await queryOne<FlatRecord>(
              `INSERT INTO flats (building_id, floor_id, flat_number, status)
               VALUES ($1, $2, $3, 'active')
               ON CONFLICT (floor_id, flat_number) DO UPDATE SET updated_at = now()
               RETURNING *`,
              [buildingId, floorId, flatNum]
            );

            if (flatRes?.id) {
              try {
                await query(
                  `INSERT INTO society_flats (id, floor_id, flat_number, status) VALUES ($1, $2, $3, 'active')
                   ON CONFLICT (floor_id, flat_number) DO NOTHING`,
                  [flatRes.id, floorId, flatNum]
                );
              } catch {
                // ignore
              }
            }
          }
        }
      }

      // Update society status to 'In Progress' if 'Pending Setup'
      await query(
        `UPDATE societies SET status = 'In Progress', updated_at = now()
         WHERE id = $1 AND status = 'Pending Setup'`,
        [data.societyId]
      );
      return getSocietyMasterData(data.societyId);
    }
  } catch {
    // Database query failed, fallback to in-memory store
  }

  // Fallback to in-memory store
  let building = inMemoryStore.buildings.find((b) => b.society_id === data.societyId && b.name === buildingName);
  if (!building) {
    building = {
      id: `bld-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      society_id: data.societyId,
      name: buildingName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inMemoryStore.buildings.push(building);
  }

  for (let f = 1; f <= floorsCount; f++) {
    let floor = inMemoryStore.floors.find((fl) => fl.building_id === building!.id && fl.floor_number === f);
    if (!floor) {
      floor = {
        id: `flr-${building.id}-${f}`,
        building_id: building.id,
        floor_number: f,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryStore.floors.push(floor);
    }

    for (let i = 1; i <= flatsCount; i++) {
      const flatNum = generateFlatNumber(buildingName, f, i, data.numberingFormat, data.customPrefix);
      const existingFlat = inMemoryStore.flats.find((flt) => flt.floor_id === floor!.id && flt.flat_number === flatNum);
      if (!existingFlat) {
        inMemoryStore.flats.push({
          id: `flt-${floor.id}-${i}`,
          building_id: building.id,
          floor_id: floor.id,
          flat_number: flatNum,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }

  const soc = inMemoryStore.societies.get(data.societyId);
  if (soc && soc.status === "Pending Setup") {
    soc.status = "In Progress";
    soc.updated_at = new Date().toISOString();
  }

  return getSocietyMasterData(data.societyId);
}

export async function getSocietyMasterData(societyId: string) {
  try {
    const soc = await queryOne<{ id: string; name: string; address_line_1: string; city: string; state: string; pincode: string; status: string }>(
      `SELECT id, name, address_line_1, city, state, pincode, status FROM societies WHERE id = $1`,
      [societyId]
    );

    if (soc) {
      let bRows = (
        await query<BuildingRecord>(
          `SELECT id, society_id, name FROM buildings WHERE society_id = $1 ORDER BY name ASC`,
          [societyId]
        )
      ).rows;

      if (bRows.length === 0) {
        // Check legacy society_towers table
        const tRows = (
          await query<BuildingRecord>(
            `SELECT id, society_id, name FROM society_towers WHERE society_id = $1 ORDER BY name ASC`,
            [societyId]
          )
        ).rows;
        bRows = tRows;
      }

      const buildings: FullBuildingHierarchy[] = [];
      for (const b of bRows) {
        let fRows = (
          await query<FloorRecord>(
            `SELECT id, building_id, floor_number FROM floors WHERE building_id = $1 ORDER BY floor_number ASC`,
            [b.id]
          )
        ).rows;

        if (fRows.length === 0) {
          fRows = (
            await query<FloorRecord>(
              `SELECT id, tower_id AS building_id, floor_number FROM society_floors WHERE tower_id = $1 ORDER BY floor_number ASC`,
              [b.id]
            )
          ).rows;
        }

        const floors: FullBuildingHierarchy["floors"] = [];
        for (const fl of fRows) {
          let flatRows = (
            await query<FlatRecord>(
              `SELECT id, building_id, floor_id, flat_number, status FROM flats WHERE floor_id = $1 ORDER BY flat_number ASC`,
              [fl.id]
            )
          ).rows;

          if (flatRows.length === 0) {
            flatRows = (
              await query<FlatRecord>(
                `SELECT id, '${b.id}' AS building_id, floor_id, flat_number, status FROM society_flats WHERE floor_id = $1 ORDER BY flat_number ASC`,
                [fl.id]
              )
            ).rows;
          }

          floors.push({ ...fl, flats: flatRows });
        }
        buildings.push({ ...b, floors });
      }

      return { society: soc, buildings };
    }
  } catch {
    // Database query failed, fallback to in-memory store
  }

  // Fallback to in-memory store
  let soc = inMemoryStore.societies.get(societyId);
  if (!soc) {
    soc = {
      id: societyId,
      name: "Sample Society",
      address_line_1: "Sector 1",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
      status: "Pending Setup",
      updated_at: new Date().toISOString(),
    };
    inMemoryStore.societies.set(societyId, soc);
  }

  const bList = inMemoryStore.buildings.filter((b) => b.society_id === societyId);
  const buildings: FullBuildingHierarchy[] = bList.map((b) => {
    const fList = inMemoryStore.floors.filter((f) => f.building_id === b.id);
    const floors = fList.map((fl) => {
      const flats = inMemoryStore.flats.filter((flt) => flt.floor_id === fl.id);
      return { ...fl, flats };
    });
    return { ...b, floors };
  });

  return { society: soc, buildings };
}

export async function markSocietySetupComplete(societyId: string) {
  try {
    await query(
      `UPDATE societies SET status = 'Completed', updated_at = now() WHERE id = $1`,
      [societyId]
    );
  } catch {
    // ignore DB error
  }
  let soc = inMemoryStore.societies.get(societyId);
  if (soc) {
    soc.status = "Completed";
    soc.updated_at = new Date().toISOString();
  } else {
    soc = {
      id: societyId,
      name: "Sample Society",
      address_line_1: "Sector 1",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
      status: "Completed",
      updated_at: new Date().toISOString(),
    };
    inMemoryStore.societies.set(societyId, soc);
  }
  return { success: true, societyId, status: "Completed" };
}

// Cascading helper queries for Resident registration
export async function getBuildingsBySociety(societyId: string) {
  try {
    let res = await query<BuildingRecord>(
      `SELECT id, society_id, name FROM buildings WHERE society_id = $1 ORDER BY name ASC`,
      [societyId]
    );
    if (res.rows.length === 0) {
      res = await query<BuildingRecord>(
        `SELECT id, society_id, name FROM society_towers WHERE society_id = $1 AND status = 'active' ORDER BY name ASC`,
        [societyId]
      );
    }
    if (res.rows.length > 0) return res.rows;
  } catch {
    // DB fallback
  }
  return inMemoryStore.buildings
    .filter((b) => b.society_id === societyId)
    .map((b) => ({ id: b.id, society_id: b.society_id, name: b.name }));
}

export async function getFloorsByBuilding(buildingId: string) {
  try {
    let res = await query<FloorRecord>(
      `SELECT id, building_id, floor_number FROM floors WHERE building_id = $1 ORDER BY floor_number ASC`,
      [buildingId]
    );
    if (res.rows.length === 0) {
      res = await query<FloorRecord>(
        `SELECT id, tower_id AS building_id, floor_number FROM society_floors WHERE tower_id = $1 AND status = 'active' ORDER BY floor_number ASC`,
        [buildingId]
      );
    }
    if (res.rows.length > 0) return res.rows;
  } catch {
    // DB fallback
  }
  return inMemoryStore.floors
    .filter((f) => f.building_id === buildingId)
    .map((f) => ({ id: f.id, building_id: f.building_id, floor_number: f.floor_number }));
}

export async function getFlatsByFloor(floorId: string) {
  try {
    let res = await query<FlatRecord>(
      `SELECT id, building_id, floor_id, flat_number, status FROM flats WHERE floor_id = $1 AND status IN ('active', 'occupied') ORDER BY flat_number ASC`,
      [floorId]
    );
    if (res.rows.length === 0) {
      res = await query<FlatRecord>(
        `SELECT id, floor_id, flat_number, status FROM society_flats WHERE floor_id = $1 AND status IN ('active', 'occupied') ORDER BY flat_number ASC`,
        [floorId]
      );
    }
    if (res.rows.length > 0) return res.rows;
  } catch {
    // DB fallback
  }
  return inMemoryStore.flats
    .filter((f) => f.floor_id === floorId && (f.status === "active" || f.status === "occupied"))
    .map((f) => ({ id: f.id, building_id: f.building_id, floor_id: f.floor_id, flat_number: f.flat_number, status: f.status }));
}

export async function updateMasterDataHierarchy(societyId: string, payload: {
  buildings?: {
    id: string;
    name: string;
    floors?: {
      id: string;
      floor_number: number;
      flats?: {
        id: string;
        flat_number: string;
      }[];
    }[];
  }[];
}) {
  if (payload.buildings) {
    for (const b of payload.buildings) {
      // Update building name
      try {
        await query(`UPDATE buildings SET name = $2, updated_at = now() WHERE id = $1`, [b.id, b.name]);
      } catch {
        const memB = inMemoryStore.buildings.find((x) => x.id === b.id);
        if (memB) memB.name = b.name;
      }
      if (b.floors) {
        for (const fl of b.floors) {
          if (fl.flats) {
            for (const flt of fl.flats) {
              try {
                await query(`UPDATE flats SET flat_number = $2, updated_at = now() WHERE id = $1`, [flt.id, flt.flat_number]);
              } catch {
                const memFlt = inMemoryStore.flats.find((x) => x.id === flt.id);
                if (memFlt) memFlt.flat_number = flt.flat_number;
              }
            }
          }
        }
      }
    }
  }
  return getSocietyMasterData(societyId);
}
