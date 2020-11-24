const http = require("http");
const socketIo = require("socket.io");
const app = require("../app");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./helpers/user");

const port = process.env.PORT || 4001;

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
    console.log("User Connects")

    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room }) 

        if (error) return callback(error)

        socket.emit('message', { user: 'admin', text: `Welcome ${user.name}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` })

        socket.join(user.room)

        callback(null, user);
    })

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: message })

        callback();
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
        }
    })
})


server.listen(port, () => console.log(`listening on port ${port}`))
