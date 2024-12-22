let songs = [];
let currentIndex = 0;

class Song {
  constructor(title, creator, ytembed) {
    this.title = title;
    this.creator = creator;
    this.ytembed = ytembed;
  }
}

async function fetchPlaylist() {
  const playlistUrl = document.getElementById("playlist-url").value;
  
  // Fetch playlist data and extract song information (assuming the playlist is valid)
  // In a real scenario, use the YouTube API to get the playlist details.
  // For now, we will simulate song objects.

  songs = [
    new Song("Song Title 1", "Creator 1", "https://www.youtube.com/embed/example1"),
    new Song("Song Title 2", "Creator 2", "https://www.youtube.com/embed/example2"),
    new Song("Song Title 3", "Creator 3", "https://www.youtube.com/embed/example3"),
    // More songs can be added here
  ];

  switchToSortingPhase();
}

function switchToSortingPhase() {
  document.getElementById("input-phase").style.display = "none";
  document.getElementById("sorting-phase").style.display = "block";
  showComparison();
}

function showComparison() {
  const song1 = songs[currentIndex * 2];
  const song2 = songs[currentIndex * 2 + 1];

  document.getElementById("embed1").src = song1.ytembed;
  document.getElementById("title1").innerText = song1.title;
  document.getElementById("creator1").innerText = song1.creator;

  document.getElementById("embed2").src = song2.ytembed;
  document.getElementById("title2").innerText = song2.title;
  document.getElementById("creator2").innerText = song2.creator;
}

function chooseSong(choice) {
  const song1 = songs[currentIndex * 2];
  const song2 = songs[currentIndex * 2 + 1];
  
  if (choice === 1) {
    // Song 1 is lower
    [song1, song2] = [song2, song1];
  }

  songs[currentIndex * 2] = song1;
  songs[currentIndex * 2 + 1] = song2;

  currentIndex++;

  if (currentIndex * 2 >= songs.length) {
    // Sorting done, move to results phase
    mergeSort(songs);
    switchToResultsPhase();
  } else {
    showComparison();
  }
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  let result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    result.push(left[i].title < right[j].title ? left[i++] : right[j++]);
  }

  return result.concat(left.slice(i), right.slice(j));
}

function switchToResultsPhase() {
  document.getElementById("sorting-phase").style.display = "none";
  document.getElementById("results-phase").style.display = "block";
  showResults();
}

function showResults() {
  const rankingList = document.getElementById("ranking-list");
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.innerText = `${index + 1}. ${song.title} - ${song.creator}`;
    rankingList.appendChild(li);
  });
}
