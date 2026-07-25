const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/washnpress_dev' });
async function check() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pickups'");
    console.log("pickups:", res.rows);
    const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
    console.log("orders:", res2.rows);
  } catch (e) { console.error(e); } finally { pool.end(); }
}
check();
