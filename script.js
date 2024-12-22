let songs = [];
let mergesortSteps = [];
let currentComparison = null;
let sortedSongs = [];

document.getElementById('addSongButton').addEventListener('click', () => {
    const url = document.getElementById('songUrl').value.trim();
    if (url) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
            fetchVideoTitle(videoId).then(title => {
                songs.push({ title, videoId });
                document.getElementById('songUrl').value = '';
                if (songs.length > 1) {
                    document.getElementById('startTournamentButton').style.display = 'inline-block';
                }
            }).catch(error => {
                alert('Error fetching video title: ' + error.message);
            });
        } else {
            alert('Invalid YouTube URL');
        }
    }
});

document.getElementById('startTournamentButton').addEventListener('click', startTournament);

function startTournament() {
    mergesortSteps = prepareMergeSortSteps(songs);
    document.getElementById('rankingSection').style.display = 'block';
    document.getElementById('results').style.display = 'none';
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
        sortedSongs = songs; // Replace with actual sorted logic
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
    document.getElementById('comparisonPrompt').innerText = `Which song do you prefer?`;
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

function extractYouTubeId(url) {
    const match = url.match(/[?&]v=([^&#]*)/);
    return match ? match[1] : null;
}

// Fetch title from YouTube video page (this function should handle the error when fetching)
async function fetchVideoTitle(videoId) {
    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const text = await response.text();
        const match = text.match(/<title>(.*?)<\/title>/);
        if (match && match[1]) {
            return match[1].replace(' - YouTube', '').trim();
        }
        throw new Error('Title not
