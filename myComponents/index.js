
import './lib/webaudio-controls.js';
const getBaseURL = () => {
    const initUrl = new URL('.', import.meta.url);
    console.log("initUrl = " + initUrl);
    return `${initUrl}`;
};

const template = document.createElement("template");
template.innerHTML = `
    <style>
    h1 {
        color:red;
        align-text: center;
    }
    section {
        margin: 0px auto;
        padding: auto;
        height: 100%;
        width: 100%;
        border: 2px solid blue;
        border-radius: 0%;
        background-image: url('myComponents/assets/knobs/fond.jpg');
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        align-items: center;
        justify-content: center;
     }
       canvas {
         border :1px solid black;
         border-radius:10%;
         width:500px;
         margin:auto;
       }

       progress{
        border :1px solid black;
        border-radius:10%;
        height:2px;
        width:500px;
        background-color:green;
       }
       audio {
        border :1px solid black;
        border-radius:10%;
        width:500px;
        background-color:gray;
       }
    </style>
    <section>
    <center>
    <h1>Version CAMARA Mamadou Lecteur Audio amélioré </h1>
    </center>
    <center>
          <audio id="myPlayer" controls="controls" crossorigin="anonymous">
          <source src="https://mainline.i3s.unice.fr/mooc/LaSueur.mp3" type="audio/mp3" />
          <source src="http://mainline.i3s.unice.fr/mooc/elephants-dream-medium.mp4" type="audio/mp4" />
          </audio>
          </center>
          <br/>
          <hr/>
          <center>
          <canvas id = "myCanvas" width = 500 height = 100 ></canvas>
          </center>
          <center>
          <img id="play" src="./assets/knobs/play.jpg" style="width:70px; height:70px; border-radius:100%;">
          <img id="pause" src="./assets/knobs/pause.jpg" style="width:70px; height:70px; border-radius:100%;">
          <img id="preview" src="./assets/knobs/preview.jpg" style="width:70px; height:70px; border-radius:100%;">
          <img id="stop" src="./assets/knobs/stop.jpg" style="width:70px; height:70px; border-radius:100%;">
          <img id="suivant" src="./assets/knobs/suivant.jpg" style="width:70px; height:70px; border-radius:100%;">
          <img id="rejouer" src="./assets/knobs/rejouer.jpg" style="width:70px; height:70px; border-radius:100%;">
          </center>
          <br/>
          <center>
          <br/>
          <progress id = "ampliWeb" min=0  value=0 step=0.1></progress>
          <br/>
          <hr/>
          <webaudio-knob id="baLancer" tooltip="Balancer:%s" src="./assets/knobs/metal.png" sprites="30" value=0 min="-1.5" max="1.5" step=0.1 diameter="128" style="height:128px">
              Balance G/D
          </webaudio-knob>
          <webaudio-knob id="volumeSlider" tooltip="Volume:%s" src="./assets/knobs/metal.png" sprites="30" diameter="128" style="height:128px" min=0 max=3 step=0.1 value=1.5>
              Volume
          </webaudio-knob>
        <center>
          <br/><hr/>
         
      </section>
    `;

class myComponent extends HTMLElement {
    constructor() {
        super();
        this.volume = 1;

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.basePath = getBaseURL(); 
        this.cheminImaGe();
    }

    connectedCallback() {
        this.player = this.shadowRoot.querySelector("#myPlayer");
        this.player.loop = true;

        this.canvas = this.shadowRoot.querySelector("#myCanvas");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.canvasContext = this.canvas.getContext('2d');
        //creer un context webaudio
        let audioContext = new AudioContext();
        let sourCe = audioContext.createMediaElementSource(this.player); 
        this.pannerNode = audioContext.createStereoPanner();
        this.analyserNode = audioContext.createAnalyser();
        this.analyserNode.fftSize = 1024;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        sourCe
            .connect(this.pannerNode)
            .connect(this.analyserNode)
            .connect(audioContext.destination); 

        this.animation();
        this.declareListeners();

    }

    animation() {
        //A Nettoyer le canvas 
        this.canvasContext.clearRect(0, 0, this.width, this.height);
        this.analyserNode.getByteTimeDomainData(this.dataArray);
        this.canvasContext.lineWidth = 4;
        this.canvasContext.strokeStyle = 'red';
        this.canvasContext.beginPath();
        var element = this.width / this.bufferLength;
        var x = 0;

        for (var i = 0; i < this.bufferLength; i++) {
            var v = this.dataArray[i] / 255;
            var y = v * this.height;

            if (i === 0) {
                this.canvasContext.moveTo(x, y);
            } else {
                this.canvasContext.lineTo(x, y);
            }

            x += element;
        }

        this.canvasContext.lineTo(this.width, this.height / 2);
        this.canvasContext.stroke();
        requestAnimationFrame(() => { this.animation() });
    }
    declareListeners() {
        this.shadowRoot
            .querySelector("#play")
            .addEventListener("click", (event) => {
                this.play();
            });

        this.shadowRoot
            .querySelector("#preview")
            .addEventListener("click", (event) => {
                this.preview();
            });

        this.shadowRoot
            .querySelector("#suivant")
            .addEventListener("click", (event) => {
                this.suivant();
            });

        this.shadowRoot
            .querySelector("#pause")
            .addEventListener("click", (event) => {
                this.pause();
            });

        this.shadowRoot
            .querySelector("#rejouer")
            .addEventListener("click", (event) => {
                this.replay();
            });

        this.shadowRoot
            .querySelector("#stop")
            .addEventListener("click", (event) => {
                this.stop();
            });

        this.shadowRoot
            .querySelector("#baLancer")
            .addEventListener("input", (event) => {
                //console.log(event.target.value);
                this.setBalance(event.target.value);
            });

        this.shadowRoot
            .querySelector("#volumeSlider")
            .addEventListener("input", (event) => {
                // console.log(event.target.value);
                this.setVolume(event.target.value);
            });
        this.player.addEventListener('maj', (event) => {
            console.log("temps= " + this.player.currentTime + "total duration = " + this.player.duration);
            let p = this.shadowRoot.querySelector("#ampliWeb");
            try {
                p.max = this.player.duration;
                p.value = this.player.currentTime;
            } catch (err) {

            }

        })
    }

    cheminImaGe() {
        let audioCtl = this.shadowRoot.querySelectorAll(
            'webaudio-knob, webaudio-slider, webaudio-switch, img'
        );
        audioCtl.forEach((e) => {
            let imageIniT = e.getAttribute('src');
            if (imageIniT !== undefined) {
                let imagePath = e.getAttribute('src');
                e.src = this.basePath + "/" + imagePath;
            }
        });
    }
    setBalance(val) {
        this.pannerNode.pan.value = val;
    }

    setVolume(val) {
        this.player.Volume = val;
    }

    play() {
        this.player.play();
    }

    suivant() {
        this.player.currentTime += 10
    }

    preview() {
        this.player.currentTime -= 10
    }

    pause() {
        this.player.pause();
    }

    replay() {
        this.player.currentTime = 0;
    }
    stop() {
        this.player.pause()
        this.player.currentTime = 0
    }
}

customElements.define("my-audio", myComponent);
