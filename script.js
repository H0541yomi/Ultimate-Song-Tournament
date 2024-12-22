let authInstance;
let songs = [];
let mergesortSteps = [];
let currentComparison = null;
let sortedSongs = [];

function loadClient() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
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
}

function login() {
    authInstance.signIn().then(() => {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'inline-block';
        fetchPlaylist();
    }).catch((error) => {
        console.error('Error signing in:', error);
    });
}

function logout() {
    authInstance.signOut().then(() => {
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('rankingSection').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        songs = [];
        mergesortSteps = [];
        sortedSongs = [];
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

async function fetchPlaylist() {
    const playlistId = prompt('Enter YouTube playlist ID:');
    if (!playlistId) return;

    try {
        // Ensure the user is signed in before making the API request
        if (!authInstance.isSignedIn.get()) {
            alert('You must be signed in to fetch a playlist.');
            return;
        }

        const nextPageToken = '';
        do {
            const response = await gapi.client.youtube.playlistItems.list({
                part: 'snippet',
                playlistId: playlistId,
                maxResults: 50,
                pageToken: nextPageToken
            });

            if (response.error) {
                throw new Error('Failed to fetch playlist: ' + response.error.message);
            }

            songs.push(...response.result.items.map(item => ({
                title: item.snippet.title,
                videoId: item.snippet.resourceId.videoId
            })));

            nextPageToken = response.result.nextPageToken || '';
        } while (nextPageToken);

        if (songs.length) {
            startRanking();
        } else {
            alert('No songs found in the playlist.');
        }
    } catch (error) {
        console.error('Error fetching playlist:', error);
        alert('There was an error fetching the playlist.');
    }
}

function startRanking() {
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
    document.getElementById('comparisonPrompt').innerText = `Which song do you prefer?\nLeft: ${leftSong.title} vs Right: ${rightSong.title}`;
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

document.addEventListener('DOMContentLoaded', loadClient);
