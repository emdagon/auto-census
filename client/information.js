
Information = new Meteor.Collection("information");

Meteor.subscribe("information");

Session.set('person_id', null);

Template.info.person = function() {
    return People.findOne({_id: Session.get('person_id')}, {reactive: false});
};

Template.info.information = function() {
    if (!Session.get('person_id')) return [];

    var information = Information.find({person_id: Session.get('person_id')});

    return information;
};

Template.info.is_complaint = function() {
    return (Session.get('message_type') == "complaint") ? 1 : 0;
};

Template.info.events = {
    'click .send': function() {
        var user = Meteor.user();
        var message = $("#message").val();
        if (user && message) {
            var report = {
                person_id: $("#person_id").val(),
                author: {name: user.profile.name, url: user.profile.url},
                message: message,
                complaint: parseInt($("#complaint").val())
            };
            Meteor.call('addInformation', report, function() {
                $("#message").val("").prop("disabled", false);
            });
            $("#message").prop("disabled", true);
        } else {
            alert("Error: No puede publicar sin iniciar sesión!");
        }
    }
};

Template.info.rendered = function() {
    var il = $("#information-log");
    il.animate({scrollTop: il.children().height()}, 700);
};

Meteor.Router.add({
    "/view-information/:id": function(person_id) {
        Session.set('person_id', person_id);
        Session.set('message_type', "notice");
        // hack! to avoid the reactiveness in the person attribute, I create another (reactive) cursor for use with the Router
        if (loadPerson(person_id)) {
            $("#info-modal").modal("show");
        }
    },
    "/add-complaint/:id": function(person_id) {
        Session.set('person_id', person_id);
        Session.set('message_type', "complaint");
        if (loadPerson(person_id)) {
            $("#info-modal").modal("show");
        }
    }
});

if (Meteor.isClient) {
    Meteor.startup(function () {
        $("#info-modal").on("shown", Template.info.rendered);
        $("#info-modal").on("hide", function() { Meteor.Router.to("/") });
    });
}
