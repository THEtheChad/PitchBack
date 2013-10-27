if(Meteor.isClient){

  var Comments = window.Comments = new Meteor.Collection("comments");
  var Users = window.Users = new Meteor.Collection("users");
  var Events = window.Events = new Meteor.Collection("events");

  Deps.autorun(function(){
    Meteor.subscribe('comments', {event: Session.get('event'), slide: Session.get('slide')});
  });

  var events = Meteor.subscribe('events', function(){
    var presentation = Events.find({_id:"gBXf7zzBkxjTXiJeg"});
    var obj = presentation.fetch()[0];
    Session.set('event', obj._id);
    Session.set('slide', obj.slide);
    var slides = obj.slides;
    var i = slides.length;

    presentation.observe({
      changed: function(newdoc){
        Session.set('slide', newdoc.slide);
      }
    });

    while(i--){
      var img = new Image();
      img.src = slides[i];
    }
  });
  var users = Meteor.subscribe('users');

  Template.main.loggedin = function(){
    return Session.get('user') ? true : false;
  };

  function loginComplete(){
    var $username = $('#username')
      , $password = $('#password')
      , username  = $username.val()
      , password  = $password.val()
    ;//var

    if(!username){
      $username.focus();
      return false;
    }
    else
    if(!password){
      $password.focus();
      return false;
    }
    else{
      return {
        name:username,
        password:password
      };
    }
  }

  Template.login.events({
    'click #login_user' : function(e){
      var credentials = loginComplete();
      
      if(credentials){
        var user = Users.findOne({name:credentials.name});

        if(user) Session.set('user', user);
      }
    },
    'click #create_user' : function(e){
      var credentials = loginComplete();
      
      var user = Users.findOne({name:credentials.name});

      if(!user){
        var id = Users.insert(credentials);
        var user = Users.findOne({_id:id});
        if(user) Session.set('user', user);
      }
    }
  });

  Template.login.alert = function(){
    return Session.get('login_error');
  };

  Template.presentation.slide = function(){
    var evt = Events.findOne();
    var url = 'http://placekitten.com/400/300';

    if(evt) url = evt.slides[evt.slide];

    return url;
  };

  Template.presentation.events({
    'click #prev' : function(){
      var slide = Session.get('slide');
      var event = Session.get('event');

      Events.update({_id:event}, {$set:{slide:--slide}});
    },
    'click #next' : function(){
      var slide = Session.get('slide');
      var event = Session.get('event');

      Events.update({_id:event}, {$set:{slide:++slide}});
    }
  });

  Template.comments.comments = function(){
    return Comments.find({}, {sort: {score: -1, name: 1}});
  };

  Template.comments.events({
    'keypress input.add_comment' : function(e){
      var user = Session.get('user');
      var event = Session.get('event');
      var slide = Session.get('slide');

      if(e.keyCode == 13){
        Comments.insert({owner: user._id, text: e.currentTarget.value, score: 1, voters: [user._id], event: event, slide: slide});
        e.currentTarget.value = '';
      }
    },
    'click .comment .add_vote' : function(e){
      var user = Session.get('user');
      Comments.update({_id:this._id}, {$inc: {score: 1}, $push: {voters: user._id}});
    },
    'click .comment .remove_vote' : function(e){
      var user = Session.get('user');
      if(this.owner === user._id) return;
      Comments.update({_id:this._id}, {$inc: {score: -1}, $pull: {voters: user._id}});
    }
  });

  Template.comment.owner_name = function(){
    var user = Users.findOne({_id:this.owner});
    return (user && user.name) || "Anonymous";
  };

  Template.comment.own_comment = function(){
    return this.owner == Session.get('user')._id;
  };

  Template.comment.voted = function(){
    var id = Session.get('user')._id;
    var voters = this.voters;
    var i = voters.length;

    while(i--) if(voters[i] === id) return true;
    return false;
  };

  window.removeAll = function(collection){
    collection.find().forEach(function(item){
      collection.remove({_id:item._id});
    });
  }

  window.listAll = function(collection){
    var items = [];
    collection.find().forEach(function(item){
      items.push(item);
    });
    console.log(items);
  }

  Meteor.startup(function(){
    SimplifyCommerce.generateToken({
      key: "sbpb_ZTAxZThlZGQtYTNkNC00ZjhhLTlkNzUtMGFhODQ3MDM4ODcx",
      card: {
          number: 4111111111111111,
          cvc: 333,
          expMonth: 03,
          expYear: 16
      }
    }, function(){
      console.log(arguments);
    });
  })
}

if(Meteor.isServer){
  var Comments = new Meteor.Collection("comments");
  var Users = new Meteor.Collection("users");
  var Events = new Meteor.Collection("events");

  Meteor.startup(function(){
    if(Events.find().count() === 0){
      Events.insert({
        name:"ComputeMidwest",
        slides:[
          'images/slide0.png',
          'images/slide1.png',
          'images/slide2.png'
        ],
        slide:0
      });
    }
    // code to run on server at startup
  });

  Meteor.publish("comments", function(params){
    return Comments.find({event: params.event, slide: params.slide});
  });
  Meteor.publish("users", function(){
    return Users.find();
  });
  Meteor.publish("events", function(){
    return Events.find();
  });

  // var Simplify = require("simplify-commerce"),
  //     client = Simplify.getClient({
  //         publicKey: 'sbpb_ZTAxZThlZGQtYTNkNC00ZjhhLTlkNzUtMGFhODQ3MDM4ODcx',
  //         privateKey: 'RplWVgIaZ6lRw6wClDV+uUobFfFG8VKqrazU14zD7XB5YFFQL0ODSXAOkNtXTToq'
  //     });
   
  // client.payment.create({
  //     amount : "1000",
  //     token : "[TOKEN ID]",
  //     description : "payment description",
  //     reference : "7a6ef6be31",
  //     currency : "USD"
  // }, function(errData, data){
   
  //     if(errData){
  //         console.error("Error Message: " + errData.data.error.message);
  //         // handle the error
  //         return;
  //     }
   
  //     console.log("Payment Status: " + data.paymentStatus);
  // });
}