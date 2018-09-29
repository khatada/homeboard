import { BrowserWindow, App, app } from 'electron'
import * as path from 'path';
import { store } from './store';

export class Service {
    readonly app: App;
    readonly mainURL: string = `file://` + path.join(__dirname, '..', 'index.html');

    private mainWindow: BrowserWindow = null;

    constructor(app: App) {
        this.app = app;
        this.app.on('window-all-closed', this.onWindowAllClosed.bind(this))
        this.app.on('ready', this.onReady.bind(this));
        this.app.on('activate', this.onActivate.bind(this));
    }

    private onWindowAllClosed(): void {
        this.app.quit();
    }

    private create(): void {
        if (!this.mainWindow) {
            this.mainWindow = new BrowserWindow({
                width: 800,
                height: 400,
                minWidth: 500,
                minHeight: 200,
                acceptFirstMouse: true,
                titleBarStyle: 'hidden',
                title: 'HomeBoard'
            });

            this.mainWindow.loadURL(this.mainURL);

            this.mainWindow.once('closed', () => {
                this.mainWindow = null;
            });

            this.mainWindow.webContents.once('did-finish-load', () => {
                const json = store.toJSON();
                console.log(json);
                this.mainWindow.webContents.send("store", json);
            });

            store.on("change", () => {
                const json = store.toJSON();
                console.log(json);
                this.mainWindow.webContents.send("store", json);
            });
        }
    }

    private onReady(): void {
        this.create();
    }

    private onActivate(): void {
        this.create();
    }

    sendCommand(command: string, options: any) {
        this.mainWindow.webContents.send("command", {command, options});
    }

    onVoiceCommand(text: string) {
        if(text.includes("天気")) {
            if(text.includes("明日")) {
                store.getModels().webview.changeUrl("https://weather.yahoo.co.jp/weather/jp/3.html?day=2");
            } else {
                store.getModels().webview.changeUrl("https://weather.yahoo.co.jp/weather/jp/3.html?day=1");
            }
        } else if(text.includes("レシピ")) {
            const tokens = text.split(/\s/);
            const recipe = this.extractOfTarget(tokens, "レシピ");
            const orangePage = `https://www.orangepage.net/recipes/search?utf8=%E2%9C%93&search_recipe%5Bkeyword%5D=${recipe}`;
            store.getModels().webview.changeUrl(orangePage);
        } else if(text.includes("リンク")) {
            const tokens = text.split(/\s/);
            const linkText = this.extractOfTarget(tokens, "リンク");
            this.sendCommand("navigate", {text: linkText});
        }
    }

    private extractOfTarget(tokens: string[], target: string): string {
        const targetPosition = tokens.indexOf(target);
        if (targetPosition === 1) {
            return tokens[0];
        } else if (targetPosition > 1) {
            if (tokens[targetPosition - 1] === "の") {
                return tokens.slice(0, targetPosition - 1).join("");
            } else {
                return tokens.slice(0, targetPosition).join("");
            }
        } else {
            return null;
        }
    }
}

export function run(): Service {
    return new Service(app);
}