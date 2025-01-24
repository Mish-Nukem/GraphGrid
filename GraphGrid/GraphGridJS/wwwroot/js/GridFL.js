import Grid from './GridDB.js';
import Dropdown from './Dropdown.js';

export default class GridFL extends Grid {

    drawHeaderCell(col) {
        const grid = this;

        let res = super.drawHeaderCell(col);
        if (col.filtrable) {
            res += `<div class="grid-header-filter">
                <input value="${col.filter !== undefined ? col.filter : ''}" grid-col-filter="${grid.id}_${col.id}_" class="grid-col-filter ${grid.opt.filterInputClass || ''}">
            </div>`;
        }

        return res;
    }

}