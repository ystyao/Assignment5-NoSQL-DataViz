import { connectDB } from '$lib/server/db';
import { Tide } from '$lib/server/models/User';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    try {
        await connectDB();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const rawTides = await Tide.find({
            time: { $gte: sevenDaysAgo, $lte: new Date() }
        })
        .sort({ time: -1 }) 
        .lean();

        return {
            tides: JSON.parse(JSON.stringify(rawTides)),
            location: "Vava'u, Tonga - 7-Day History"
        };
    } catch (error) {
        return { tides: [], error: error.message };
    }
}