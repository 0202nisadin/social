const User = require("../../database_models/user_model.js");

module.exports.register = function(server, options, next) {
    server.route([{
            method: "POST",
            path: "/sign_up",
            handler: function(request, reply) {
                User.findOne({ "email": request.payload.email }, function(err, existing_user) {
                    if (existing_user) {
                        reply("This email has already been registered. Try again with another email").code(400);
                    } else {
                        var user = new User({ "email": request.payload.email, "name": request.payload.name, "password": request.payload.password, "user_profile": {} });
                        user.save(function(err, saved_user_record) {
                            if (err) {
                                reply("Error during signing up").code(400);
                            } else {
                                reply("Successfully signed up");
                            }
                        });
                    }
                });
            }
        },
        {
            method: "POST",
            path: "/login",
            handler: function(request, reply) {
                User.findOne({
                        "email": request.payload.email,
                        "password": request.payload.password
                    },
                    function(err, valid_user) {
                        if (valid_user) {
                            request.cookieAuth.set({ "user": valid_user.email, "member_id": valid_user.member_id, "name": valid_user.name });
                            reply("Cookie created");
                        } else {
                            reply("Erreur while creating cookie").code(400);
                        }
                    }
                )
            }
        },
        {
            method: 'POST',
            path: '/logout',
            handler: function(request, reply) {
                request.cookieAuth.clear();
                reply("LogOut done");
            }
        }
    ]);

    next();
};

module.exports.register.attributes = {
    pkg: require("./package.json")
};