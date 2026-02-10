import mongoose from 'mongoose';

// 如果之前没有定义 collection 名字，Mongoose 会默认找 "tides"
const tideSchema = new mongoose.Schema({
    time: { type: Date, required: true, unique: true },
    height: { type: Number, required: true },
    location: { type: String, default: "Vava'u" }
});

// 强制指定集合名称为 'tides'
export const Tide = mongoose.models.Tide || mongoose.model('Tide', tideSchema, 'tides');