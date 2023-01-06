const express =require('express')
const http=require('http')
const path=require('path')
const app=express()
const socketio=require('socket.io')
const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')
const server=http.createServer(app) // allow to create a web server
const io=socketio(server) // called with raw http server  to connect with the clients
const filter=require('bad-words')
const Filter = require('bad-words')
const {generateMessage,generateLocation}=require('./utils/message')
const {addUser,getUser,removedUser,getUserInRoom}=require('./utils/users')
app.use(express.static(publicDirectoryPath))


//server (emit ) --> client(receive) --> countUpdated
// client(emit)-->server(receive)-->increments counter

io.on('connection',(socket) => {
  console.log('New Websocket Connection!')
  
   socket.on('join',({username,room},callback)=>{
     const {error,user}  =addUser({id:socket.id,username,room})
     if(error){
        return callback(error)
     }

      socket.join(user.room)

      socket.emit('message',generateMessage('Admin','Welcome!')) //initial message
      socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`)) 
      
      io.to(user.room).emit('roomData',{
         room:user.room,
         users:getUserInRoom(user.room)
      })

      callback()

   })
  socket.on('sendMessage',(message,callback)=>{
   const user=getUser(socket.id)
     const fil=new Filter()
     if(fil.isProfane(message)){
         return  callback('Profanity is not allowed')
     }
    // socket.emit('countUpdated',count) // emit for jus one connection
       io.to(user.room).emit('message',generateMessage(user.username,message)) // emits for all available client
       io.to(user.room).emit('roomData',{
         room:user.room,
         users:getUserInRoom(user.room)
      })
       callback()
  })
   
 // predefined method that is 'disconnect'
    socket.on('disconnect',()=>{
        const user2= removedUser(socket.id)
    
        if(user2){
         
         io.to(user2.room).emit('message',generateMessage('Admin',` ${user2.username} has left! `))
         io.to(user2.room).emit('roomData',{
            room:user2.room,
            users:getUserInRoom(user2.room)
         })
        }
    })
    socket.on('send',(coords,callback)=>{
      const user=getUser(socket.id)
       io.to(user.room).emit('locationmessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
       callback('Location send Successfully!')
    })
})


// to call server
server.listen(port,()=>
{
   console.log("server started successfully");
})