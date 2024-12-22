let songs = [];
let mergesortSteps = [];
let currentComparison = null;
let sortedSongs = [];

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
        return [...left, ...right];
    }
    mergeSort(arr);
    return steps.reverse();
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
        showComparison(left[0], right[0]);
    }
}

function showComparison(leftSong, rightSong) {
    document.getElementById('comparisonPrompt').innerText = 'Which song is better?';
    document.getElementById('leftTitle').innerText = leftSong.title;
    document.getElementById('leftVideo').src = `https://www.youtube.com/embed/${leftSong.videoId}`;
    document.getElementById('rightTitle').innerText = rightSong.title;
    document.getElementById('rightVideo').src = `https://www.youtube.com/embed/${rightSong.videoId}`;
    document.getElementById('chooseLeft').onclick = () => chooseSong(leftSong, rightSong, 'left');
    document.getElementById('chooseRight').onclick = () => chooseSong(leftSong, rightSong, 'right');
}

function chooseSong(leftSong, rightSong, choice) {
    if (choice === 'left') {
        currentComparison.merged.push(leftSong);
        currentComparison.left.shift();
    } else {
        currentComparison.merged.push(rightSong);
        currentComparison.right.shift();
    }
    processNextComparison();
}

function displayResults() {
    document.getElementById('rankingSection').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    const rankedList = document.getElementById('rankedList');
    rankedList.innerHTML = '';
    sortedSongs.forEach(song => {
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
    const response = await fetch(`https://api.example.com/playlist?playlistId=${playlistId}`);
    const data = await response.json();
    if (!data || !data.videos) {
        throw new Error('Invalid playlist data');
    }
    return data.videos.map(video => ({
        title: video.title,
        videoId: video.id
    }));
}
