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
        console.log("Connected to database");

        // Step 1: Check current state
        const complaintsCountRes = await client.query("SELECT COUNT(*) FROM complaints WHERE \"cityId\" IS NULL");
        console.log(`Found ${complaintsCountRes.rows[0].count} complaints without cityId`);

        // Step 2: Update complaints that have a reporter - inherit reporter's cityId
        console.log("\nUpdating complaints with reporter to inherit reporter's cityId...");
        const updateFromReporter = await client.query(`
            UPDATE complaints c
            SET "cityId" = u."cityId"
            FROM users u
            WHERE c.reported_by = u.id
            AND c."cityId" IS NULL
            AND u."cityId" IS NOT NULL
        `);
        console.log(`Updated ${updateFromReporter.rowCount} complaints from reporter cityId`);

        // Step 3: Update complaints that have nearest_pipe - inherit pipe's cityId
        console.log("\nUpdating complaints with nearest_pipe to inherit pipe's cityId...");
        const updateFromPipe = await client.query(`
            UPDATE complaints c
            SET "cityId" = p."cityId"
            FROM network_pipes p
            WHERE c.nearest_pipe_id = p.id
            AND c."cityId" IS NULL
            AND p."cityId" IS NOT NULL
        `);
        console.log(`Updated ${updateFromPipe.rowCount} complaints from nearest_pipe cityId`);

        // Step 4: Check remaining nulls
        const remainingNullsRes = await client.query("SELECT COUNT(*) FROM complaints WHERE \"cityId\" IS NULL");
        console.log(`\n${remainingNullsRes.rows[0].count} complaints still have no cityId (will be visible only to super_admin)`);

        // Step 5: Show summary by city
        console.log("\n--- Complaints by City Summary ---");
        const summaryRes = await client.query(`
            SELECT
                COALESCE("cityId", 'NULL') as city,
                COUNT(*) as count
            FROM complaints
            GROUP BY "cityId"
            ORDER BY count DESC
        `);
        console.table(summaryRes.rows);

        console.log("\n✅ Complaint cityId fix completed successfully!");

    } catch (error) {
        console.error("❌ Failed to fix complaint cityIds:", error);
    } finally {
        await client.end();
    }
}

run();
