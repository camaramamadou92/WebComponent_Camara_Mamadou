import './lib/webaudio-controls.js';

const getBaseURL = () => {
  return new URL('.', import.meta.url);
};

class myComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.src = this.getAttribute('src');

    // pour faire du WebAudio
    this.ctx = new AudioContext();
  }

  connectedCallback() {
    // Do something
    this.shadowRoot.innerHTML = `
    <style>
    h1 {
      color:red;
      align-text: center;
  }
  #myCanvas {
    border:1px solid;
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
  </style>
    
    <section>
    <h1>Version Lecteur Audio amélioré CAMARA Mamadou</h1>
    <canvas id="myCanvas" width=400 height=100></canvas>
        <br>
        <audio id="player" src="${this.src}" controls crossorigin="anonymous"></audio>
        <br>
        <hr/>
        <center>
        <img id="play" src="myComponents/assets/knobs/play.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="pause" src="myComponents/assets/knobs/pause.jpg" style="width:70px; height:70px; border-radius:100%;">
        <img id="stop" src="myComponents/assets/knobs/stop.jpg" style="width:70px; height:70px; border-radius:100%;">
        </center>
        <br>
        <center>
        <webaudio-knob id="volumeSlider" tooltip="Volume:%s" src="./assets/knobs/metal.png" sprites="30" diameter="128" style="height:128px" min=0 max=3 step=0.1 value=1.5>
        Volume
        </webaudio-knob>
        </center>
        <br>
        </section>
    `;

    this.fixRelativeURLs();

    this.player = this.shadowRoot.querySelector('#player');



    this.buildGraph();

    // pour dessiner/animer
    this.canvas = this.shadowRoot.querySelector('#myCanvas');
    this.canvasCtx = this.canvas.getContext('2d');

    this.player.onplay = () => {
      // pour démarrer webaudio lors d'un click...
      console.log("play");
      this.ctx.resume()
    }

    this.defineListeners();

    // on démarre l'animation
    requestAnimationFrame(() => {
      this.animation();
    });
  }

  animation() {
    // 1 - on efface le canvas
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2 - je dessine la waveform
    this.canvasCtx.fillRect(10 + Math.random() * 10, 10, 20, 20);

    // 3 - on rappelle la fonction dans 1/60ème de seconde
    requestAnimationFrame(() => {
      this.animation();
    });
  }

  buildGraph() {
    let source = this.ctx.createMediaElementSource(this.player);
    source.connect(this.ctx.destination);
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
  }

  defineListeners() {
    this.shadowRoot.querySelector('#play').addEventListener('click', () => {
      this.player.play();
    });

    this.shadowRoot.querySelector('#pause').addEventListener('click', () => {
      this.player.pause();
    });
    this.shadowRoot.querySelector('#stop').addEventListener('click', () => {
      this.player.pause();
      this.player.currentTime = 0;
    });
    this.shadowRoot.querySelector('#volumeSlider').addEventListener('input', (evt) => {
      this.player.volume = evt.target.value;
    });
  }
}

customElements.define("my-audio", myComponent);