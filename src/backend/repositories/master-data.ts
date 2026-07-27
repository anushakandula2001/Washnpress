import { query, queryOne } from "@/backend/db/pool";

export type MasterTower = {
  id: string;
  society_id: string;
  name: string;
  status: string;
};

export type MasterFloor = {
  id: string;
  tower_id: string;
  floor_number: number;
  label: string;
  status: string;
};

export type MasterFlat = {
  id: string;
  floor_id: string;
  flat_number: string;
  status: string;
};

export async function listTowersBySociety(societyId: string) {
  return (
    await query<MasterTower>(
      `SELECT id, society_id, name, status FROM society_towers
       WHERE society_id = $1 AND status = 'active' ORDER BY name`,
      [societyId],
    )
  ).rows;
}

export async function listFloorsByTower(towerId: string) {
  return (
    await query<MasterFloor>(
      `SELECT id, tower_id, floor_number, label, status FROM society_floors
       WHERE tower_id = $1 AND status = 'active' ORDER BY floor_number`,
      [towerId],
    )
  ).rows;
}

export async function listFlatsByFloor(floorId: string) {
  return (
    await query<MasterFlat>(
      `SELECT id, floor_id, flat_number, status FROM society_flats
       WHERE floor_id = $1 AND status IN ('active', 'occupied')
       ORDER BY flat_number`,
      [floorId],
    )
  ).rows;
}

export async function getFlatHierarchy(flatId: string) {
  return queryOne<{
    flat_id: string;
    flat_number: string;
    floor_id: string;
    floor_label: string;
    floor_number: number;
    tower_id: string;
    tower_name: string;
    society_id: string;
    society_name: string;
  }>(
    `SELECT f.id AS flat_id, f.flat_number,
            fl.id AS floor_id, fl.label AS floor_label, fl.floor_number,
            t.id AS tower_id, t.name AS tower_name,
            s.id AS society_id, s.name AS society_name
     FROM society_flats f
     JOIN society_floors fl ON fl.id = f.floor_id
     JOIN society_towers t ON t.id = fl.tower_id
     JOIN societies s ON s.id = t.society_id
     WHERE f.id = $1`,
    [flatId],
  );
}

export async function createTower(societyId: string, name: string) {
  return queryOne<MasterTower>(
    `INSERT INTO society_towers (society_id, name) VALUES ($1, $2)
     RETURNING id, society_id, name, status`,
    [societyId, name.trim()],
  );
}

export async function createFloor(towerId: string, floorNumber: number, label?: string) {
  return queryOne<MasterFloor>(
    `INSERT INTO society_floors (tower_id, floor_number, label)
     VALUES ($1, $2, $3)
     RETURNING id, tower_id, floor_number, label, status`,
    [towerId, floorNumber, label?.trim() || `Floor ${floorNumber}`],
  );
}

export async function createFlat(floorId: string, flatNumber: string) {
  return queryOne<MasterFlat>(
    `INSERT INTO society_flats (floor_id, flat_number) VALUES ($1, $2)
     RETURNING id, floor_id, flat_number, status`,
    [floorId, flatNumber.trim()],
  );
}

export async function listServiceAreas(societyId?: string) {
  const params: unknown[] = [];
  let sql = `SELECT sa.*, s.name AS society_name FROM service_areas sa
             JOIN societies s ON s.id = sa.society_id`;
  if (societyId) {
    sql += ` WHERE sa.society_id = $1`;
    params.push(societyId);
  }
  sql += ` ORDER BY s.name, sa.name`;
  return (await query(sql, params)).rows;
}

export async function createServiceArea(data: {
  societyId: string;
  name: string;
  description?: string;
}) {
  return queryOne(
    `INSERT INTO service_areas (society_id, name, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.societyId, data.name, data.description ?? null],
  );
}

export async function listExecutiveAssignments(societyId?: string) {
  const params: unknown[] = [];
  let sql = `SELECT ea.*, s.name AS society_name, sa.name AS service_area_name
             FROM executive_assignments ea
             JOIN societies s ON s.id = ea.society_id
             LEFT JOIN service_areas sa ON sa.id = ea.service_area_id`;
  if (societyId) {
    sql += ` WHERE ea.society_id = $1`;
    params.push(societyId);
  }
  sql += ` ORDER BY ea.created_at DESC`;
  return (await query(sql, params)).rows;
}

export async function createExecutiveAssignment(data: {
  societyId: string;
  fullName: string;
  phone: string;
  serviceAreaId?: string;
}) {
  return queryOne(
    `INSERT INTO executive_assignments (society_id, full_name, phone, service_area_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.societyId, data.fullName, data.phone, data.serviceAreaId ?? null],
  );
}

export async function listHierarchyForSociety(societyId: string) {
  const towers = await listTowersBySociety(societyId);
  const result = [];
  for (const tower of towers) {
    const floors = await listFloorsByTower(tower.id);
    const floorsWithFlats = [];
    for (const floor of floors) {
      const flats = await listFlatsByFloor(floor.id);
      floorsWithFlats.push({ ...floor, flats });
    }
    result.push({ ...tower, floors: floorsWithFlats });
  }
  return result;
}
