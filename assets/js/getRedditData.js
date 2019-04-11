// Get json of r/listentothis top 24 hours
// take data, filter titles and then save them to an array 
// which will get passed to Spotify to make a playlist out of.

try {
  // Array to put reddit post titles into.
  const redditTitles = [];

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
  ) // .getJSON

  }catch (err) {
    // document.getElementById("demo").innerHTML = err.message;
    console.log("THIS SHOULD NEVER EVER BE VISIBLE");
  };