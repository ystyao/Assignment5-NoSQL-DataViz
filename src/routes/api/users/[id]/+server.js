import { json } from '@sveltejs/kit';
import { Tide } from '$lib/server/models/User'; // 假设你的 User 模型也在这里
import mongoose from 'mongoose';

/**
 * GET: 获取特定 ID 的用户信息
 */
export async function GET({ params }) {
    try {
        const { id } = params;

        // 如果你也想在这里查询潮汐数据，可以根据逻辑修改
        // 这里演示查询 User 模型（假设你在 User.js 里也导出了 User）
        // const user = await User.findById(id); 

        // 示例：返回 ID 确认
        return json({ message: `正在获取 ID 为 ${id} 的用户数据` });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}

/**
 * PATCH: 更新特定 ID 的用户或相关设置
 */
export async function PATCH({ params, request }) {
    try {
        const { id } = params;
        const body = await request.json(); // 获取前端发来的修改内容

        // 示例：更新逻辑
        // await User.findByIdAndUpdate(id, body);

        return json({ success: true, message: `用户 ${id} 已更新` });
    } catch (error) {
        return json({ error: error.message }, { status: 400 });
    }
}

/**
 * DELETE: 删除特定 ID 的用户
 */
export async function DELETE({ params }) {
    try {
        const { id } = params;

        // 示例：删除逻辑
        // await User.findByIdAndDelete(id);

        return json({ success: true, message: `用户 ${id} 已删除` });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}