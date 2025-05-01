export class BaseComponent {

    constructor(props) {
        window._gridSeq = window._gridSeq || 0;
        window._wndSeq = window._wndSeq || 0;
        window._wndZInd = window._wndZInd || 999;

        window._logEnabled = true;
    }

    translate(text, context) {
        return text;
    }
}

export function log(message) {
    if (!window._logEnabled) return;

    console.log(message);
}
