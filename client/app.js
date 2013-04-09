
People = new Meteor.Collection("people");

Meteor.subscribe("people");

Session.set('filter', false);

loadPerson = function(person_id) {
    var person = People.findOne({_id: person_id});
    return person;
};

Template.person.is = function(ref, value) {
    return (ref == value);
}

Template.person.events({
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
            var doc = {};
            if (Boolean(Session.get('editing_person_id'))) {
                var person = People.findOne({_id: Session.get('editing_person_id')}, {reactive: false});
                if (person.owner == Meteor.user()._id) { //owner
                    doc = {
                        name: $("#name").val(),
                        description: $("#description").val(),
                        picture: $("#picture").val(),
                        relationship: $("#relationship").val(),
                        status: $("#status").val(),
                        age: $("#age").val(),
                        genre: $("input[name=genre]:checked").val()
                    };
                } else {
                    doc = {
                        picture: $("#picture").val(),
                        status: $("#status").val()
                    };
                }
                People.update({_id: person._id}, {$set: doc});
            } else {
                doc = {
                    name: $("#name").val(),
                    description: $("#description").val(),
                    picture: $("#picture").val(),
                    relationship: $("#relationship").val(),
                    status: $("#status").val(),
                    age: $("#age").val(),
                    genre: $("input[name=genre]:checked").val(),
                    messages: 0,
                    complaints: 0
                };
                People.insert(doc);
            }
            $("#person-modal").modal("hide");

            $("#name, #description, #picture, #age").val("");
            $("#picture-preview").attr("src", "/images/missing.jpg");

            Meteor.Router.to("/");
        } else {
            alert("No puede publicar sin iniciar sesión!");
        }
    }
});

Template.person.isOwner = function() {
    if (Session.get('editing_person_id')) {
        // editing
        var person = loadPerson(Session.get('editing_person_id'));
        return (person.owner == Meteor.user()._id);
    }
    return true;    
};

Template.person.editing = function() {
    return Boolean(Session.get('editing_person_id'));
};

Template.person.person = function() {
    return loadPerson(Session.get('editing_person_id'));
};

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
    return People.find(criteria, {sort: {name: 1}});
};

Template.header.events = {
    'click #logout': Meteor.logout
};

Meteor.Router.add({
    "/": function() {
        Session.set('editing_person_id', null);
    },
    "/add": function() {
        Session.set('editing_person_id', null);
        $("#person-modal").modal("show");
    },
    "/edit/:id": function(person_id) {
        if (!Meteor.status().connected) {
             Meteor.Router.to("/");
            return;
        }
        Session.set('editing_person_id', person_id);
        $("#person-modal").modal("show");
    }
});

if (Meteor.isClient) {
    Meteor.startup(function () {
        $("#person-modal").on("hide", function() { Meteor.Router.to("/"); });
    });
}
