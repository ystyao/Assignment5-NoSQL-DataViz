import { connectDB } from '$lib/server/db';
import { Tide } from '$lib/server/models/User';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    try {
        await connectDB();

        // 保持原有逻辑：取过去 7 天的数据
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const rawTides = await Tide.find({
            time: { $gte: sevenDaysAgo }
        })
        .sort({ time: -1 }) 
        .lean();

        return {
            // 将数据库对象转换为纯 JSON 格式
            tides: rawTides.map(t => ({
                id: t._id.toString(), // 显式转换 ID 方便前端操作
                time: t.time.toISOString(),
                height: t.height,
                location: t.location
            })),
            location: "Vava'u, Tonga - 7-Day History"
        };
    } catch (error) {
        console.error("Load Error:", error);
        return { tides: [], error: error.message };
    }
}

/** @type {import('./$types').Actions} */
export const actions = {
    // 增加或修改数据
    upsert: async ({ request }) => {
        await connectDB();
        const formData = await request.formData();
        
        const id = formData.get('id');
        const time = formData.get('time');
        const height = parseFloat(formData.get('height'));
        const location = "Vava'u"; // 默认地点

        if (!time || isNaN(height)) {
            return fail(400, { message: 'Missing time or invalid height' });
        }

        try {
            if (id && id !== 'null') {
                // UPDATE: 根据 ID 更新
                await Tide.findByIdAndUpdate(id, { time, height });
            } else {
                // CREATE: 新增记录
                await Tide.create({ time, height, location });
            }
            return { success: true };
        } catch (error) {
            // 处理 MongoDB 唯一索引冲突 (time 字段已在 Schema 中设为 unique)
            if (error.code === 11000) {
                return fail(400, { message: 'A record with this exact timestamp already exists.' });
            }
            return fail(500, { message: error.message });
        }
    },

    // 删除数据
    delete: async ({ request }) => {
        await connectDB();
        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return fail(400, { message: 'Missing record ID' });

        try {
            await Tide.findByIdAndDelete(id);
            return { success: true };
        } catch (error) {
            return fail(500, { message: 'Delete failed: ' + error.message });
        }
    }
};