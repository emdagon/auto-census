
Accounts.onCreateUser(function(options, user) {
    user.profile = {
        name: options.profile.name,
        url: user.services.facebook.link
    };
    return user;
});
