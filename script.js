let songs = [];
let mergesortSteps = [];
let currentComparison = null;
let sortedSongs = [];

function startRanking() {
    mergesortSteps = prepareMergeSortSteps(songs);
    document.getElementById('manualEntrySection').style.display = 'none';
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

// Add a song manually via form
document.getElementById('songForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const title = document.getElementById('songTitle').value;
    const url = document.getElementById('songUrl').value;
    
    if (!title || !url) return;
    
    // Extract YouTube video ID from URL
    const videoId = extractYouTubeId(url);
    if (videoId) {
        songs.push({ title, videoId });
        document.getElementById('songTitle').value = '';
        document.getElementById('songUrl').value = '';
    } else {
        alert('Invalid YouTube URL');
    }
});

// Extract video ID from YouTube URL
function extractYouTubeId(url) {
    const match = url.match(/[?&]v=([^&#]*)/);
    return match ? match[1] : null;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chooseLeft').style.display = 'none';
    document.getElementById('chooseRight').style.display = 'none';
});
