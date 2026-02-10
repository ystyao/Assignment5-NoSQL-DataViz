import { connectDB } from '$lib/server/db';
import { Tide } from '$lib/server/models/User';

let hasSynced = false;

async function syncTideData() {
    if (hasSynced) return;

    try {
        await connectDB();
        const lat = -18.65;
        const lon = -173.98;
        
        const apiUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=tide_height&past_days=7&forecast_days=1&timezone=GMT`;

        console.log('--- [Sync] Syncing Tonga historical data... ---');

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.hourly && data.hourly.tide_height) {
            const operations = data.hourly.time.map((timeStr, index) => ({
                updateOne: {
                    filter: { time: new Date(timeStr) },
                    update: { 
                        $set: { 
                            height: data.hourly.tide_height[index],
                            location: "Vava'u, Tonga - Historical"
                        } 
                    },
                    upsert: true
                }
            }));
            await Tide.bulkWrite(operations);
            console.log('--- ✅ [Sync] Real data synced successfully ---');
            hasSynced = true;
        } else {
            // Fallback to English Mock Data
            const demoTimes = [];
            const now = new Date();
            for(let i=0; i<168; i++) {
                const time = new Date(now.getTime() - i * 3600000);
                demoTimes.push({
                    time: time,
                    height: Math.sin((i * Math.PI) / 6.2) + 1.25,
                    location: "Vava'u, Tonga (Archive)"
                });
            }
            const ops = demoTimes.map(d => ({
                updateOne: { filter: { time: d.time }, update: { $set: d }, upsert: true }
            }));
            await Tide.bulkWrite(ops);
            console.log('--- ✅ [Sync] Mock history injected ---');
            hasSynced = true;
        }
    } catch (err) {
        console.error('--- ❌ [Sync Error] ---', err.message);
    }
}

syncTideData();

export async function handle({ event, resolve }) {
    return await resolve(event);
}