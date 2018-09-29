import React from 'react';
import ReactDOM from 'react-dom';
import styled, { injectGlobal } from 'styled-components';
import { ipcRenderer, Event, WebviewTag } from "electron";
import { AppStore } from "../store";

injectGlobal`
    html, body {
        position: relative;
        width: 100%;
        height: 100%;
    }
    * {
        margin: 0;
        padding: 0;
    }
`

interface AppProps {
    className?: string;
}

interface AppStates extends AppStore {
}

// クラスの場合
class App extends React.Component<AppProps, AppStates> {

    state: AppStates = {
        webview: {
            url: "https://www.yahoo.co.jp/",
            updatedAt: new Date()
        }
    }

    private webview: WebviewTag = null;
    constructor(props: AppProps) {
        super(props);

        this.setWebViewRef = this.setWebViewRef.bind(this);
        this.onWebViewDidFinishLoad = this.onWebViewDidFinishLoad.bind(this);

        ipcRenderer.on('store', (event: Event, json: any) => {
            this.setState(json);
        });
        ipcRenderer.on('command', (event: Event, json: any) => {
            if (['navigate', 'scroll'].indexOf(json.command) >= 0) {
                if (this.webview) {
                    this.webview.send(json.command, json.options);
                }
            }
        });
    }

    componentDidMount() {
        (window as any)["root"] = this;
        if (this.webview) {

        }
    }

    setWebViewRef(webview: HTMLWebViewElement): void {
        if (this.webview) {
            this.webview.removeEventListener("did-finish-load", this.onWebViewDidFinishLoad);
        }
        this.webview = webview as any;
        if (this.webview) {
            this.webview.addEventListener("did-finish-load", this.onWebViewDidFinishLoad);
        }
    }

    onWebViewDidFinishLoad() {
        console.log("did finish load");
    }

    render(): JSX.Element {
        const { className } = this.props;
        return (
            <div className={className}>
                <webview className='webview' preload='dist/scripts/preload.js' key={this.state.webview.updatedAt.valueOf()} src={this.state.webview.url} ref={this.setWebViewRef} />
            </div>
        );
    }
}

const StyledApp = styled(App)`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    & .webview {
        position: relative;
        width: 100%;
        height: 100%;
    }
`;


// レンダリング
ReactDOM.render(<StyledApp />, document.getElementById('contents'));