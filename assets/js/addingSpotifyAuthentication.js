// const spotify_CLIENT = "92a0946328c54acba24e465dbfd53650";
// const spotify_CLIENT = "bec3519af734411885a23e2440879e5c";
const spotify_CLIENT = "a192be5079c84f01bc02bb156407c210";


let stateKey = 'spotify_auth_state';
let newPlaylistID;
let globalUserID;
console.log(location.hostname);

// on load, try to pull access_token from URL parameters
// localhost:8000?access_token=[token]&state=[state]
const params = getHashParams();
console.log(params);

// save access_token, state, and stored state into variables
let access_token = params.access_token,
  userId = "",
  playerId = "",
  state = params.state,
  storedState = localStorage.getItem(stateKey);

/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
// NO NEED TO WORRY ABOUT THIS
function getHashParams() {
  const hashParams = {};
  let e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window
    .location
    .hash
    .substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
// NO NEED TO WORRY ABOUT THIS
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// if there's an access_token and state is either null OR doesn't equal stored
// state, then let user know there's an issue with authentication
if (access_token && (state == null || state !== storedState)) {
  console.log("You need to login.");
  spotifyLogin();
} else {

  // if authentication is successful, remove item from localStorage
  localStorage.removeItem(stateKey);
  // if there's an access token, get user information
  if (access_token) {
    $
      .ajax({
        url: 'https://api.spotify.com/v1/me',
        headers: {
          'Authorization': 'Bearer ' + access_token
        }
      })
      .then(function (response) {
        console.log(response);
        $("#login-button").hide();
        $("#app-body").show();

        userId = response.id;
        globalUserID = userId;
        $("#profile-info").html(`<h3>${response.display_name}</h3>`);

        $("#submitPlaylistForm").on("click", function () {
          getRedditTitles();
          makePlaylist();
        });

        // <img class="img-fluid" src="${response.images[0].url}"/>

      });
    // doSearch();
  }
}

$("#make-playlists").on("click", function () {
  $("#playlistModal").modal("toggle");
});

// turn on spotify player
window.onSpotifyWebPlaybackSDKReady = () => {

  const token = getHashParams().access_token;

  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => {
      cb(token);
    }
  });

  // Error handling
  player.addListener('initialization_error', ({
    message
  }) => {
    console.error(message);
  });
  player.addListener('authentication_error', ({
    message
  }) => {
    console.error(message);
  });
  player.addListener('account_error', ({
    message
  }) => {
    console.error(message);
  });
  player.addListener('playback_error', ({
    message
  }) => {
    console.error(message);
  });

  // Playback status updates
  player.addListener('player_state_changed', state => {
    // console.log(state);
  });

  // Ready
  player.addListener('ready', ({
    device_id
  }) => {
    console.log('Ready with Device ID', device_id);
    playerId = device_id;
    setWebPlayer(device_id, access_token);
  });

  // Not Ready
  player.addListener('not_ready', ({
    device_id
  }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();
};

// LOG INTO SPOTIFY
function spotifyLogin() {
  const client_id = spotify_CLIENT; // Your client id
  console.log(location.hostname);
  const redirect_uri = (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? "http://127.0.0.1:5500/" : 'https://jonahkarew.github.io/ScrapeIt/';

  // generate random state key
  const state = generateRandomString(16);

  // set state in localStorage (will read when we get it back)
  localStorage.setItem(stateKey, state);
  // Set scope for authentication privileges
  const scope = 'streaming user-read-birthdate user-read-private user-read-email user-read-playba' +
    'ck-state user-modify-playback-state playlist-modify-public playlist-modify-private';

  // build out super long url
  let url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  url += '&state=' + encodeURIComponent(state);

  // change pages and go to the spotify login page
  window.location = url;
}

// SET SPOTIFY WEB PLAYER TO BROWSER
function setWebPlayer(playerId, access_token) {
  $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      method: "PUT",
      data: JSON.stringify({
        "device_ids": [playerId]
      }),
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);

    })
    .catch(function (err) {
      console.log(err);
    });
}

// get logged in spotify user's playlists
function getUserPlaylists() {
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/playlists?limit=50",
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      printPlaylistInfo(response.items);
      newPlaylistID = response.items[0].id;
      console.warn(newPlaylistID);
    })
}

// print out playlist information
function printPlaylistInfo(playlistArray) {
  const $playlistInfo = $("#playlist-info");
  $playlistInfo.empty();
  playlistArray.forEach(function (playlist) {
    $("<button>")
      .addClass("bg-dark text-light list-group-item d-flex justify-content-between align-items-center playlist-button list-group-item-action")
      .attr({
        "data-playlist-id": playlist.id,
        "data-playlist-uri": playlist.uri
      })
      .text(playlist.name)
      .append(`<span class="badge badge-success badge">${playlist.tracks.total}</span>`)
      .appendTo($playlistInfo);
  });
}

// get playlist tracks
function selectPlaylist() {
  $(".playlist-button").removeClass("active");
  $(this).addClass("active");
  const playlistId = $(this).attr("data-playlist-id");
  const playlistUri = $(this).attr("data-playlist-uri");
  console.log(playlistId);
  $
    .ajax({
      url: `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      const trackInfo = response
        .items
        .map(function (trackInfo) {
          return trackInfo.track
        });
      console.log(trackInfo);
      printTrackInfo(trackInfo, playlistUri);
    })
}

// print tracks to page
function printTrackInfo(trackArray, playlistContextUri) {

  const $trackInfo = $("#track-info");
  $trackInfo.empty();

  trackArray.forEach(function (track) {
    const artists = track
      .artists
      .map(artist => artist.name)
      .join(", ");

    $("<button>")
      .addClass("bg-dark text-light list-group-item d-flex justify-content-between align-items-center track-button list-group-item-action")
      .text(`${artists} - ${track.name}`)
      .attr({
        "data-track-uri": track.uri,
        "data-context": playlistContextUri
      })
      .append(`<span class="badge badge-success badge">${moment(track.duration_ms, "x").format("mm:ss")}</span>`)
      .appendTo($trackInfo);
  });
}

// select and play track
function selectTrack() {
  $(".track-button").removeClass("active");
  $(this).addClass("active");
  const trackId = $(this).attr("data-track-uri");
  const contextUri = $(this).attr("data-context");
  console.log(trackId);
  $.ajax({
      url: `https://api.spotify.com/v1/me/player/play?device_id=${playerId}`,
      method: "PUT",
      data: JSON.stringify({
        "offset": {
          "uri": trackId
        },
        "context_uri": contextUri
      }),
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play-circle").addClass("fa-pause-circle");
    })
    .catch(function (err) {
      console.log(err);
    })
}

// skip song
function nextSong() {
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/next",
      method: "POST",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play-circle").addClass("fa-pause-circle");
    });
}

// previous song
function prevSong() {
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/previous",
      method: "POST",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play-circle").addClass("fa-pause-circle");
    });
}

// resume playback
function resumeSong() {
  console.log("hi")
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/play",
      method: "PUT",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      setTimeout(getCurrentSong, 1500);
      $("#play-button").attr("data-state", "play")
      $("#play-button > i").removeClass("fa-play-circle").addClass("fa-pause-circle");
    });
}

// pause playback
function pauseSong() {
  console.log("hi")
  $
    .ajax({
      url: "https://api.spotify.com/v1/me/player/pause",
      method: "PUT",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    })
    .then(function (response) {
      console.log(response);
      $("#play-button").attr("data-state", "pause")
      $("#play-button > i").removeClass("fa-pause-circle").addClass("fa-play-circle");
    });
}

// get current song info
function getCurrentSong() {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function (response) {
    const trackUri = response.item.uri;
    console.log(response.item);
    console.log(trackUri)
    $(".track-button").removeClass("active");
    $(`[data-track-uri="${trackUri}"]`).addClass("active");
    $("#track").text(response.item.name);
    $("#artist").text(response.item.artists.map(artist => artist.name).join(", "))
  })
}

// get categories on load to select from
function getCategories() {
  $.ajax({
    url: "https://api.spotify.com/v1/browse/categories",
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function (response) {
    // print to left column select box
    response.categories.items.forEach(function (category) {
      $("<option>")
        .val(category.id)
        .text(category.name)
        .appendTo($("#categories-list"));
    })
  });
}
// when selecting categories for playlists
function selectCategories(event) {

  event.preventDefault();
  // get categories out of select form
  const category_id = $(this).val();

  $.ajax({
    url: `https://api.spotify.com/v1/browse/categories/${category_id}/playlists?limit=50`,
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function (response) {
    console.log(response);
    printPlaylistInfo(response.playlists.items);
  });
}

// get featured playlists
function getFeaturedPlaylists() {
  $.ajax({
    url: "https://api.spotify.com/v1/browse/featured-playlists",
    method: "GET",
    headers: {
      'Authorization': "Bearer " + access_token
    }
  }).then(function (response) {
    console.log(response);
    printPlaylistInfo(response.playlists.items);
  })
}


// BIND CLICK EVENTS
$(document)
  .ready(function () {
    console.log("THIS IS WORKING")
    var multiple = new Multiple({
      selector: 'body',
      background: 'linear-gradient(#04230c, #3cad5a)'
    });

    var multiple = new Multiple({
      selector: '.custom',
      background: 'linear-gradient(#04230c, #3cad5a)'
    });

    var multiple = new Multiple({
      selector: '.footer',
      background: 'linear-gradient(#04230c, #3cad5a)'
    });
    
    
    // get categories on load
    // getCategories();
    $("#user-playlists").on("click", getUserPlaylists);
    $("#featured-playlists").on("click", getFeaturedPlaylists);
    $("#play-button").on("click", function () {
      // get state of button
      const buttonState = $(this).data("state");

      if (buttonState === "play") {
        pauseSong();
      } else if (buttonState === "pause") {
        resumeSong();
      }
    });
    $("#prev-button").on("click", prevSong);
    $("#next-button").on("click", nextSong);
    $(document).on("click", ".playlist-button", selectPlaylist);
    $(document).on("click", ".track-button", selectTrack);
    // login button to get access token
    $('#login-button').on('click', spotifyLogin);
    $("#categories-list").on("change", selectCategories);
    $("#modalCancel").on("click", function(){
      $("#playlistModal").modal("toggle");
    });
    // getRedditTitles();
    if (!access_token) {
      $("#app-body").hide();
    }
  });
