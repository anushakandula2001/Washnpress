const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres' });
pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'society_flats' AND column_name = 'status'")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
