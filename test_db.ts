import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  const res = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('users', 'operators');
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}
run();
