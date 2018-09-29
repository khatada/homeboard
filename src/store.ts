import { Model, Store } from "./model";

interface WebViewState {
    url: string;
    updatedAt: Date;
};
const initialWebViewState: WebViewState = {
    url: "abc",
    updatedAt: new Date()
};

export class WebView extends Model<WebViewState, AppStoreModel> {
    getInitialState(): WebViewState {
        return initialWebViewState;
    }

    changeUrl(url: string): Promise<void> {
        return this.action(async (dispatcher, getModels) => {
            dispatcher(this.state.merge({url, updatedAt: new Date()}));
        });
    }
}

export interface AppStore {
    webview: WebViewState;
}

export interface AppStoreModel {
    webview: WebView;
}

export const store = new Store<AppStore, AppStoreModel>({
    webview: new WebView()
});
