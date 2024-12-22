let authInstance;
let songs = [];
let mergesortSteps = [];
let currentComparison = null;
let sortedSongs = [];

// Initialize Google API Client
function initializeClient() {
    gapi.load('client:auth2', function () {
        gapi.client.init({
            clientId: '400708940817-cpvvq9ipank0miiad71bjoplogpiq173.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/youtube.readonly'
        }).then(() => {
            authInstance = gapi.auth2.getAuthInstance();
            document.getElementById('loginButton').addEventListener('click', login);
            document.getElementById('logoutButton').addEventListener('click', logout);
        }).catch((error) => {
            console.error('Error initializing Google API client:', error);
        });
    });
}

// User Login
function login() {
    authInstance.signIn().then(() => {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'inline-block';
        document.getElementById('addSongSection').style.display = 'block';
    }).catch((error) => {
        console.error('Error signing in:', error);
    });
}

// User Logout
function logout() {
    authInstance.signOut().then(() => {
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('addSongSection').style.display = 'none';
        document.getElementById('rankingSection').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        songs = [];
        mergesortSteps = [];
        sortedSongs = [];
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Add song to the array and start the tournament if applicable
document.getElementById('addSongButton').addEventListener('click', function() {
    const url = document.getElementById('songUrl').value;
    const title = document.getElementById('songTitle').value;

    // Extract YouTube video ID from URL
    const videoId = extractYouTubeId(url);
    if (videoId) {
        songs.push({ title, videoId });
        document.getElementById('songTitle').value = '';
        document.getElementById('songUrl').value = '';
        if (songs.length > 1) {
            document.getElementById('rankingSection').style.display = 'block';
        }
    } else {
        alert('Invalid YouTube URL');
    }
});

// Extract video ID from YouTube URL
function extractYouTubeId(url) {
    const match = url.match(/[?&]v=([^&#]*)/);
    return match ? match[1] : null;
}

// Start the tournament (merge sorting)
document.getElementById('startTournamentButton').addEventListener('click', function() {
    startRanking();
});

function startRanking() {
    mergesortSteps = prepareMergeSortSteps(songs);
    document.getElementById('rankingSection').style.display = 'none';
    document.getElementById('comparisonSection').style.display = 'block';
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
        sortedSongs = songs;
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
    document.getElementById('leftTitle').innerText = leftSong.title;
    document.getElementById('rightTitle').innerText = rightSong.title;
    
    document.getElementById('leftEmbed').innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${leftSong.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    document.getElementById('rightEmbed').innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${rightSong.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
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
    document.getElementById('comparisonSection').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    const rankedList = document.getElementById('rankedList');
    rankedList.innerHTML = '';
    sortedSongs.forEach(song => {
        const li = document.createElement('li');
        li.innerText = song.title;
        rankedList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', initializeClient);
