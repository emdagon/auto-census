
People = new Meteor.Collection("people");

People.allow({
    insert: function(userId, doc) {
        // this is ugly, but it's the only way I figured out to set server-side values
        doc.created = new Date();
        doc.owner = userId;
        return Boolean(userId);
    },
    update: function (userId, docs, fields, modifier) {
        // is a new message or complaint?
        if (_.all(fields, function(field) {
                return (field == "complaints" || field == "messages");
            })) {
            return true;
        }
        // oh! no?, then can only change your own documents
        return _.all(docs, function(doc) {
            return doc.owner === userId;
        });
    },
    remove: function (userId, docs) {
        // can only remove your own documents
        return _.all(docs, function(doc) {
            return doc.owner === userId;
        });
    },
    fetch: ['owner']
});

People.deny({
  update: function (userId, docs, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'owner');
  }
});


Meteor.publish('people', function () {
    return People.find();
});

Meteor.publish('person', function() {
    return People.find({});
});
