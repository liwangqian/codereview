'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var DOM;
(function (DOM) {
    function getElementById(id) {
        return document.getElementById(id);
    }
    DOM.getElementById = getElementById;
    // export function query<T extends HTMLElement>(selectors: string): T;
    // export function query<T extends HTMLElement>(element: HTMLElement, selectors: string): T;
    // export function query<T extends HTMLElement>(elementOrselectors: string | HTMLElement, selectors?: string): T {
    //     let element: Document | HTMLElement;
    //     if (typeof elementOrselectors === 'string') {
    //         element = document;
    //         selectors = elementOrselectors;
    //     }
    //     else {
    //         element = elementOrselectors;
    //     }
    //     return element.querySelector(selectors) as T;
    // }
    // export function queryAll<T extends Element>(selectors: string): T;
    // export function queryAll<T extends Element>(element: HTMLElement, selectors: string): T;
    // export function queryAll<T extends Element>(elementOrselectors: string | HTMLElement, selectors?: string): T {
    //     let element: Document | HTMLElement;
    //     if (typeof elementOrselectors === 'string') {
    //         element = document;
    //         selectors = elementOrselectors;
    //     }
    //     else {
    //         element = elementOrselectors;
    //     }
    //     return element.querySelectorAll(selectors) as NodeList<T>;
    // }
    function listenAll(selector, name, listener) {
        const els = document.querySelectorAll(selector);
        for (const el of els) {
            el.addEventListener(name, listener, false);
        }
    }
    DOM.listenAll = listenAll;
})(DOM = exports.DOM || (exports.DOM = {}));
//# sourceMappingURL=dom.js.map