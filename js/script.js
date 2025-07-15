console.log("lets gooo");
let currentsong = new Audio();
let songs = [];
let currfolder = "";

function convertMinutesToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currfolder = folder;

    // Load track list from info.json
    let info = await fetch(`/${folder}/info.json`).then(res => res.json());
    songs = info.tracks;

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";

    for (const song of songs) {
        songul.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info"><div>${song.replaceAll("%20", " ")}</div></div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}


const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + encodeURIComponent(track);
    if (!pause) {
        currentsong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

async function displayalbums() {
    // Fetch the list of folders from index.json
    const folders = await fetch("/songs/index.json").then(res => res.json());

    const cardContainer = document.querySelector(".cardContainer");

    for (let folder of folders) {
        try {
            const info = await fetch(`/songs/${folder}/info.json`).then(res => res.json());

            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("data-folder", folder);
            card.innerHTML = `
                <div class="play"><i class="fa-solid fa-play"></i></div>
                <img src="/songs/${folder}/cover.jpg" alt="cover" />
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            `;

            card.addEventListener("click", async () => {
                await getSongs(`songs/${folder}`);
                if (songs.length > 0) playmusic(songs[0], true);
            });

            cardContainer.appendChild(card);
        } catch (err) {
            console.error(`Failed to load /songs/${folder}/info.json`, err);
        }
    }
}


async function main() {
    await displayalbums();

    document.getElementById("play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            document.getElementById("play").src = "img/pause.svg";
        } else {
            currentsong.pause();
            document.getElementById("play").src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertMinutesToMMSS(currentsong.currentTime)}/${convertMinutesToMMSS(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        currentsong.pause();
        let currentTrack = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.findIndex(song => decodeURIComponent(song) === currentTrack);
        if (index > 0) playmusic(songs[index - 1]);
    });

    document.getElementById("next").addEventListener("click", () => {
        currentsong.pause();
        let currentTrack = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.findIndex(song => decodeURIComponent(song) === currentTrack);
        if (index !== -1 && index < songs.length - 1) {
            playmusic(songs[index + 1]);
        }
    });

    // Volume change via slider
    const range = document.querySelector("input[type='range']");
    const volImg = document.querySelector(".volume img");

    range.addEventListener("input", (e) => {
        const vol = parseInt(e.target.value) / 100;
        currentsong.volume = vol;
        volImg.src = vol > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    // Mute/unmute ONLY when the image is clicked (not the whole volume container)
    volImg.addEventListener("click", () => {
        if (currentsong.volume > 0) {
            currentsong.volume = 0;
            range.value = 0;
            volImg.src = "img/mute.svg";
        } else {
            currentsong.volume = 0.1;
            range.value = 10;
            volImg.src = "img/volume.svg";
        }
    });

}

main();
