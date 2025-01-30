## Scrape tik-tok video from url

In the body of the request you need to pass: 
```json
{
  url: string                       // Link to the tik-tok video, example: "https://vm.tiktok.com/ZMkC5Gwp8/"
}
```

Response data(Attention! This is an object [Dataset](https://docs.apify.com/platformstorage/dataset#basic-usage)) :
```json
[
  {
      "url": string,                // Link for downloading the target video
      "audioInfo": {                // Additional information about the audio track used in the video
        "title": string,
        "music": string,            // Link to the audio track from the video
        "author": string,           // User login of the video author
        "original": boolean,    
        "duration": number, 
        "album": string,
      },
      "info": {                     // Additional information about the video itself
        "play_count": number,       // Number of video views
        "react_count": number,      // Number of reactions to the video
        "comment_count": number,    // Number of comments on the video
        "share_count": number,      // Number of shares
        "author_avatar": string,    // Link to the video author's avatar image
      }
  }
]
```

Пример на js: 
```js
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  const token = '';         // my token apify

  const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify({
          url: "https://www.tiktok.com/@yxuliant8/video/7230418312637779227"
      }),
      responseType: 'json'    
  };



  fetch(`https://api.apify.com/v2/acts/0JIAS6p2aE4luYTnx/run-sync-get-dataset-items?token=${token}`, requestOptions)
      .then((response)=> response.json())
      .then((result)=> console.log(result))
```