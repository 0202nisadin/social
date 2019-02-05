const Hapi = require("hapi");
const server = new Hapi.Server();
const mongoose = require('mongoose');
const User = require('./database_models/user_model');
const node_connect_db = mongoose.connect('mongodb://localhost/node_connect');

/*************/

server.connection({ port: 3000 });

const io = require("socket.io")(server.listener);

server.start(console.log("Server Running"));

server.route({
    method: "GET",
    path: "/",
    handler: function(request, reply) {
        reply.view("landing");
    }
});

server.register(require("vision"), function(err) {
    server.views({
        engines: {
            ejs: require("ejs")
        },
        relativeTo: __dirname,
        path: "views"
    })
});

server.register(require("inert"), function(err) {

});

server.register(require("hapi-auth-cookie"));
server.auth.strategy("simple-cookie-strategy", "cookie", {
    cookie: "node_connect_cookie",
    password: "abcdefabcdefabcdefabcdefabcdefabcdef", //doit au moins faire 32char pour le hash
    isSecure: false
});

server.register({
    register: require("./routes/home")
}, function(err) {
    if (err) {
        return;
    }
});

server.register({
    register: require("./routes/user")
}, function(err) {
    if (err) {
        return;
    }
});

server.register({
    register: require("./routes/user_profile")
}, function(err) {
    if (err) {
        return;
    }
});

server.register({
    register: require("./routes/friends")
}, function(err) {
    if (err) {
        return;
    }
});

server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
        directory: {
            path: "public"
        }
    }
});

server.route({
    method: "GET",
    path: "/user_profile_images/{param*}",
    handler: {
        directory: {
            path: "user_profile_images"
        }
    }
});

io.on("connection", function(socket) {
    socket.on("attach_user_info", function(user_info) {
        socket.member_id = user_info.member_id;
        socket.user_name = user_info.user_name;
    })
    socket.on("message_from_client", function(usr_msg) {
        var all_connected_clients = io.sockets.connected;
        for (var socket_id in all_connected_clients) {
            if (all_connected_clients[socket_id].member_id === usr_msg.friend_member_id) {
                var message_object = { "msg": usr_msg.msg, "user_name": socket.user_name };
                all_connected_clients[socket_id].emit("message_from_server", message_object);
                break;
            }
        }
        //socket.emit("message_from_server", "got the message");
    })
})