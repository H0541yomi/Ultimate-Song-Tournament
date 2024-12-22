let songs = [];
let mergesortSteps = [];
let currentComparison = null;
let sortedSongs = [];
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
    mergesortSteps = prepareMergeSortSteps(songs);
    document.getElementById('mainSection').style.display = 'none';
    document.getElementById('rankingSection').style.display = 'block';
    processNextComparison();
}

function prepareMergeSortSteps(arr) {
    const steps = [];
    function mergeSort(array) {
        if (array.length <= 1) return array;
        const mid = Math.floor(array.length / 2);
        const left = mergeSort(array.slice(0, mid));
        const right = mergeSort(array.slice(mid));
        steps.push([left, right]);
        return merge(left, right);
    }

    function merge(left, right) {
        let result = [];
        let leftIndex = 0;
        let rightIndex = 0;
        while (leftIndex < left.length && rightIndex < right.length) {
            // Compare based on user choice
            result.push(compare(left[leftIndex], right[rightIndex]) === 'left' ? left[leftIndex++] : right[rightIndex++]);
        }
        return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
    }

    return mergeSort(arr);
}

function compare(leftSong, rightSong) {
    return new Promise((resolve) => {
        showComparison(leftSong, rightSong); // Show the comparison between the two songs
        document.getElementById('chooseLeft').onclick = () => {
            console.log('Left choice made'); // Debugging line
            resolve('left'); // If left is chosen
        };
        document.getElementById('chooseRight').onclick = () => {
            console.log('Right choice made'); // Debugging line
            resolve('right'); // If right is chosen
        };
    });
}

function processNextComparison() {
    if (!mergesortSteps.length) {
        sortedSongs = songs; // Placeholder: Replace with merge sort logic
        displayResults();
        return;
    }

    const [left, right] = mergesortSteps.pop();
    currentComparison = { left, right, merged: [] };

    if (!left.length || !right.length) {
        currentComparison.merged = [...left, ...right];
        songs = currentComparison.merged;
        processNextComparison();
    } else {
        // Initiate comparison between two songs
        compare(left[0], right[0]).then(choice => {
            if (choice === 'left') {
                currentComparison.merged.push(left[0]);
                currentComparison.left.shift();
            } else {
                currentComparison.merged.push(right[0]);
                currentComparison.right.shift();
            }
            processNextComparison();
        });
    }
}

function showComparison(leftSong, rightSong) {
    document.getElementById('comparisonPrompt').innerText = 'Which song is better?';
    document.getElementById('leftTitle').innerText = leftSong.title;
    document.getElementById('leftVideo').src = `https://www.youtube.com/embed/${leftSong.videoId}`;
    document.getElementById('rightTitle').innerText = rightSong.title;
    document.getElementById('rightVideo').src = `https://www.youtube.com/embed/${rightSong.videoId}`;

    // Make sure that the video elements are showing
    console.log('Left Video:', leftSong.videoId);
    console.log('Right Video:', rightSong.videoId);
}

function displayResults() {
    document.getElementById('rankingSection').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    const rankedList = document.getElementById('rankedList');
    rankedList.innerHTML = '';
    sortedSongs.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerText = `${index + 1}. ${song.title}`; // Add the rank number
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
            videoId: item.snippet.resourceId.videoId,
            score: Math.random() // Placeholder for user scoring logic
        }));
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        alert('Failed to fetch playlist videos. Please check the playlist ID and try again.');
        throw error;
    }
}
