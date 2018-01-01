"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CLICK_EVENT = typeof document !== 'undefined' && document.ontouchstart
    ? 'touchstart'
    : 'click';
function which(ev) {
    if (typeof window === 'undefined') {
        return false;
    }
    var e = ev || window.event;
    return e.which === null ? e.button : e.which;
}
function sameOrigin(href) {
    if (typeof window === 'undefined') {
        return false;
    }
    return href && href.indexOf(window.location.origin) === 0;
}
function makeClickListener(push) {
    return function clickListener(event) {
        if (which(event) !== 1) {
            return;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
            return;
        }
        if (event.defaultPrevented) {
            return;
        }
        var element = event.target;
        while (element && element.nodeName !== 'A') {
            element = element.parentNode;
        }
        if (!element || element.nodeName !== 'A') {
            return;
        }
        if (element.hasAttribute('download') ||
            element.getAttribute('rel') === 'external') {
            return;
        }
        if (element.target) {
            return;
        }
        var link = element.getAttribute('href');
        if ((link && link.indexOf('mailto:') > -1) || link.charAt(0) === '#') {
            return;
        }
        if (!sameOrigin(element.href)) {
            return;
        }
        event.preventDefault();
        push({ pathname: decodeURI(element.pathname), search: decodeURI(element.search), hash: '' });
    };
}
function captureClicks(push) {
    var listener = makeClickListener(push);
    if (typeof window !== 'undefined') {
        document.addEventListener(CLICK_EVENT, listener, false);
    }
    return function () { return document.removeEventListener(CLICK_EVENT, listener); };
}
exports.captureClicks = captureClicks;
//# sourceMappingURL=captureClicks.js.map