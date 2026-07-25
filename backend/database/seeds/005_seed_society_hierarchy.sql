-- Seed Society → Tower → Floor → Flat hierarchy for demo society Green Heights

INSERT INTO society_towers (society_id, name)
SELECT s.id, t.name
FROM societies s
CROSS JOIN (VALUES ('A'), ('B'), ('C')) AS t(name)
WHERE s.name = 'Green Heights'
ON CONFLICT (society_id, name) DO NOTHING;

INSERT INTO society_floors (tower_id, floor_number, label)
SELECT st.id, f.n, 'Floor ' || f.n
FROM society_towers st
JOIN societies s ON s.id = st.society_id
CROSS JOIN generate_series(1, 8) AS f(n)
WHERE s.name = 'Green Heights'
ON CONFLICT (tower_id, floor_number) DO NOTHING;

INSERT INTO society_flats (floor_id, flat_number)
SELECT sf.id,
       st.name || '-' || sf.floor_number || LPAD(flat.n::text, 2, '0')
FROM society_floors sf
JOIN society_towers st ON st.id = sf.tower_id
JOIN societies s ON s.id = st.society_id
CROSS JOIN generate_series(1, 6) AS flat(n)
WHERE s.name = 'Green Heights'
ON CONFLICT (floor_id, flat_number) DO NOTHING;

-- Link seeded resident Asha Nair to a flat if possible
UPDATE residents r
SET flat_id = f.id,
    resident_code = COALESCE(
      r.resident_code,
      'RES-' || LPAD(nextval('resident_code_seq')::text, 6, '0')
    )
FROM society_flats f
JOIN society_floors fl ON fl.id = f.floor_id
JOIN society_towers t ON t.id = fl.tower_id
JOIN societies s ON s.id = t.society_id
JOIN users u ON u.phone = '9876543210'
WHERE r.user_id = u.id
  AND s.name = 'Green Heights'
  AND t.name = 'B'
  AND f.flat_number = 'B-805'
  AND r.flat_id IS NULL;

INSERT INTO service_areas (society_id, name, description)
SELECT s.id, 'Zone A — Towers A & B', 'Morning pickup coverage'
FROM societies s WHERE s.name = 'Green Heights'
ON CONFLICT (society_id, name) DO NOTHING;

INSERT INTO service_areas (society_id, name, description)
SELECT s.id, 'Zone B — Tower C', 'Evening pickup coverage'
FROM societies s WHERE s.name = 'Green Heights'
ON CONFLICT (society_id, name) DO NOTHING;
