import { json } from '@sveltejs/kit';
import { MongooseModel } from '$lib/db/schema'; // 假设你已定义好 Schema
import { TIDE_API_KEY } from '$env/static/private'; // 从 .env 读取密钥

export async function GET({ url }) {
    try {
        // 1. 设置瓦瓦乌的坐标 (纬度/经度)
        const lat = -18.6500;
        const lon = -173.9833;
        
        // 2. 调用外部潮汐 API
        const apiUrl = `https://www.worldtides.info/api/v3?extremes&lat=${lat}&lon=${lon}&key=${TIDE_API_KEY}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok) throw new Error('API 请求失败');

        // 3. 数据清洗与存储
        // 假设你要存入 MongoDB
        const tides = data.extremes.map(item => ({
            time: item.date,
            height: item.height,
            type: item.type, // High 或 Low
            location: "Vava'u"
        }));

        // 使用 Mongoose 批量插入（upsert 避免重复）
        // 这里只是示例逻辑，需根据你的具体 Schema 调整
        await MongooseModel.insertMany(tides, { ordered: false }).catch(e => {
            console.log("忽略重复记录");
        });

        return json({ success: true, message: '数据抓取成功', count: tides.length });
        
    } catch (error) {
        console.error('抓取错误:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}