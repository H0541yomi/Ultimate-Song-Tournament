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
}

function mergeSort(arr) {
    // Base case: Arrays with 0 or 1 element are already sorted
    if (arr.length <= 1) {
        return arr;
    }

    // Split the array into two halves
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);

    // Recursively sort both halves and merge the results
    return merge(mergeSort(left), mergeSort(right));
}

async function merge(left, right) {
    const result = [];
    let i = 0, j = 0;

    // Compare elements from both arrays and add the smaller one to the result
    while (i < left.length && j < right.length) {
        let songChoose = await showComparison(left[i], right[j]);
        if (songChoose) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    // Add any remaining elements from the left array
    while (i < left.length) {
        result.push(left[i]);
        i++;
    }

    // Add any remaining elements from the right array
    while (j < right.length) {
        result.push(right[j]);
        j++;
    }

    return result;
}

// Example usage
const unsortedArray = [5, 3, 8, 6, 2, 7, 4, 1];
const sortedArray = mergeSort(unsortedArray);
console.log(sortedArray); // [1, 2, 3, 4, 5, 6, 7, 8]


function showComparison(leftSong, rightSong) {
    document.getElementById('comparisonPrompt').innerText = 'Which song is better?';
    document.getElementById('leftTitle').innerText = leftSong.title;
    document.getElementById('leftVideo').src = `https://www.youtube.com/embed/${leftSong.videoId}`;
    document.getElementById('rightTitle').innerText = rightSong.title;
    document.getElementById('rightVideo').src = `https://www.youtube.com/embed/${rightSong.videoId}`;
    
    document.getElementById('chooseLeft').addEventListener('click', () => {
        return true;
    });
    
    document.getElementById('chooseRight').addEventListener('click', () => {
        return false;
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
