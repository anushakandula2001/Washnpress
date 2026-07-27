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
  resident_count: number;
  today_orders_count: number;
  today_pickups_count: number;
  today_deliveries_count: number;
  last_updated: string;
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

export async function listPendingSocieties(opsExecutiveId?: string): Promise<PendingSocietyItem[]> {
  try {
    if (!opsExecutiveId) {
      return [];
    }

    const res = await query<PendingSocietyItem>(`
      SELECT
        s.id,
        s.name,
        s.address_line_1,
        s.city,
        s.state,
        s.pincode,
        CASE 
          WHEN (SELECT COUNT(id) FROM society_towers WHERE society_id = s.id) > 0 
               AND (SELECT COUNT(sf.id) FROM society_flats sf JOIN society_floors fl ON sf.floor_id = fl.id JOIN society_towers st ON fl.tower_id = st.id WHERE st.society_id = s.id) > 0 THEN 'Completed'
          WHEN (SELECT COUNT(id) FROM society_towers WHERE society_id = s.id) > 0 THEN 'In Progress'
          ELSE 'Pending Setup'
        END AS status,
        (SELECT COUNT(id) FROM society_towers WHERE society_id = s.id)::int AS building_count,
        (SELECT COUNT(id) FROM residents WHERE society_id = s.id)::int AS resident_count,
        (
          SELECT COUNT(o.id) FROM orders o 
          JOIN pickups p ON p.id = o.pickup_id 
          JOIN residents r ON r.id = p.resident_id 
          WHERE r.society_id = s.id AND DATE(o.created_at) = CURRENT_DATE
        )::int AS today_orders_count,
        (
          SELECT COUNT(p.id) FROM pickups p 
          JOIN residents r ON r.id = p.resident_id 
          WHERE r.society_id = s.id AND DATE(p.scheduled_for) = CURRENT_DATE
        )::int AS today_pickups_count,
        (
          SELECT COUNT(o.id) FROM orders o 
          JOIN pickups p ON p.id = o.pickup_id 
          JOIN residents r ON r.id = p.resident_id 
          WHERE r.society_id = s.id AND DATE(o.updated_at) = CURRENT_DATE AND o.status = 'delivered'
        )::int AS today_deliveries_count,
        COALESCE(s.updated_at, s.created_at, NOW()) AS last_updated
      FROM societies s
      INNER JOIN operator_societies os ON os.society_id = s.id
      INNER JOIN operators op ON op.id = os.operator_id
      WHERE op.user_id = $1 AND op.status = 'active'
      ORDER BY s.name ASC
    `, [opsExecutiveId]);

    return res.rows;
  } catch (err) {
    console.error("listPendingSocieties:", err);
    return [];
  }
}

export async function checkExecutiveAssignment(executiveUserId: string, societyId: string): Promise<boolean> {
  const res = await queryOne<{ id: string }>(
    `SELECT os.society_id as id 
     FROM operator_societies os
     JOIN operators op ON op.id = os.operator_id
     WHERE op.user_id = $1 AND os.society_id = $2 AND op.status = 'active'`,
    [executiveUserId, societyId]
  );
  return !!res;
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
    let buildingId: string | undefined;

    // Use current schema: society_towers
    try {
      const tRes = await queryOne<{id: string}>(
        `INSERT INTO society_towers (society_id, name, status) VALUES ($1, $2, 'active')
         RETURNING id`,
        [data.societyId, buildingName]
      );
      buildingId = tRes?.id;
    } catch (err) { console.error("DB Error society_towers:", err); }

    if (buildingId) {
      for (let f = 1; f <= floorsCount; f++) {
        let floorId: string | undefined;

        try {
          const sfRes = await queryOne<{id: string}>(
            `INSERT INTO society_floors (tower_id, floor_number, label, status) VALUES ($1, $2, $3, 'active')
             RETURNING id`,
            [buildingId, f, `Floor ${f}`]
          );
          floorId = sfRes?.id;
        } catch (err) { console.error("DB Error society_floors:", err); }

        if (floorId) {
          for (let i = 1; i <= flatsCount; i++) {
            const flatNum = generateFlatNumber(buildingName, f, i, data.numberingFormat, data.customPrefix);
            
            try {
              await query(
                `INSERT INTO society_flats (floor_id, flat_number, status, label) VALUES ($1, $2, 'Vacant', $3)`,
                [floorId, flatNum, flatNum]
              );
            } catch (err) { console.error("DB Error society_flats:", err); }
          }
        }
      }

      try {
        await query(
          `UPDATE societies SET status = 'In Progress', updated_at = now() WHERE id = $1 AND status = 'Pending Setup'`,
          [data.societyId]
        );
      } catch {}
      
      return getSocietyMasterData(data.societyId);
    }
  } catch (err) {
    console.error("Critical DB error in generation:", err);
  }

  throw new Error("Failed to create building structure in PostgreSQL");
}

export async function getSocietyMasterData(societyId: string) {
  try {
    const res = await query<{
      id: string;
      name: string;
      address_line_1: string;
      city: string;
      state: string;
      pincode: string;
      status: string;
      updated_at: string;
    }>(`SELECT id, name, address_line_1, city, state, pincode, status, updated_at FROM societies WHERE id = $1`, [societyId]);

    const soc = res.rows[0];
    if (soc) {
      let bRows: BuildingRecord[] = [];
      try {
        bRows = (await query<BuildingRecord>(`SELECT id, society_id, name FROM society_towers WHERE society_id = $1 ORDER BY name ASC`, [societyId])).rows;
      } catch {}

      const buildings: FullBuildingHierarchy[] = [];
      for (const b of bRows) {
        let fRows: FloorRecord[] = [];
        try {
          fRows = (await query<FloorRecord>(`SELECT id, tower_id AS building_id, floor_number FROM society_floors WHERE tower_id = $1 ORDER BY floor_number ASC`, [b.id])).rows;
        } catch {}

        const floors: FullBuildingHierarchy["floors"] = [];
        for (const fl of fRows) {
          let flatRows: FlatRecord[] = [];
          try {
            flatRows = (await query<FlatRecord>(`SELECT id, '${b.id}' AS building_id, floor_id, flat_number, status FROM society_flats WHERE floor_id = $1 ORDER BY flat_number ASC`, [fl.id])).rows;
          } catch {}

          floors.push({ ...fl, flats: flatRows });
        }
        buildings.push({ ...b, floors });
      }

      return { society: soc, buildings };
    }
  } catch (err) {
    console.error("getSocietyMasterData failed:", err);
  }

  return { society: undefined, buildings: [] };
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
  return { success: true, societyId, status: "Completed" };
}

// Cascading helper queries for Resident registration
export async function getBuildingsBySociety(societyId: string) {
  try {
    const res = await query<BuildingRecord>(
      `
      SELECT
        id,
        society_id,
        name
      FROM society_towers
      WHERE society_id = $1
      ORDER BY name ASC
      `,
      [societyId]
    );

    console.log("Society:", societyId);
    console.log("Buildings:", res.rows);

    return res.rows;
  } catch (err) {
    console.error("getBuildingsBySociety()", err);
    return [];
  }
}

export async function getFloorsByBuilding(buildingId: string) {
  try {
    const res = await query<FloorRecord>(
      `SELECT id, tower_id AS building_id, floor_number FROM society_floors WHERE tower_id = $1 AND status = 'active' ORDER BY floor_number ASC`,
      [buildingId]
    );
    return res.rows;
  } catch (err) {
    console.error("getFloorsByBuilding()", err);
    return [];
  }
}

export async function getFlatsByFloor(floorId: string) {
  try {
    console.log("Selected Floor:", floorId);
    const res = await query<FlatRecord>(
      `SELECT
          id,
          floor_id,
          flat_number,
          status
      FROM society_flats
      WHERE floor_id = $1
      AND status = 'active'
      ORDER BY flat_number;`,
      [floorId]
    );
    console.log("Returned Flats:", res.rows);
    return res.rows;
  } catch (err) {
    console.error("getFlatsByFloor()", err);
    return [];
  }
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
        status?: string;
      }[];
    }[];
  }[];
}) {
  if (payload.buildings) {
    // 1. Gather all incoming IDs to handle deletions
    const incomingBuildingIds = new Set<string>();
    const incomingFloorIds = new Set<string>();
    const incomingFlatIds = new Set<string>();

    for (const b of payload.buildings) {
      if (!b.id.startsWith("bld-")) incomingBuildingIds.add(b.id);
      if (b.floors) {
        for (const fl of b.floors) {
          if (!fl.id.startsWith("flr-")) incomingFloorIds.add(fl.id);
          if (fl.flats) {
            for (const flt of fl.flats) {
              if (!flt.id.startsWith("flt-")) incomingFlatIds.add(flt.id);
            }
          }
        }
      }
    }

    try {
      // 2. Fetch current data to figure out what to delete
      const currentData = await getSocietyMasterData(societyId);
      if (currentData.buildings) {
        for (const cb of currentData.buildings) {
          if (!incomingBuildingIds.has(cb.id)) {
            await query(`DELETE FROM society_towers WHERE id = $1`, [cb.id]);
            continue; // Cascade handles floors and flats if DB has it, otherwise we'd need to manually delete
          }
          if (cb.floors) {
            for (const cfl of cb.floors) {
              if (!incomingFloorIds.has(cfl.id)) {
                await query(`DELETE FROM society_floors WHERE id = $1`, [cfl.id]);
                continue;
              }
              if (cfl.flats) {
                for (const cflt of cfl.flats) {
                  if (!incomingFlatIds.has(cflt.id)) {
                    await query(`DELETE FROM society_flats WHERE id = $1`, [cflt.id]);
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      // ignore DB errors during delete phase
    }

    // 3. Upsert operations
    for (const b of payload.buildings) {
      let buildingId = b.id;
      
      if (buildingId.startsWith("bld-")) {
        try {
          const res = await queryOne<{ id: string }>(`INSERT INTO society_towers (society_id, name, status) VALUES ($1, $2, 'active') RETURNING id`, [societyId, b.name]);
          if (res) buildingId = res.id;
        } catch (err) { console.error("DB Insert society_towers failed:", err); }
      } else {
        try {
          await query(`UPDATE society_towers SET name = $2 WHERE id = $1`, [buildingId, b.name]);
        } catch (err) { console.error("DB Update society_towers failed:", err); }
      }

      if (b.floors) {
        for (const fl of b.floors) {
          let floorId = fl.id;

          if (floorId.startsWith("flr-")) {
            try {
              const res = await queryOne<{ id: string }>(`INSERT INTO society_floors (tower_id, floor_number, status, label) VALUES ($1, $2, 'active', $3) RETURNING id`, [buildingId, fl.floor_number, `Floor ${fl.floor_number}`]);
              if (res) floorId = res.id;
            } catch (err) { console.error("DB Insert society_floors failed:", err); }
          } else {
            try {
              await query(`UPDATE society_floors SET floor_number = $2 WHERE id = $1`, [floorId, fl.floor_number]);
            } catch (err) { console.error("DB Update society_floors failed:", err); }
          }

          if (fl.flats) {
            for (const flt of fl.flats) {
              if (flt.id.startsWith("flt-")) {
                try {
                  await query(`INSERT INTO society_flats (floor_id, flat_number, status, label) VALUES ($1, $2, $3, $4)`, [floorId, flt.flat_number, flt.status || 'Vacant', flt.flat_number]);
                } catch (err) { console.error("DB Insert society_flats failed:", err); }
              } else {
                try {
                  await query(`UPDATE society_flats SET flat_number = $2, status = $3 WHERE id = $1`, [flt.id, flt.flat_number, flt.status || 'Vacant']);
                } catch (err) { console.error("DB Update society_flats failed:", err); }
              }
            }
          }
        }
      }
    }
  }
  return getSocietyMasterData(societyId);
}
