const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres' });

async function test() {
  try {
    const res = await pool.query(`
      SELECT
        s.id,
        s.name,
        CASE 
          WHEN (SELECT COUNT(id) FROM society_towers WHERE society_id = s.id) > 0 
               AND (SELECT COUNT(sf.id) FROM society_flats sf JOIN society_floors fl ON sf.floor_id = fl.id JOIN society_towers st ON fl.tower_id = st.id WHERE st.society_id = s.id) > 0 THEN 'Completed'
          WHEN (SELECT COUNT(id) FROM society_towers WHERE society_id = s.id) > 0 THEN 'In Progress'
          ELSE 'Pending Setup'
        END AS status,
        (SELECT COUNT(id) FROM society_towers WHERE society_id = s.id)::int AS building_count,
        (SELECT COUNT(id) FROM residents WHERE society_id = s.id)::int AS resident_count
      FROM societies s
      INNER JOIN operator_societies os ON os.society_id = s.id
      INNER JOIN operators op ON op.id = os.operator_id
      WHERE op.user_id = '3fc74d8d-7977-4aa3-950f-56da4f4cfb98' AND op.status = 'active'
      ORDER BY s.name ASC
    `);
    console.log("Query executed successfully. Result:");
    console.log(res.rows);
  } catch (err) {
    console.error("Query failed:", err.message);
  } finally {
    pool.end();
  }
}
test();
