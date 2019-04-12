
function doSearch() {
  // called in adingSpotifyAuthentication
  console.log("###############################");

  // search Query would need to be changed to redditTitles[i]
  let searchQuery = "Beach Bunny - February";
  let searchType = "track"; /* album, artist, playlist, track*/
  $.ajax({
      url: `https://api.spotify.com/v1/search?query=${searchQuery}&type=${searchType}&limit=3`,
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    }).then(function (result) {
      console.log("SOMETHING WORKED");
      console.log(result);
    })
    .catch(function (err) {
      console.log(err);
    })
}

function makePlaylist() {
  console.log(access_token);
  console.log(userId);
  console.log("Trying to make playlist");
  let playlistData = {
    "name": "New Playlist",
    "description": "New playlist description",
    "public": true
  };

  let playlistDataStringified = JSON.stringify(playlistData);
  $.ajax({
    url: `https://api.spotify.com/v1/users/${userId}/playlists`,
    method: "POST",
    headers: {
      'Authorization': "Bearer " + access_token
    },
    data: playlistDataStringified
  }).then(function (result) {
    console.log("Made playlist");
    console.log(result);
  })
  .catch(function (err) {
    console.log(err);
  })

};