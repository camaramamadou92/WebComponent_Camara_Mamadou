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
            }
            #myCanvas {
              border:1px solid;
            }
        </style>
        <h1>lecteur audio amélioré</h1>
        <canvas id="myCanvas" width=400 height=100></canvas>
        <br>
        <audio id="player" src="${this.src}" controls crossorigin="anonymous"></audio>
        <br>
        <button id="play">Play</button>
        <button id="pause">Pause</button>
        <button id="stop">Stop</button>
        <br>
        <label>Volume 
          <input id="volumeSlider" 
          type="range" min=0 max=2 step=0.1 value="1">
        </label>
        <br>
        <webaudio-knob 
          id="volumeKnob" 
          src="./assets/knobs/vernier.png" 
          value="1" max="2" step="0.1" diameter="128" sprites="50" 
          valuetip="0" tooltip="Volume">
        </webaudio-knob>
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
    this.canvasCtx.fillRect(10+Math.random()*10, 10, 20, 20);

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
      knob.src =  baseURL  + src;

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