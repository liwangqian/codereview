'use strict';

export namespace DOM {
    export function getElementById<T extends HTMLElement>(id: string): T {
        return document.getElementById(id) as T;
    }

    export function listenAll(selector: string, name: string, listener: EventListenerOrEventListenerObject) {
        const els = document.querySelectorAll(selector);
        for (const el of els) {
            el.addEventListener(name, listener, false);
        }
    }
}