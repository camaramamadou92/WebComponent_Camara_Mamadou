import './lib/webaudio-controls.js';
const getBaseURL = () => {
  const initUrl = new URL('.', import.meta.url);
  console.log("initUrl" + initUrl);
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
    border:1px solid black;
    border-radius: 10%
    width:500px;
    margin: auto;
    color: blue;
  }
  progress{
    border :1px solid black;
        border-radius:10%;
        height:2px;
        width:500px;
        background-color:red;
  }
  audio{
    border :1px solid black;
        border-radius:10%;
        width:500px;
        background-color:blue;
  }
  </style>
    <section>
    <h1>Version CAMARA Mamadou Lecteur Audio amélioré </h1>
        <br>
        <hr/>
        <canvas id = "mycanvas" width =500 height=100></canvas>
        <center>
        <audio id="player" controls crossorigin="anonymous">
        <source src="https://mainline.i3s.unice.fr/mooc/LaSueur.mp3"/>
        <source src="http://mainline.i3s.unice.fr/mooc/elephants-dream-medium.mp4"/>
        </audio>
        <br>
        <hr/>
        </center>
        <br>
        <hr/>
        <center>
        <img id="play" src="myComponents/assets/knobs/play.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="pause" src="myComponents/assets/knobs/pause.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="preview" src="myComponents/assets/knobs/preview.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="stop" src="myComponents/assets/knobs/stop.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="next" src="myComponents/assets/knobs/suivant.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="rejouer" src="myComponents/assets/knobs/rejouer.jpg" style="width:70px; height:70px; border-radius:100%;">
        </center>
        <hr/>
        <br>
        <center>
        <progress id="ampliweb" min = 0 value=0 step=0.1></progress>
        <hr/>
        <br>
        <webaudio-knob id="baLancer" tooltip="Balancer:%s" src="myComponents/assets/knobs/metal.png" sprites="30" diameter="128" style="height:128px" min=-1.5 max=1.5 step=0.1 value=0>
        Balance G/D
        </webaudio-knob>
        <webaudio-knob id="volumeSlider" tooltip="Volume:%s" src="myComponents/assets/knobs/metal.png" sprites="30" diameter="128" style="height:128px" min=0 max=3 step=0.1 value=1.5>
        Volume
        </webaudio-knob>
        </center>
        </section>
`;
class myComponent extends HTMLElement {
  constructor() {
    super();
    this.volume = 1;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.basePath = getBaseURL();
    this.cheminImage();
  }
  connectedCallback() {
    this.player = this.shadowRoot.querySelector('#player');
    this.player.loop = true;
    // pour dessiner/animer
    this.canvas = this.shadowRoot.querySelector('#myCanvas');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.canvasCtx = this.canvas.getContext('2d');

    let audioCtx = new AudioContext();
    //
    let sourCe = audioCtx.createMediaElementSource(this.player);
    //sourCe.connect(audioCtx.destination);
    this.pannerNoeud = audioCtx.createStereoPanner();
    this.analyserNoeud = audioCtx.createAnalyser();

    this.analyserNoeud.fftSize = 1024;
    this.bufferLength = this.analyserNoeud.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    sourCe
      .connect(this.pannerNoeud)
      .connect(this.analyserNoeud)
      .connect(audioCtx.destination);
    this.animation();
    this.defineListeners();
  }

  animation() {
    // 1 - on efface le canvas
    this.canvasCtx.clearRect(0, 0, this.width, this.height);
    this.analyserNoeud.getByteTimeDomainData(this.dataArray);
    // 2 - je dessine la waveform
    this.canvasCtx.lineWidth = 4;
    this; this.canvasCtx.strokeStyle = 'bleu';

    this.canvas.ctx.beginPath();
    var element = this.width / this.bufferLength;
    var x = 0;
    for (var i = 0; i < this.bufferLength; i++) {
      var m = this.dataArray[i] / 255;
      var y = m * this.height;
      if (i == 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }
      x += element;
    }
    this.canvasCtx.lineTo(this.width, this.height / 2);
    this.canvasCtx.stroke();
    // 3 - on rappelle la fonction dans 1/60ème de seconde
    requestAnimationFrame(() => {
      this.animation();
    });
  }

  /*buildGraph() {
    
  }

  fixRelativeURLs() {
    const baseURL = getBaseURL();
    console.log('baseURL', baseURL);

    const knobs = this.shadowRoot.querySelectorAll('webaudio-knob');

    for (const knob of knobs) {
      console.log("fixing " + knob.getAttribute('src'));

      const src = knob.src;
      knob.src = baseURL + src;

      console.log("new value : " + knob.src);
    }
  }*/

  defineListeners() {
    this.shadowRoot.querySelector('#play').addEventListener('click', () => {
      this.play();
    });

    this.shadowRoot.querySelector('#pause').addEventListener('click', () => {
      this.pause();
    });
    this.shadowRoot.querySelector('#preview').addEventListener('click', () => {
      this.preview();
    });
    this.shadowRoot.querySelector('#stop').addEventListener('click', () => {
      this.pause();
    });
    this.shadowRoot.querySelector('#next').addEventListener('click', () => {
      this.suivant();

    });
    this.shadowRoot.querySelector('#rejouer').addEventListener('click', () => {
      this.rejouer();
    });
    //balance
    this.shadowRoot.querySelector('#baLancer').addEventListener('input', (evt) => {
      //this.player.volume = evt.target.value;
      this.setBalance(evt.target.value);
    });
    //volume
    this.shadowRoot.querySelector('#volumeSlider').addEventListener('input', (evt) => {
      //this.player.volume = evt.target.value;
      this.setVolume(evt.target.value);
    });
    //}
    /*suivant(){
      this.player.currentTime +=10
    }*/

    this.player.addEventListener('maj', (e) => {
      console.log("le temps =" + this.player.currentTime + "total duration = " + this.player.duration);
      let am = this.shadowRoot.querySelector("#ampliweb");
      try {
        am.max = this.player.duration;
        am.value = this.player.currentTime;
      } catch (err) {

      }
    })
  }

  cheminImage() {
    let webaudioControls = this.shadowRoot.querySelector('webaudio-knob, webaudio-slider, webaudio-switch, img');
    webaudioControls.forEach((e) => {
      let CheminInitial = e.getAttribute('src');
      if (CheminInitial !== undefined) {
        let cheminiMage = e.getAttribute('src');
        e.src = this.basePath + "/" + cheminiMage;
      }
    });
  }
  setBalance(){
    this.pannerNoeud.pan.value = val;
  }
  setVolume(){
    this.player.volume = val;
  }
  play(){
this.player.play();
  }
  suivant(){
    this.player.currentTime += 10
  }


}

customElements.define("my-audio", myComponent);