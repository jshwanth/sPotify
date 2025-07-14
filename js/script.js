console.log("lets gooo")
let currentsong = new Audio();
let songs;
let currfolder;

function convertMinutesToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    //show all the songs in playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML=""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + 
            `<li> <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20"," ")}</div>
                </div>
                <div class="playnow">

                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }
    //attach an event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
    return songs
}

const playmusic = (track,pause=false)=>{
    // let audio=new Audio(`/${folder}/` + track)
    currentsong.src = `/${currfolder}/`+track
    if(!pause){
        currentsong.play()
        play.src="img/pause.svg";

    }
    document.querySelector(".songinfo").innerHTML=decodeURI(track);
    document.querySelector(".songtime").innerHTML="00.00/00.00";
}

async function displayalbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        if(e.href.includes("/songs")&& !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //get the meta dat of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML= cardContainer.innerHTML+`<div data-folder="${folder}" class="card">
            <div  class="play"></div>
            <img src="/songs/${folder}/cover.jpg" alt="Song 1" />
            <div class="play-btn">
              <div class="circle-container">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <h3>${response.title}</h3>
            <p class="p">
              ${response.description}
            </p>
          </div>`
            
        }
    }
     //load the playlist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
        })
    })
}

async function main() {

    // get the list of all the songs
    await getSongs("songs/ncs")
    playmusic(songs[0],true)

    //display all the albums on the page
    await displayalbums()


    // attach an event listener to play ,next,previous
    play.addEventListener("click",()=>{
        if(currentsong.paused){
            currentsong.play();
            play.src="img/pause.svg"
           
        }
        else{
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })
    
    // listen for time update event
    currentsong.addEventListener("timeupdate", ()=>{
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML=`${convertMinutesToMMSS(currentsong.currentTime)}/${convertMinutesToMMSS(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100+"%"
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left = percent +"%";
        currentsong.currentTime = ((currentsong.duration)*percent)/100;
    })
 
    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0"
    })
    //add an event listener for close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentsong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    //add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log("setting volume to",e.target.value,"/100")
        currentsong.volume = parseInt(e.target.value)/100
        if (currentsong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

     // Add event listener to mute the track
     document.querySelector(".volume").addEventListener("click", e=>{ 
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

   

}

main()
