let songs = [];
let currentIndex = 0;
const apiKey = 'YOUR_YOUTUBE_API_KEY';  // Replace with your YouTube API key
let playlistId = '';  // Will be extracted from the URL

class Song {
  constructor(title, creator, ytembed) {
    this.title = title;
    this.creator = creator;
    this.ytembed = ytembed;
  }
}

// Function to extract the playlist ID from the URL
function extractPlaylistId(url) {
  const regex = /(?:list=)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

async function fetchPlaylist() {
  const playlistUrl = document.getElementById("playlist-url").value;
  playlistId = extractPlaylistId(playlistUrl);

  if (!playlistId) {
    alert('Invalid Playlist URL');
    return;
  }

  // Fetch the playlist details from YouTube API
  await fetchSongsFromPlaylist();

  switchToSortingPhase();
}

async function fetchSongsFromPlaylist() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
  let nextPageToken = '';
  
  // Clear previous songs
  songs = [];

  // Fetch data and populate songs array
  do {
    const response = await fetch(url + (nextPageToken ? `&pageToken=${nextPageToken}` : ''));
    const data = await response.json();

    data.items.forEach(item => {
      const title = item.snippet.title;
      const creator = item.snippet.channelTitle;
      const ytembed = `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`;
      songs.push(new Song(title, creator, ytembed));
    });

    nextPageToken = data.nextPageToken;  // Get next page if there are more results

  } while (nextPageToken);

  console.log(songs);  // Log to see if the songs are fetched correctly
}

function switchToSortingPhase() {
  document.getElementById("input-phase").style.display = "none";
  document.getElementById("sorting-phase").style.display = "block";
  showComparison();
}

function showComparison() {
  const song1 = songs[currentIndex * 2];
  const song2 = songs[currentIndex * 2 + 1];

  document.getElementById("embed1").src = song1.ytembed;
  document.getElementById("title1").innerText = song1.title;
  document.getElementById("creator1").innerText = song1.creator;

  document.getElementById("embed2").src = song2.ytembed;
  document.getElementById("title2").innerText = song2.title;
  document.getElementById("creator2").innerText = song2.creator;
}

function chooseSong(choice) {
  const song1 = songs[currentIndex * 2];
  const song2 = songs[currentIndex * 2 + 1];
  
  if (choice === 1) {
    // Song 1 is lower
    [song1, song2] = [song2, song1];
  }

  songs[currentIndex * 2] = song1;
  songs[currentIndex * 2 + 1] = song2;

  currentIndex++;

  if (currentIndex * 2 >= songs.length) {
    // Sorting done, move to results phase
    mergeSort(songs);
    switchToResultsPhase();
  } else {
    showComparison();
  }
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    result.push(left[i].title < right[j].title ? left[i++] : right[j++]);
  }

  return result.concat(left.slice(i), right.slice(j));
}

function switchToResultsPhase() {
  document.getElementById("sorting-phase").style.display = "none";
  document.getElementById("results-phase").style.display = "block";
  showResults();
}

function showResults() {
  const rankingList = document.getElementById("ranking-list");
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerText = `${index + 1}. ${song.title} - ${song.creator}`;
    rankingList.appendChild(li);
  });
}
