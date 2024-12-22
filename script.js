let songs = [];
let currentIndex = 0;
const apiKey = 'AIzaSyB9GXkUglNRtGVFtV3nZBncxEO8zKEjSGo';  // Replace with your YouTube API key
let playlistId = '';  // Will be extracted from the URL

// Song class to store title, creator, and YouTube embed link for each song
class Song {
  constructor(title, creator, ytembed) {
    this.title = title;     // string: Song title
    this.creator = creator; // string: Channel/Creator of the song
    this.ytembed = ytembed; // string: YouTube embed link
  }
}

// Function to extract the playlist ID from the URL
// Params: url (string) - The URL of the YouTube playlist
// Returns: string | null - The playlist ID if found, otherwise null
function extractPlaylistId(url) {
  const regex = /(?:list=)([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

// Function to fetch playlist items using YouTube API
// Params: none
// Returns: none
async function fetchPlaylist() {
  const playlistUrl = document.getElementById("playlist-url").value;
  playlistId = extractPlaylistId(playlistUrl);

  if (!playlistId) {
    alert('Invalid Playlist URL');
    return;
  }

  // Fetch the playlist details from YouTube API
  await fetchSongsFromPlaylist();

  // Switch to the sorting phase after fetching songs
  switchToSortingPhase();
}

// Function to fetch songs from the playlist using the YouTube API
// Params: none
// Returns: none
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

// Function to switch to the sorting phase
// Params: none
// Returns: none
function switchToSortingPhase() {
  document.getElementById("input-phase").style.display = "none";
  document.getElementById("sorting-phase").style.display = "block";
  mergeSort(songs);
  switchToResultsPhase();
}

// Function to display a comparison between two songs in the sorting phase
// Params: song1 (Song), song2 (Song)
// Returns: none
function showComparison(song1, song2) {

  document.getElementById("embed1").src = song1.ytembed;
  document.getElementById("title1").innerText = song1.title;
  document.getElementById("creator1").innerText = song1.creator;

  document.getElementById("embed2").src = song2.ytembed;
  document.getElementById("title2").innerText = song2.title;
  document.getElementById("creator2").innerText = song2.creator;
}

// Function to handle the user's choice of which song is ranked lower
// Params: song1 (Song), song2 (Song)
// Returns: choice (bool) - True if left song, false if right song
function chooseSong(song1, song2) {
  showComparison();
  
}

//Execute mergeSort
//Params: songs (Songs[])
//Returns: none
function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return; // Base case: if the array has one or no element

  const mid = Math.floor((left + right) / 2);
  
  // Recursively sort the left and right halves
  mergeSortInPlace(arr, left, mid);
  mergeSortInPlace(arr, mid + 1, right);

  // Merge the two sorted halves
  merge(arr, left, mid, right);
}

function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);  // Left subarray
  const rightArr = arr.slice(mid + 1, right + 1);  // Right subarray

  let i = 0, j = 0, k = left;

  // Merge the two subarrays back into the original array
  while (i < leftArr.length && j < rightArr.length) {
    if (chooseSong(leftArr[i], rightArr[i])) {
      arr[k] = leftArr[i];
      i++;
    } else {
      arr[k] = rightArr[j];
      j++;
    }
    k++;
  }

  // If any elements remain in the left array, add them
  while (i < leftArr.length) {
    arr[k] = leftArr[i];
    i++;
    k++;
  }

  // If any elements remain in the right array, add them
  while (j < rightArr.length) {
    arr[k] = rightArr[j];
    j++;
    k++;
  }

// Function to switch to the results phase
// Params: none
// Returns: none
function switchToResultsPhase() {
  document.getElementById("sorting-phase").style.display = "none";
  document.getElementById("results-phase").style.display = "block";
  showResults();
}

// Function to display the results (ranked songs) after sorting is complete
// Params: none
// Returns: none
function showResults() {
  const rankingList = document.getElementById("ranking-list");
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerText = `${index + 1}. ${song.title} - ${song.creator}`;
    rankingList.appendChild(li);
  });
}
