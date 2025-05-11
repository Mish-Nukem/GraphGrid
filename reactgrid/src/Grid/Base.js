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

export class NodeStatus {
    static grid = 0;
    static hidden = 1;
    static filter = 2;
    static lookup = 3;
    static custom = 4;
};