var liked = [];
var suggested = [];
var loggedIn = false;
var currentUser;

$(function() {
  Parse.initialize("2AFS6ex13gyYwQUmnyqbn13TktfW8IXLoJmWn96X", "2T1UgMovX2D0Qf7kbgrEp66Zz9srMAMkD61rtc1i");
  
  Parse.User.logOut();
  
  setInterval(function(){
    if(loggedIn == true && $("#upArrow").css("opacity") == 1) {
      //console.log("Interval Hit");
      testAPI();
    }
  }, 10);
  
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '427708340770047',
      xfbml      : true,
      version    : 'v2.4'
    });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
  
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      $("#upArrow").css("opacity","1");
      $("#container").css("opacity","0");
      loggedIn = false;
      $("#login").css("display","block");
      $("#loggedIn").css("display","none");
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      $("#upArrow").css("opacity","1");
      $("#container").css("opacity","0");
      loggedIn = false;
      $("#login").css("display","block");
      $("#loggedIn").css("display","none");
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    console.log("Hit");
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '427708340770047',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    $("#upArrow").css("opacity","0");
    $("#container").css("opacity","1");
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      console.log(response);
      $("#login").css("display","none");
      $("#profName").html(response.name);
      loggedIn = true;
      var query = new Parse.Query(Parse.User);
      Parse.User.logIn(response.id, "password", {
        success: function(user) {
          currentUser = Parse.User.current();
          console.log(currentUser);
          liked = Parse.User.current()["attributes"]["liked"];
          suggested = Parse.User.current()["attributes"]["suggested"];
          if(liked.length == 0){
            $("#wrapper").css("display","none");
            $("#wrapper").css("opacity","0");
            $("#artists").css("opacity","1");
            $("#suggestedTracks").css("opacity","0");
            $("#rightArrow").css("opacity","0");
            $("#leftArrow").css("opacity","0");
            $("#downArrow").css("opacity","1");
          } else{
            $("#wrapper").css("display","block");
            liked = liked.sort();
            for(var j = 0; j<liked.length; j++){
              $("#currentArtists").append("<div class='artist'><p>" + liked[j] + "</p><img src='images/X.png' class='x'></div>");
            }
            loadSpotifyData();
          }
        },
        error: function(user, error) {
          var user = new Parse.User();
          user.set("username", response.id);
          user.set("password", "password");
          user.set("name", response.name);
          user.set("suggested", suggested);
          user.set("liked", liked);
          user.signUp(null, {
            success: function(userData) {
               currentUser = user;
               $("#wrapper").css("display","none");
               location.reload();
            },
            error: function(user, error) {
              alert("Error: " + error.code + " " + error.message);
            }
          });
        }
      });
      
      $.getJSON("https://graph.facebook.com/" + response.id + "/picture?type=large&redirect=false", function(response){
        $("#prof").attr("src",response["data"]["url"]);
        $("#loggedIn").css("display","inline");
      });
    });
  }
  
  function loadSpotifyData(){
    var originalArtist = liked[Math.floor(Math.random()*liked.length)];
    $.getJSON("https://api.spotify.com/v1/search?q=" + originalArtist.split(" ").join("+") + "&type=artist", function(dataOne){
      $.getJSON("https://api.spotify.com/v1/artists/" + dataOne["artists"]["items"][0]["id"] + "/related-artists", function(dataTwo){
        var randomNum = Math.floor(Math.random()*dataTwo["artists"].length);
        var newArtist = dataTwo["artists"][randomNum];
        $("#ifYouLike").html("If you like " + originalArtist + ", you may also like:");
        $("#newArtistName").html(newArtist["name"]);
        $("#newArtistName").attr("href", newArtist["external_urls"]["spotify"]);
        $.getJSON("https://api.spotify.com/v1/artists/" + dataTwo["artists"][randomNum]["id"] + "/top-tracks?country=US", function(dataThree){
          var randomTrack = Math.floor(Math.random()*dataThree["tracks"].length);
          suggested.push({
            "trackName": dataThree["tracks"][randomTrack]["name"],
            "artistName": dataThree["tracks"][randomTrack]["artists"][0]["name"],
            "trackUrl": dataThree["tracks"][randomTrack]["external_urls"]["spotify"],
            "artistUrl": dataThree["tracks"][randomTrack]["artists"][0]["external_urls"]["spotify"],
          });
          var source = "https://embed.spotify.com/?uri=" + dataThree["tracks"][randomTrack]["uri"];
          $("#spotifyIF").attr("src",source);
          $("#tracks ul").html("");
          console.log(suggested.length);
          if(suggested.length > 600){
            console.log("Erased");
            suggested.splice(0,suggested.length - 600);
          }
          Parse.User.current().set("suggested", suggested);
          Parse.User.current().save(null,{});
          var suggestedLength = suggested.length;
          console.log(suggestedLength);
          var l;
          for(var k=0; k<suggested.length-1; k++){
            l = suggestedLength - (k+2);
            $("#tracks").append("<p id='trackLi'><a href=" + suggested[l]["trackUrl"] + " target='_blank'>" + suggested[l]["trackName"] + "</a>by<a href=" + suggested[l]["artistUrl"] + " target='_blank'>" + suggested[l]["artistName"] + "</a></p><hr>");
          }
          $("#wrapper").css("opacity","1");
          $("#artists").css("opacity","1");
          $("#suggestedTracks").css("opacity","1");
          $("#rightArrow").css("opacity","1");
          $("#leftArrow").css("opacity","1");
          $("#downArrow").css("opacity","0");
        });
      });
    });
  }
  
  $("#artistForm").submit(function(e){
    e.preventDefault();
    var alreadyAdded = false;
    $.getJSON("https://api.spotify.com/v1/search?q=" + $("#newArtistTextbox").val().split(" ").join("+") + "&type=artist", function(data){
      for(var i = 0; i<liked.length; i++){
        if(liked[i] == data["artists"]["items"][0]["name"]){
          alreadyAdded = true;
        }
      }
      if(alreadyAdded == false){
        liked.push(data["artists"]["items"][0]["name"]);
        liked.sort();
        //console.log(liked);
        Parse.User.current().set("liked", liked);
        Parse.User.current().save(null,{
          success: function(user){
            console.log(user);
            $("#wrapper").css("display","block");
            $("#currentArtists").html("");
            for(var j = 0; j<liked.length; j++){
              $("#currentArtists").append("<div class='artist'><p>" + liked[j] + "</p><img src='images/X.png' class='x'></div>");
            }
            if(liked.length == 1){
              loadSpotifyData();
            }
          },
          error: function(user, error){
            console.log(user);
            console.log(error);
          }                      
        });
      }
    });
  });
  
  $('.x').live('click', function() {
    liked = Parse.User.current()["attributes"]["liked"];
    var index = liked.indexOf($(this).parent().find("p").text());
    liked.splice(index,1);
    console.log(liked);
    Parse.User.current().set("liked", liked);
    Parse.User.current().save(null,{});
    $("#currentArtists").html("");
    for(var j = 0; j<liked.length; j++){
      $("#currentArtists").append("<div class='artist'><p>" + liked[j] + "</p><img src='images/X.png' class='x'></div>");
    }
  });
  
  $("#leftArrow").click(function(){
    console.log($("#leftArrow").css("left"));
    if($("#leftArrow").offset().left == 144){
      console.log("testing!");
      $("#leftArrow").css("left", "374px");
      $("#artists").css("left", "373px");
    }
    else if($("#leftArrow").offset().left == 494){
      console.log("We have a bigger problem");
      $("#leftArrow").css("left", "24px");
      $("#artists").css("left", "23px");
    }
  });
  
  $("#rightArrow").click(function(){
    console.log($("#rightArrow").offset().left);
    if(Math.floor($("#rightArrow").offset().left) == 1243){
      $("#rightArrow").css("left", "-328px");
      $("#suggestedTracks").css("left", "-327px");
    }
    else if(Math.floor($("#rightArrow").offset().left) == 893){
      $("#rightArrow").css("left", "22px");
      $("#suggestedTracks").css("left", "23px");
    }
  });
  
//   $("#loggedIn").hover(function(){
//     $("#prof").css("right","140px");
//     $("#profName").css("left","40px");
//     }, function(){
//     $("#prof").css("right","150px");
//     $("#profName").css("left","30px");
// }); 
});