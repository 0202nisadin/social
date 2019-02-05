const User = require('../../database_models/user_model')
const UserStatus = require('../../database_models/user_statuses_model')

module.exports.register = function(plugin, options, next) {
    plugin.route([{
            method: 'GET',
            path: '/home',
            config: {
                auth: "simple-cookie-strategy",
                handler: function(request, reply) {
                    var name = request.auth.credentials.name;
                    var user_statuses;
                    UserStatus.find({}, function(err, statuses) {
                        user_statuses = statuses;
                        return reply.view("home", { name: name, user_statuses: user_statuses })
                    });
                }
            }
        },
        {
            method: 'POST',
            path: '/user_status/create',
            config: {
                auth: "simple-cookie-strategy",
                handler: function(request, reply) {
                    User.findOne({ "email": request.auth.credentials.user }, function(err, user) {
                        var user_status = new UserStatus({
                            "user_email": request.auth.credentials.user,
                            "user_status": request.payload.user_status,
                            "name": request.auth.credentials.name,
                            "profile_pic": user.user_profile[0].profile_pic
                                //"profile_pic": request.auth.credentials.profile_pic
                        })
                        user_status.save(function(err, result) {
                            if (err) {
                                reply("Error during submitting status").code(400)
                            } else {
                                reply(result);
                            };
                        });
                    });
                }
            }
        }
    ]);
    next();
}

module.exports.register.attributes = {
    pkg: require('./package.json')
};