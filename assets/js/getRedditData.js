const redditTitles = [];

$.getJSON(
  "https://www.reddit.com/r/listentothis/new.json?limit=20", /* added limit to the request just incase */
  function postTitles(data) { // limit the data to 10
    console.log(data);
    $.each(data.data.children.slice(0, 5), function (i, post) { /* slice limits the titles from 0 - x */
      $("#reddit-dump").append(post.data.title + "<hr>");
      redditTitles.push(post.data.title);
    }) // end of each
    console.log(redditTitles);
  } // end of function postTitles
) // .getJSON


