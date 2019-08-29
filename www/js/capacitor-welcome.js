window.customElements.define('capacitor-welcome', class extends HTMLElement {
  constructor() {
    super();

    Capacitor.Plugins.SplashScreen.hide();

    const root = this.attachShadow({ mode: 'open' });

    root.innerHTML = `
    <style>
      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        display: block;
        width: 100%;
        height: 100%;
      }
      h1, h2, h3, h4, h5 {
        text-transform: uppercase;
      }
      .button {
        display: inline-block;
        padding: 10px;
        background-color: #73B5F6;
        color: #fff;
        font-size: 0.9em;
        border: 0;
        border-radius: 3px;
        text-decoration: none;
        cursor: pointer;
      }
      main {
        padding: 15px;
      }
      main hr { height: 1px; background-color: #eee; border: 0; }
      main h1 {
        font-size: 1.4em;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      main h2 {
        font-size: 1.1em;
      }
      main h3 {
        font-size: 0.9em;
      }
      main p {
        color: #333;
      }
      main pre {
        white-space: pre-line;
      }
    </style>
    <div>
      <capacitor-welcome-titlebar>
        <h1>Capacitor</h1>
      </capacitor-welcome-titlebar>
      <main>
        <p>
          <button class="button" id="download">Start/resume download</button>
        </p>
        <p id="progress"><p>
      </main>
    </div>
    `
  }

  connectedCallback() {
    const self = this;

    const progressLabel = self.shadowRoot.querySelector('#progress')
    self.shadowRoot.querySelector('#download').addEventListener('click', () => startAsyncDownload(progressLabel))
  }
});

window.customElements.define('capacitor-welcome-titlebar', class extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
    <style>
      :host {
        position: relative;
        display: block;
        padding: 15px 15px 15px 15px;
        text-align: center;
        background-color: #73B5F6;
      }
      ::slotted(h1) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 0.9em;
        font-weight: 600;
        color: #fff;
      }
    </style>
    <slot></slot>
    `;
  }
});

async function startAsyncDownload(lblProgress) {
  const { Filesystem } = Capacitor.Plugins

  const complete = () => {
    lblProgress.innerHTML = 'Done';
  };
  const error = err => {
    console.log('Download failed: ' + err);
    lblProgress.innerHTML = 'Error: ' + err;
  };
  const progress = progress => {
    lblProgress.innerHTML = (100 * progress.bytesReceived / progress.totalBytesToReceive).toFixed(2) + '%';
  };

  try {
    const fileName = 'file_example_MP4_1920.mp4'
    const downloadUrl = 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_1920_18MG.mp4'

    const { uri: filePath } = await Filesystem.getUri({ directory: 'DATA', path: fileName })
    const targetFile = wrapTargetFile(filePath)

    const downloader = new BackgroundTransfer.BackgroundDownloader();
    // Create a new download operation.
    const download = downloader.createDownload(downloadUrl, targetFile);
    // Start the download and persist the promise to be able to cancel the download.
    download.startAsync().then(complete, error, progress);
  } catch (err) {
    console.log('Error: ' + err);
  }
}

const wrapTargetFile = filePath => ({ toURL: () => filePath })
