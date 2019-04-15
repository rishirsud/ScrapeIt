// Get json of r/listentothis top 24 hours
// take data, filter titles and then save them to an array 
// which will get passed to Spotify to make a playlist out of.
const redditTitles = [];
const urisArray = [];
// try {
// Array to put reddit post titles into.
function getRedditTitles() {
  $.getJSON(
    "https://www.reddit.com/r/listentothis/top.json?sort=top&t=day?limit=20", /* added limit to the request just incase */
    function postTitles(data) { // limit the data to 10
      // console.log(data); /* logs the json data returned */
      $.each(data.data.children.slice(0, 10), function (i, post) {
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

    console.warn(redditTitles);
    console.warn(redditTitles.length)

    searchTrackUri(0);

  }) // .getJSON
}


function searchTrackUri(index) {

  if (index >= redditTitles.length) {
    return false;
  }

  let query = redditTitles[index];
  let searchType = "track"; /* album, artist, playlist, track*/

  $.ajax({
      url: `https://api.spotify.com/v1/search?query=${query}&type=${searchType}&limit=3`,
      method: "GET",
      headers: {
        'Authorization': "Bearer " + access_token
      }
    }).then(function (result) {
      console.log("song searched");
      console.log(result.tracks.items);

      if (result.tracks.items.length) {
        urisArray.push(result.tracks.items[0].uri);
      }

      console.log("ARRAY LENGTH");
      console.warn(urisArray.length);

      console.log("URIS ARRAY");
      console.log(urisArray);

      // increment index
      index++;
      searchTrackUri(index);
    })
    .catch(function (err) {
      console.log(err);
    });
}



// Test search for spotify API
// function doSearch() {
  // called in adingSpotifyAuthentication
  // console.log("###############################");

  // // search Query would need to be changed to redditTitles[i]
  // let searchQuery = "Beach Bunny - February";
  // let searchType = "track"; /* album, artist, playlist, track*/
  // $.ajax({
  //     url: `https://api.spotify.com/v1/search?query=${searchQuery}&type=${searchType}&limit=3`,
  //     method: "GET",
  //     headers: {
  //       'Authorization': "Bearer " + access_token
  //     }
  //   }).then(function (result) {
  //     console.log("SOMETHING WORKED");
  //     console.log(result);
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   })
// }


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
        console.log(result);
        getUserPlaylists();
      })
      .catch(function (err) {
        console.log(err);
      })
    $("#playlistModal").modal("toggle");
  }
};