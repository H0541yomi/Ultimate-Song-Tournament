const startButton = document.getElementById('startButton');
const playlistInput = document.getElementById('playlistInput');
const comparisonDiv = document.getElementById('comparison');
const resultsDiv = document.getElementById('results');

// Your YouTube API key
const API_KEY = 'YOUR_YOUTUBE_API_KEY_HERE';

let songs = [];
let sortedSongs = [];

startButton.addEventListener('click', async () => {
    const playlistUrl = playlistInput.value;
    const playlistId = new URLSearchParams(new URL(playlistUrl).search).get('list');

    if (!playlistId) {
        alert('Invalid playlist URL!');
        return;
    }

    songs = await fetchSongsFromPlaylist(playlistId);
    if (songs.length === 0) {
        alert('No songs found in the playlist!');
        return;
    }

    sortedSongs = await mergeSortWithUser(songs);
    resultsDiv.innerHTML = "<h2>Ranking:</h2>" + sortedSongs.map(s => `<p>${s.title}</p>`).join('');
});

async function fetchSongsFromPlaylist(playlistId) {
    let nextPageToken = '';
    let songList = [];

    do {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`);
        const data = await response.json();
        songList.push(...data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.snippet.resourceId.videoId
        })));
        nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);

    return songList;
}

async function mergeSortWithUser(arr) {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = await mergeSortWithUser(arr.slice(0, mid));
    const right = await mergeSortWithUser(arr.slice(mid));

    return await merge(left, right);
}

async function merge(left, right) {
    let result = [];
    while (left.length && right.length) {
        const choice = await promptUser(left[0], right[0]);
        if (choice === left[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    return result.concat(left, right);
}

function promptUser(song1, song2) {
    return new Promise(resolve => {
        comparisonDiv.innerHTML = `
            <h3>Which song do you prefer?</h3>
            <button id="song1">${song1.title}</button>
            <button id="song2">${song2.title}</button>
        `;
        document.getElementById('song1').onclick = () => resolve(song1);
        document.getElementById('song2').onclick = () => resolve(song2);
    });
}
