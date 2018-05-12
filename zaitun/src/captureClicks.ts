
import { Location } from './models';

const CLICK_EVENT =
    typeof document !== 'undefined' && document.ontouchstart
        ? 'touchstart'
        : 'click';

function which(ev: any) {
    if (typeof window === 'undefined') {
        return false;
    }
    const e = ev || window.event;
    return e.which === null ? e.button : e.which;
}

function sameOrigin(href: string) {
    if (typeof window === 'undefined') {
        return false;
    }

    return href && href.indexOf(window.location.origin) === 0;
}

function makeClickListener(push: (p: Location) => void) {
    return function clickListener(event: MouseEvent) {
        if (which(event) !== 1) {
            return;
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey) {
            return;
        }

        if (event.defaultPrevented) {
            return;
        }

        let element: any = event.target;
        while (element && element.nodeName !== 'A') {
            element = element.parentNode;
        }

        if (!element || element.nodeName !== 'A') {
            return;
        }

        if (
            element.hasAttribute('download') ||
            element.getAttribute('rel') === 'external'
        ) {
            return;
        }

        if (element.target) {
            return;
        }

        const link = element.getAttribute('href');

        if ((link && link.indexOf('mailto:') > -1) || link.charAt(0) === '#') {
            return;
        }

        if (!sameOrigin(element.href)) {
            return;
        }

        event.preventDefault();
        
        push({ pathname:decodeURI(element.pathname), search:decodeURI(element.search), hash:'' });        
       
    };
}

export function captureClicks(push: (p: Location) => void): Function {
    const listener = makeClickListener(push);
    if (typeof window !== 'undefined') {
        document.addEventListener(CLICK_EVENT, listener, false);
    }
    return () => document.removeEventListener(CLICK_EVENT, listener);

}
