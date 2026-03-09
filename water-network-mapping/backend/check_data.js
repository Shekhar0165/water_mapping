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
        console.log("Connected to database\n");

        console.log("=== USERS ===");
        const usersRes = await client.query('SELECT id, email, role, "cityId" FROM users LIMIT 10');
        console.table(usersRes.rows);

        console.log("\n=== NETWORK NODES ===");
        const nodesRes = await client.query('SELECT id, type, status, "cityId" FROM network_nodes LIMIT 5');
        console.table(nodesRes.rows);

        console.log("\n=== NETWORK PIPES ===");
        const pipesRes = await client.query('SELECT id, material, status, "cityId" FROM network_pipes LIMIT 5');
        console.table(pipesRes.rows);

        console.log("\n=== COMPLAINTS ===");
        const complaintsRes = await client.query(`
            SELECT
                c.id,
                c.type,
                c.status,
                c."cityId",
                c.reported_by,
                c.nearest_pipe_id,
                u."cityId" as reporter_city,
                p."cityId" as pipe_city
            FROM complaints c
            LEFT JOIN users u ON c.reported_by = u.id
            LEFT JOIN network_pipes p ON c.nearest_pipe_id = p.id
            LIMIT 10
        `);
        console.table(complaintsRes.rows);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

run();
