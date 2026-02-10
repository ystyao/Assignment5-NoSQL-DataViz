import mongoose from 'mongoose';

// 定义潮汐数据模型
const tideSchema = new mongoose.Schema({
    // time 设为唯一索引，防止同一时间点重复录入
    time: { 
        type: Date, 
        required: true, 
        unique: true 
    },
    height: { 
        type: Number, 
        required: true 
    },
    // 增加 location 以便区分不同地点的数据
    location: { 
        type: String, 
        default: "Vava'u" 
    }
}, { 
    timestamps: true // 自动记录创建和修改时间，方便调试
});

// 导出模型，强制指向 'tides' 集合
export const Tide = mongoose.models.Tide || mongoose.model('Tide', tideSchema, 'tides');