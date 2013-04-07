
Information = new Meteor.Collection("information");

Information.allow({
    insert: function(userId, doc) {
        return Boolean(userId);
    },
    update: function() {
        return false;
    },
    remove: function() {
        return false;
    },
    fetch: ['owner']
});

Information.deny({
    update: function() {
       return false;
    },
    remove: function() {
        return false;
    }
});


Meteor.publish('information', function() {
    return Information.find({});
});

Meteor.methods({
    addInformation: function(doc) {
        doc.owner = this.userId;
        doc.created = new Date();
        Information.insert(doc, function() {
            var inc = {messages: 1};
            if (doc.complaint) {
                inc.complaints = 1;
            }
            People.update({_id: doc.person_id}, {$inc: inc});
        });
    }
});
