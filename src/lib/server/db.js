import mongoose from 'mongoose';

// 直接使用你的连接字符串进行测试
// 我在 .net/ 后面增加了 'tideDB' 作为数据库名称
const MONGODB_URI = "mongodb+srv://yaoshuangting_db_user:84038403@cluster0.8czlqbd.mongodb.net/tideDB?retryWrites=true&w=majority";

export async function connectDB() {
    if (mongoose.connection.readyState === 1) return;

    try {
        console.log("--- [DB] 正在尝试连接 MongoDB... ---");
        await mongoose.connect(MONGODB_URI);
        console.log("--- ✅ [DB] 数据库连接成功 ---");
    } catch (err) {
        console.error("--- ❌ [DB] 连接失败: ---");
        console.error(err.message);
        throw err;
    }
}