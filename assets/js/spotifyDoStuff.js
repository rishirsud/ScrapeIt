// Get json of r/listentothis top 24 hours
// take data, filter titles and then save them to an array 
// which will get passed to Spotify to make a playlist out of.
let redditTitles = [];
let urisArray = [];
// try {
// Array to put reddit post titles into.
function getRedditTitles() {
  $.getJSON(
    "https://www.reddit.com/r/listentothis/top.json?sort=top&t=month?limit=50", /* added limit to the request just incase */
    function postTitles(data) { // limit the data to 10
      // console.log(data); /* logs the json data returned */
      $.each(data.data.children.slice(0, 50), function (i, post) {
        // slice limits the titles from 0 - x 
        let title = post.data.title;
        // pattern to find the year in the title
        let regexYear = /\([^)]*\)/;
        // pattern to find the genre in the title
        let regexGenre = /\[.*?\]/;

        // apply the regex to filter the titles and then push them to the array.
        let filteredTitle = title.replace(regexGenre, "");
        filteredTitle = filteredTitle.replace(regexYear, "")
        redditTitles.push(filteredTitle.trim());

        // write titles to the page ----- REMOVE LATER
        $("#reddit-dump").append(filteredTitle + "<hr>");
      }) // end of each
      console.log(redditTitles);
    } // end of function postTitles
  ).then(function () {

    // console.warn(redditTitles);
    // console.warn(redditTitles.length)

    searchTrackUri(0);

  }) // .getJSON
}


function searchTrackUri(index) {

  if (index >= redditTitles.length) {
    return addSongsToPlaylist();
  }

  let query = redditTitles[index];
  let searchType = "track"; /* album, artist, playlist, track*/
  console.log(query);

  if (query.includes("#")) {
    index++;
    return searchTrackUri(index)
  }

  $.ajax({
      url: `https://api.spotify.com/v1/search?query=${query}&type=${searchType}&limit=3`,
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    }).then(function (result) {
      // console.log("song searched");
      // console.log(result.tracks.items);

      if (result.tracks.items.length) {
        urisArray.push(result.tracks.items[0].uri);
      }

      // console.log("ARRAY LENGTH");
      // console.warn(urisArray.length);

      // console.log("URIS ARRAY");
      // console.log(urisArray);

      // increment index
      index++;
      searchTrackUri(index);
    })
    .catch(function (err) {
      console.log(err);
    });
  // console.log(urisArray);
}

// Makes a playlist on spotify using the user inputted name
function makePlaylist() {
  console.log(access_token);
  console.log(userId);
  console.log("Trying to make playlist");
  let playlistNameInput = $("#nameYourPlaylist").val().trim();
  let playlistData = {
    "name": playlistNameInput,
    "description": "New playlist description",
    "public": true
  };

  if (playlistNameInput === "") {
    console.warn("no playlist name")
    $("#nameYourPlaylist").addClass("is-invalid");
  } else {
    $("#nameYourPlaylist").removeClass("is-invalid");
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
        // console.log(result);
        getUserPlaylists();
        // console.warn(newPlaylistID);
      })
      .catch(function (err) {
        console.log(err);
      })
    $("#playlistModal").modal("toggle");
  }
};

function addSongsToPlaylist() {

  let uri = {
    "uris": urisArray.map(uri => uri)
  };
  let uriStringified = JSON.stringify(uri);
  console.warn(newPlaylistID);
  try {
    $.ajax({
      url: `https://api.spotify.com/v1/users/${globalUserID}/playlists/${newPlaylistID}/tracks`,
      method: "POST",
      headers: {
        'Authorization': "Bearer " + access_token
      },
      data: uriStringified
    }).then(function () {
      console.log("added songs to playlist");
      urisArray = [];
      redditTitles = [];
      getUserPlaylists();
    });
  } catch (error) {
    console.error(error);
    console.warn("THIS SHOULD NEVER SHOW");
  }
};