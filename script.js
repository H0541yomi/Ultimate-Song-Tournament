function showComparison(leftSong, rightSong) {
    return new Promise((resolve) => {
        const comparisonPrompt = document.getElementById('comparisonPrompt');
        const leftTitle = document.getElementById('leftTitle');
        const leftVideo = document.getElementById('leftVideo');
        const rightTitle = document.getElementById('rightTitle');
        const rightVideo = document.getElementById('rightVideo');
        const chooseLeftButton = document.getElementById('chooseLeft');
        const chooseRightButton = document.getElementById('chooseRight');

        if (!comparisonPrompt || !leftTitle || !leftVideo || !rightTitle || !rightVideo || !chooseLeftButton || !chooseRightButton) {
            console.error("One or more elements are missing in the DOM.");
            resolve(null); // Graceful fallback
            return;
        }

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
