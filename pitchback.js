Comments = new Meteor.Collection("comments");
Users = new Meteor.Collection("users");
Events = new Meteor.Collection("events");

// var listsHandle = Meteor.subscribe('events', function(){
//   console.log(Events.findOne());
// });

if(Meteor.isClient){

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

    if(evt){
      var idx = Session.get('slide');
      if(idx == null){
        idx = evt.slide;
        Session.set('slide', idx);
      }

      if(evt) url = evt.slides[idx];

      return url;
    }
  };

  Template.presentation.events({
    'click' : function(){

    }
  });

  Template.comments.comments = function(){
    return Comments.find({}, {sort: {score: -1, name: 1}});
  };

  Template.comments.events({
    'keypress input.add_comment' : function(e){
      var user = Session.get('user');

      if(e.keyCode == 13){
        Comments.insert({owner: user._id, text: e.currentTarget.value, score: 1, voters: [user._id]});
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
}

if(Meteor.isServer){
  Meteor.startup(function(){
    if(Events.find().count() === 0){
      Events.insert({
        name:"ComputeMidwest",
        slides:[
          'blah.png'
        ],
        slide:0
      });
    }
    // code to run on server at startup
  });
}