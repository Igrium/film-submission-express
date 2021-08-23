const {ipcRenderer} = require('electron');
const container = document.getElementById('container');

/**
 * The current content element.
 */
var content;

/**
 * Display an image.
 * @param {string} src Image URL.
 */
function displayImage(src) {
    try {
        clear();
        var img = document.createElement('img');
        img.src = src;
        img.className = "content";
        img.onerror = (message, source, lineno, colno, err) => {
            error(message, err)
        }

        container.appendChild(img);
        content = img;
    } catch (err) {
        error(err)
    }  
}

/**
 * Play a video.
 * @param {string} src Video URL.
 */
function displayVideo(src) {
    try {
        clear();
        var video = document.createElement('video');
        video.src = src;
        video.autoplay = true;
        
        video.onended = () => {
            ipcRenderer.send('player.mediaFinished');
        }
    
        video.ondurationchange = () => {
            ipcRenderer.send('player.durationChange', video.duration);
        }
    
        video.ontimeupdate = () => {
            ipcRenderer.send('player.timeUpdate', video.currentTime);
        }

        video.onerror = (message, source, lineno, colno, err) => {
            error(err);
        }
        
        video.className = "content";
        container.appendChild(video);
        content = video;
    } catch (err) {
        error(err);
    }  
}

/**
 * If a video is open, play it.
 */
function play() {
    try {
        content.play()
    } catch (err) {
        error(err);
    }
}

/**
 * If a video is open, pause it.
 */
function pause() {
    try {
        content.pause()
    } catch (err) {
        error(err);
    }
}

/**
 * If the video is currently playing.
 */
function isPlaying() {
    if (content.paused != undefined) {
        return !content.paused;
    } else {
        return false;
    }
}

/**
 * Render HTML to the screen.
 * @param {string} src 
 */
function displayHTML(src) {
    try {
        clear();
        var iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.className = "content";
        container.appendChild(iframe);
        content = iframe;
    
        // Deselect everything just in case
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.getSelection) {
            document.getSelection.empty();
        }
    } catch (err) {
        error(err);
    } 
}

/**
 * Display the title card of a film.
 * @param {string} titleCardSrc Title card source HTML.
 * @param {object} filmMeta Metadata of film to display.
 */
function displayTitleCard(titleCardSrc, filmMeta) {
    clear();
    displayHTML(titleCardSrc);
    content.onload = () => {
        content.contentWindow.load(filmMeta);
    }
}

/**
 * Remove all media elements from the DOM.
 */
function clear() {
    const elements = document.getElementsByClassName("content");
    while(elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    content = undefined;
}

ipcRenderer.on('displayImage', (event, arg) => {
    displayImage(arg);
})

ipcRenderer.on('displayVideo', (event, arg) => {
    displayVideo(arg);
})

ipcRenderer.on('displayHTML', (event, arg) => {
    displayHTML(arg);
})

ipcRenderer.on('displayTitleCard', (event, titleCardSrc, filmMeta) => {
    displayTitleCard(titleCardSrc, filmMeta);
})

ipcRenderer.on('clear', (event, arg) => {
    clear();
})

ipcRenderer.on('play', (event, arg) => {
    play();
})

ipcRenderer.on('pause', (event, arg) => {
    pause();
})

ipcRenderer.on('setIsPlaying', (event, arg) => {
    console.log(`playing: ${arg}`);
    if (arg === true) {
        play();
    } else {
        pause();
    }
})

ipcRenderer.on('isPlaying', (event, callback) => {
    callback(isPlaying);
})

function error(message, err) {
    console.error(message);
    console.log("Reporting error to backend.")
    ipcRenderer.send('player.error', message, err);
}