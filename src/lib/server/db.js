import mongoose from 'mongoose';

// 你的连接字符串
const MONGODB_URI = "mongodb+srv://yaoshuangting_db_user:84038403@cluster0.8czlqbd.mongodb.net/tideDB?retryWrites=true&w=majority";

export async function connectDB() {
    // 如果已经连接（readyState 为 1）或正在连接（readyState 为 2），则直接返回
    if (mongoose.connection.readyState >= 1) return;

    // 配置连接选项
    const options = {
        // 在报错前尝试连接的时间（毫秒）
        serverSelectionTimeoutMS: 5000, 
        // 保持连接的心跳频率
        heartbeatFrequencyMS: 10000,
        // 允许的最大连接池大小
        maxPoolSize: 10,
    };

    try {
        console.log("--- [DB] 正在尝试连接 MongoDB... ---");
        
        // 执行连接
        await mongoose.connect(MONGODB_URI, options);
        
        console.log("--- ✅ [DB] 数据库连接成功 ---");

        // 监听连接断开事件，以便在断开时能重新触发连接逻辑
        mongoose.connection.on('error', err => {
            console.error('--- ❌ [DB] 运行时错误:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('--- ⚠️ [DB] 连接已断开 ---');
        });

    } catch (err) {
        console.error("--- ❌ [DB] 连接失败: ---");
        
        // 针对 DNS 或网络拒绝的具体提示
        if (err.message.includes('ECONNREFUSED')) {
            console.error(">>> 提示：网络请求被拒绝。请检查：");
            console.error("1. 是否开启了 VPN（尝试关闭或切换模式）；");
            console.error("2. 是否在 MongoDB Atlas 官网将当前 IP 加入了 Network Access 白名单；");
            console.error("3. 尝试连接手机热点以绕过校园网/公司网防火墙。");
        } else {
            console.error(err.message);
        }
        
        // 不要在这里 throw err 导致整个服务器崩溃，让它返回以处理 load 错误
        return; 
    }
}