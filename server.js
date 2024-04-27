const http = require('http')
const Room = require('./models/room')
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: "./config.env"})
console.log(process.env)

// 連接資料庫
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(DB)
    .then(() => {
        console.log('資料庫連線成功')
    }).catch((error) => {
    console.log(error)
    console.log('reason =>',error.reason)
});

const requestListener = async(req, res) => {
    const headers ={
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
      'Content-Type': 'application/json'
    }

    let body =''
    req.on('data', (chunk) => body += chunk)

    if(req.url === '/rooms' && req.method === 'GET'){
      const rooms = await Room.find() // mongoose：find() 的 語法
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: 'success',
        rooms,
      }))
      res.end()
    
    } else if(req.url === '/rooms' && req.method === 'POST') {
      req.on('end', async () => {
        try {
          const data = JSON.parse(body)
          console.log('data', data)
          
          // 存入資料庫
          const newRoom = await Room.create(
              {
                name: data.name,
                price: data.price,
                rating: data.rating
              }
          )
          // response 給 前端
          res.writeHead(200, headers)
          res.write(JSON.stringify({
            status:'success',
            rooms: newRoom
          }))
          res.end()
        } catch (error) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: false,
            message: '欄位不正確 或是 沒有此 ID',
            error: error
          }))
          res.end()
        }
      })
    } else if( req.url === '/rooms' && req.method === 'DELETE'){
      const rooms = await Room.deleteMany({}) // mongoose：deleteMany() 的 語法
      res.writeHead(200, headers)
      res.write(JSON.stringify({
        status: "success",
        rooms
      }))
      res.end()
        
    // 刪除一筆資料
    } else if( req.url.startsWith('/rooms/') && req.method === 'DELETE') {
      // 刪除單筆 findByIdAndDelete()：Room.findByIdAndDelete(id)
        try {
          const id = req.url.split('/').pop()
          const room = await Room.findByIdAndDelete(id)
          const rooms = await Room.find()
          res.writeHead(200, headers)
          res.write(JSON.stringify({
            status: 'success',
            deleteRoom: room, // 欲刪除的那筆舊資料
            rooms
          }))
          res.end()
        } catch (error) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: false,
            message: '欄位不正確 或是 沒有此 ID',
            error: error
          }))
          res.end()
        }
      
    } else if( req.url.startsWith('/rooms/') && req.method === 'PATCH') {
      // 更新單筆 findByIdAndUpdate()：Room.findByIdAndUpdate(id)
      req.on('end', async () => {
        try {
          const id = req.url.split('/').pop()
          const data = JSON.parse(body)
          console.log('data', data);
          const updateRoom = await Room.findByIdAndUpdate(id, data)
          const rooms = await Room.find()
          res.writeHead(200, headers)
          res.write(JSON.stringify({
            status: 'success',
            updateRoom: updateRoom, // 欲更新的那筆舊資料
            rooms
          }))
          res.end()
        } catch (error) {
          res.writeHead(400, headers)
          res.write(JSON.stringify({
            status: false,
            message: '欄位不正確 或是 沒有此 ID',
            error: error
          }))
          res.end()
        }
      })

    } else if(req.method === 'OPTIONS'){
      res.writeHead(200, headers)
      res.end()
        
    } else {
      res.writeHead(404, headers)
      res.write(JSON.stringify({
        status: 'false',
        message: '無此路由'
    }))
      res.end()
    }
}

const server = http.createServer(requestListener)
server.listen(process.env.PORT)

