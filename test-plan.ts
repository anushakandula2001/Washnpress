import { query } from "./src/backend/db/pool";
async function run() {
  const plans = await query("SELECT id, name, features FROM plans LIMIT 1");
  console.log(plans.rows[0]);
  process.exit(0);
}
run();
