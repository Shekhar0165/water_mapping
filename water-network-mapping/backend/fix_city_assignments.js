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

        console.log("=== FIXING DATA INTEGRITY ISSUES ===\n");

        // Step 1: Show current state
        console.log("1. Current state:");
        const stats = await client.query(`
            SELECT
                'Users with no cityId' as entity,
                COUNT(*) as count
            FROM users
            WHERE "cityId" IS NULL AND role != 'super_admin'
            UNION ALL
            SELECT 'Nodes with no cityId', COUNT(*) FROM network_nodes WHERE "cityId" IS NULL
            UNION ALL
            SELECT 'Pipes with no cityId', COUNT(*) FROM network_pipes WHERE "cityId" IS NULL
            UNION ALL
            SELECT 'Complaints with no cityId', COUNT(*) FROM complaints WHERE "cityId" IS NULL
        `);
        console.table(stats.rows);

        // Step 2: Get the super admin's city (will use this as default)
        const superAdminRes = await client.query(`
            SELECT "cityId" FROM users WHERE role = 'super_admin' AND "cityId" IS NOT NULL LIMIT 1
        `);
        const defaultCityId = superAdminRes.rows[0]?.cityId || 'SAH-UP';
        console.log(`\n2. Using default cityId: ${defaultCityId}`);

        // Step 3: Update city_planner with no cityId
        console.log("\n3. Updating city_planners without cityId...");
        const updatePlannersRes = await client.query(`
            UPDATE users
            SET "cityId" = $1
            WHERE role = 'city_planner' AND "cityId" IS NULL
            RETURNING email, "cityId"
        `, [defaultCityId]);
        console.log(`Updated ${updatePlannersRes.rowCount} city planners:`);
        console.table(updatePlannersRes.rows);

        // Step 4: Update workers with no cityId
        console.log("\n4. Updating workers without cityId...");
        const updateWorkersRes = await client.query(`
            UPDATE users
            SET "cityId" = $1
            WHERE role = 'worker' AND "cityId" IS NULL
            RETURNING email, "cityId"
        `, [defaultCityId]);
        console.log(`Updated ${updateWorkersRes.rowCount} workers`);

        // Step 5: Update ALL nodes with no cityId
        console.log("\n5. Updating network nodes without cityId...");
        const updateNodesRes = await client.query(`
            UPDATE network_nodes
            SET "cityId" = $1
            WHERE "cityId" IS NULL
        `, [defaultCityId]);
        console.log(`Updated ${updateNodesRes.rowCount} nodes`);

        // Step 6: Update ALL pipes with no cityId
        console.log("\n6. Updating network pipes without cityId...");
        const updatePipesRes = await client.query(`
            UPDATE network_pipes
            SET "cityId" = $1
            WHERE "cityId" IS NULL
        `, [defaultCityId]);
        console.log(`Updated ${updatePipesRes.rowCount} pipes`);

        // Step 7: Now update complaints
        console.log("\n7. Updating complaints...");

        // 7a. Update from reporter
        const updateFromReporter = await client.query(`
            UPDATE complaints c
            SET "cityId" = u."cityId"
            FROM users u
            WHERE c.reported_by = u.id
            AND c."cityId" IS NULL
            AND u."cityId" IS NOT NULL
        `);
        console.log(`  - From reporter: ${updateFromReporter.rowCount} complaints`);

        // 7b. Update from pipe
        const updateFromPipe = await client.query(`
            UPDATE complaints c
            SET "cityId" = p."cityId"
            FROM network_pipes p
            WHERE c.nearest_pipe_id = p.id
            AND c."cityId" IS NULL
            AND p."cityId" IS NOT NULL
        `);
        console.log(`  - From pipe: ${updateFromPipe.rowCount} complaints`);

        // 7c. For any remaining orphaned complaints, assign default city
        const updateOrphanComplaints = await client.query(`
            UPDATE complaints
            SET "cityId" = $1
            WHERE "cityId" IS NULL
        `, [defaultCityId]);
        console.log(`  - Orphaned complaints: ${updateOrphanComplaints.rowCount} complaints`);

        // Step 8: Final summary
        console.log("\n=== FINAL STATE ===");
        const finalStats = await client.query(`
            SELECT
                'Users' as entity,
                COUNT(*) as total_count,
                COUNT("cityId") as with_city,
                COUNT(*) - COUNT("cityId") as without_city
            FROM users
            UNION ALL
            SELECT 'Nodes', COUNT(*), COUNT("cityId"), COUNT(*) - COUNT("cityId") FROM network_nodes
            UNION ALL
            SELECT 'Pipes', COUNT(*), COUNT("cityId"), COUNT(*) - COUNT("cityId") FROM network_pipes
            UNION ALL
            SELECT 'Complaints', COUNT(*), COUNT("cityId"), COUNT(*) - COUNT("cityId") FROM complaints
        `);
        console.table(finalStats.rows);

        console.log("\n✅ Database fix completed successfully!");
        console.log("\n⚠️  IMPORTANT: All entities have been assigned to city: " + defaultCityId);
        console.log("   If you need to assign different cities, please update them via the UI.");

    } catch (error) {
        console.error("❌ Failed to fix database:", error);
    } finally {
        await client.end();
    }
}

run();
