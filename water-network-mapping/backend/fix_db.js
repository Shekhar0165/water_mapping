const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'water_network_db',
    password: '6012',
    port: 5432,
});

async function run() {
    try {
        await client.connect();

        // Check if users table exists and what the role column type is
        console.log("Altering column type to varchar to bypass enum constraint temporarily...");
        await client.query("ALTER TABLE users ALTER COLUMN role DROP DEFAULT");
        await client.query("ALTER TABLE users ALTER COLUMN role TYPE varchar(255) USING role::text");

        console.log("Updating old role values...");
        await client.query("UPDATE users SET role = 'super_admin' WHERE role = 'admin'");
        await client.query("UPDATE users SET role = 'city_planner' WHERE role = 'planner'");

        console.log("Checking if users_role_enum exists to drop it...");
        const res = await client.query(`
      SELECT exists (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum');
    `);

        if (res.rows[0].exists) {
            console.log("Dropping old users_role_enum to let TypeORM recreate it...");
            await client.query("DROP TYPE users_role_enum CASCADE").catch(e => console.log(e.message));
        }

        console.log("Database patch completed successfully. You can restart the NestJS server.");
    } catch (error) {
        console.error("Failed to patch database:", error);
    } finally {
        await client.end();
    }
}

run();
