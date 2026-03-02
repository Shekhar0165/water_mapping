const API_URL = 'http://127.0.0.1:3001';
const ADMIN_EMAIL = 'shekhar@gmail.com';
const ADMIN_PASSWORD = 'Qwerty@123';

async function seedData() {
    try {
        console.log('1. Authenticating as Super Admin...');
        const authRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });
        const authData = await authRes.json();
        if (!authRes.ok) throw new Error(authData.message || 'Login failed');

        const token = authData.accessToken;
        console.log('✅ Logged in successfully.\n');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('2. Creating Node A (Pump in New Delhi)...');
        const nodeARes = await fetch(`${API_URL}/maps/nodes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                type: 'Pump',
                status: 'Active',
                latitude: 28.6139,
                longitude: 77.2090
            })
        });
        const nodeA = await nodeARes.json();
        if (!nodeARes.ok) {
            console.log('❌ Node A Creation Failed:', nodeA);
            return;
        }
        console.log(`✅ Created Node A (ID: ${nodeA.id})\n`);

        console.log('3. Creating Node B (Tank in New Delhi)...');
        const nodeBRes = await fetch(`${API_URL}/maps/nodes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                type: 'Tank',
                status: 'Active',
                latitude: 28.6200,
                longitude: 77.2150
            })
        });
        const nodeB = await nodeBRes.json();
        console.log(`✅ Created Node B (ID: ${nodeB.id})\n`);

        console.log('4. Creating a Pipe connecting Node A to Node B...');
        const pipeRes = await fetch(`${API_URL}/maps/pipes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                material: 'PVC',
                diameter_mm: 500,
                status: 'Active',
                start_node_id: nodeA.id,
                end_node_id: nodeB.id
            })
        });
        const pipe = await pipeRes.json();
        console.log(`✅ Created Pipe connecting A to B (ID: ${pipe.id})\n`);

        console.log('🎉 Success! Refresh your Web Dashboard Map. You should now see a bright blue pipe drawn on the map in New Delhi!');

    } catch (error) {
        console.error('❌ Error creating data:', error.message);
    }
}

seedData();
