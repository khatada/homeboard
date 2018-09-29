import { ipcRenderer, Event } from 'electron';
import * as _ from "lodash";
import animateScrollTo from 'animated-scroll-to';

function getLink(text: string): HTMLAnchorElement | HTMLButtonElement{
    const anchorTags = document.querySelectorAll('a');
    const anchorCount = anchorTags.length;
    for (let i = 0; i < anchorCount; i++) {
        const tag = anchorTags.item(i);
        if (tag.innerText.trim() === text) {
            return tag
        }
    }
    for (let i = 0; i < anchorCount; i++) {
        const tag = anchorTags.item(i);
        if (tag.innerText.indexOf(text) >= 0) {
            return tag
        }
    }
    const buttonTags = document.querySelectorAll('button');
    const buttonCount = buttonTags.length;
    for (let i = 0; i < buttonCount; i++) {
        const tag = buttonTags.item(i);
        if (tag.innerText.trim() === text) {
            return tag
        }
    }
    for (let i = 0; i < buttonCount; i++) {
        const tag = buttonTags.item(i);
        if (tag.innerText.indexOf(text) >= 0) {
            return tag
        }
    }
}

ipcRenderer.on('navigate', (event: Event, json: any) => {
    const text = json.text;
    const a = getLink(text);

    if (a) {
        a.click();
    }
});

ipcRenderer.on('scroll', (event: Event, json: any) => {
    const factor = _.isNumber(json.factor) ? json.factor : 0.7;
    if (json.direction === "up") {
        animateScrollTo(window.scrollY - window.innerHeight * factor);
    } else if (json.direction === "down") {
        animateScrollTo(window.scrollY + window.innerHeight * factor);
    } else if (json.direction === "left") {
        animateScrollTo(window.scrollX - window.innerWidth  * factor, { horizontal: true });
    } else if (json.direction === "right") {
        animateScrollTo(window.scrollX + window.innerWidth  * factor, { horizontal: true });
    }
});