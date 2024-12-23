let songs = [];
let mergesortSteps = [];
let currentComparison = null;
const API_KEY = 'AIzaSyB9GXkUglNRtGVFtV3nZBncxEO8zKEjSGo';

document.getElementById('addPlaylistButton').addEventListener('click', () => {
    const playlistUrl = document.getElementById('playlistUrl').value.trim();
    if (playlistUrl) {
        const playlistId = extractPlaylistId(playlistUrl);
        if (playlistId) {
            fetchPlaylistVideos(playlistId).then(videos => {
                songs = songs.concat(videos);
                if (songs.length > 1) {
                    document.getElementById('startTournamentButton').style.display = 'inline-block';
                }
                alert(`${videos.length} songs added from playlist!`);
            }).catch(error => {
                alert('Error fetching playlist: ' + error.message);
            });
        } else {
            alert('Invalid YouTube Playlist URL');
        }
    }
});

document.getElementById('startTournamentButton').addEventListener('click', startTournament);

function startTournament() {
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('rankingSection').style.display = 'block';
    mergeSort(songs);
    displayResults();
}

function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return; // Base case: if the array has one or no element

  const mid = Math.floor((left + right) / 2);
  
  // Recursively sort the left and right halves
  mergeSort(arr, left, mid);
  mergeSort(arr, mid + 1, right);

  // Merge the two sorted halves
  merge(arr, left, mid, right);
}

async function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);  // Left subarray
  const rightArr = arr.slice(mid + 1, right + 1);  // Right subarray

  let i = 0, j = 0, k = left;

  // Merge the two subarrays back into the original array
  while (i < leftArr.length && j < rightArr.length) {
    let isLeftChosen = null;
    while (isLeftChosen != true && isLeftChosen != false) {
        isLeftChosen = await showComparison(leftArr[i], rightArr[j]);
    }
    if (isLeftChosen) {
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
}

function showComparison(leftSong, rightSong) {
    return new Promise((resolve) => {
        const comparisonPrompt = document.getElementById('comparisonPrompt');
        const leftTitle = document.getElementById('leftTitle');
        const leftVideo = document.getElementById('leftVideo');
        const rightTitle = document.getElementById('rightTitle');
        const rightVideo = document.getElementById('rightVideo');
        const chooseLeftButton = document.getElementById('chooseLeft');
        const chooseRightButton = document.getElementById('chooseRight');

        // Set up UI
        comparisonPrompt.innerText = 'Which song is better?';
        leftTitle.innerText = leftSong.title;
        leftVideo.src = `https://www.youtube.com/embed/${leftSong.videoId}`;
        rightTitle.innerText = rightSong.title;
        rightVideo.src = `https://www.youtube.com/embed/${rightSong.videoId}`;

        // Define handlers
        const onChooseLeft = () => {
            console.log('Left song chosen');
            cleanup();
            resolve(true);
        };

        const onChooseRight = () => {
            console.log('Right song chosen');
            cleanup();
            resolve(false);
        };

        // Cleanup function to remove event listeners
        function cleanup() {
            chooseLeftButton.removeEventListener('click', onChooseLeft);
            chooseRightButton.removeEventListener('click', onChooseRight);
        }

        // Attach event listeners
        chooseLeftButton.addEventListener('click', onChooseLeft);
        chooseRightButton.addEventListener('click', onChooseRight);
    });
}


function displayResults() {
    document.getElementById('rankingSection').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    const rankedList = document.getElementById('rankedList');
    rankedList.innerHTML = '';
    songs.forEach(song => {
        const li = document.createElement('li');
        li.innerText = song.title;
        rankedList.appendChild(li);
    });
}

function extractPlaylistId(url) {
    const match = url.match(/[?&]list=([^&#]*)/);
    return match ? match[1] : null;
}

async function fetchPlaylistVideos(playlistId) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId
        }));
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        alert('Failed to fetch playlist videos. Please check the playlist ID and try again.');
        throw error;
    }
}
