
People = new Meteor.Collection("people");

Meteor.subscribe("people");

Session.set('filter', false);

Template.publish.events({
    'click #filepicker': function () {
        filepicker.setKey("AEXVIEwqRjqBwkor38yuJz");

        filepicker.pick({
                mimetypes: ['image/*', 'text/plain'],
                container: 'window',
                services: ['COMPUTER', 'FACEBOOK', 'FLICKR', 'WEBCAM']
            },
            function(FPFile) {
                $("#picture").val(FPFile.url);
                $("#picture-preview").attr("src", FPFile.url);
            },
            function(FPError) {
                $("#picture").val("");
                $("#picture-preview").attr("src", "/images/missing.jpg");
                alert("No ha seleccionado una foto!");
            }
        );
    },
    'click #save': function() {
        if (Meteor.user()) {

            People.insert({
                name: $("#name").val(),
                description: $("#description").val(),
                picture: $("#picture").val(),
                relationship: $("#relationship").val(),
                status: $("#status").val(),
                age: $("#age").val(),
                genre: $("input[name=genre]:checked").val(),
                messages: 0,
                complaints: 0
            });
            $("#publish-modal").modal("hide");

            $("#name, #description, #picture").val("");
            $("#picture-preview").attr("src", "/images/missing.jpg");

        } else {
            alert("No puede publicar sin iniciar sesión!");
        }
    }
});

Template.list.events({
    'click #search-button': function() {
        var criteria = $("#search-input").val();
        if (criteria) {
            Session.set('filter', criteria);
        } else {
            Session.set('filter', false);
        }
    }
});

Template.list.people = function() {
    var criteria = {};
    if (Session.get('filter')) {
        var re = new RegExp(Session.get('filter'), "i");
        criteria = _.extend(criteria, {name: {$regex: re}});
    }
    return People.find(criteria);
};

Template.header.events = {
    'click #logout': Meteor.logout
};
