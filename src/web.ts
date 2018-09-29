
import * as http from 'http';
import express from 'express';
import * as _ from "lodash";
import { Service } from './app';
import { store } from './store';
const bodyParser = require("body-parser");

export function run(app: Service): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const server = express();
        const httpServer = http.createServer(server);
        server.use(bodyParser.urlencoded({ extended: false }));
        server.use(bodyParser.json());

        server.post('/googlehome', (req, res) => {
            const text = req.body.text;
            if (_.isString(text) && text.length) {
                app.onVoiceCommand(req.body.text);
            }
            res.end();
        });

        server.post('/scroll-up', (req, res) => {
            app.sendCommand('scroll', { direction: "up" });
            res.end();
        });

        server.post('/scroll-down', (req, res) => {
            app.sendCommand('scroll', { direction: "down" });
            res.end();
        });

        server.post("*", (req, res) => {
            console.log(req.body);
            console.log(req.url);
            res.json({test: "あいうえお"});
            res.end();
        });

        server.post('/api/slack', (req, res) => {
            store.getModels().webview.changeUrl(req.url);
            res.end();
        });

        server.post('/api/ifttt', (req, res) => {

        });

        const port = process.env.PORT || 8080;
        httpServer.listen(port, (error: any) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

}

