import Grid from '../Grid.js';

export function TestGrid() {

    let grid = new Grid({
        getData: function (after) {
            this.rows = [
                { Id: 1, Name: 'Mikle', Date: '26/01/1979', Comment: 'Good boy'},
                { Id: 2, Name: 'Nataly', Date: '15/01/1999', Comment: 'Good girl' },
                { Id: 3, Name: 'Mother', Date: '04/07/1953', Comment: 'Mommy' },
                { Id: 4, Name: 'Father', Date: '14/06/1953', Comment: 'Papa' },
                { Id: 5, Name: 'Grandmother', Date: '17/06/1917', Comment: 'Babushka' },
            ];
            after();
        }
    });
    grid.draw();
}
