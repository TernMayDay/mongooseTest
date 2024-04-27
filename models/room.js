const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    name: String,
    price:{
      type: Number,
      required:[true, '價錢為必填']
    },
    rating: Number,
    createdAt: {
      type: Date,
      default: Date.now,
      select: false // 前台不顯示
    }
  },
  {
    versionKey: false
  }
)

const Room = mongoose.model('Room', roomSchema);

module.exports = Room