import { DefaultGridTheme as Theme } from './Themes/DefaultGridTheme';
//import { BootstrapTheme as NewTheme } from './Themes/BootstrapGridTheme';
import { DefaultGridTheme as NewTheme } from './Themes/DefaultGridTheme';
import { Translate } from './Themes/Translate';
export class BaseComponent {

    constructor(props) {
        window._gridSeq = window._gridSeq || 0;
        window._wndSeq = window._wndSeq || 0;
        window._wndZInd = window._wndZInd || 999;

        //window._logEnabled = true;
    }

    translate(text, context) {
        return Translate.translate(text, context);
    }

    static ThemeObj = {
        prepared: false,
        Prepare() {
            if (this.prepared) return;

            this.theme = new Theme();
            this.prepared = true;
            this.images = {};
            this.theme.prepareImages(this.images);

            if (NewTheme !== undefined) {
                this.newtheme = new NewTheme();
            }

        },
        Apply(grid) {
            if (!grid || grid.themeApplied) return;

            grid.themeApplied = true;
            this.Prepare();

            //grid.translate = this.theme.translate;
            this.theme.setupGridPagerButtons(grid, this.images);

            grid.images = this.images;

            if (this.newtheme) {
                this.newtheme.applyTheme(grid, this.images);
            }
        }
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

export class FilterType {
    static combobox = 0;
    static date = 1;
    static input = 2;
    static custom = 3;
};