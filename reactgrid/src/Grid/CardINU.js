import { GridINU, GridINUClass } from './GridINU';
import { useState, useEffect } from 'react';
// =================================================================================================================================================================
export function CardINU(props) {
    let card = null;

    const [gridState, setState] = useState({ grid: card, ind: 0 });

    card = gridState.grid;
    let needGetRows = false;
    if (!card) {
        if (props.findGrid) {
            card = props.findGrid(props);
        }
        card = card || new CardINUClass(props);
        needGetRows = !card.cardRow;
    }

    if (props.init) {
        props.init(card);
    }

    card.refreshState = function () {
        card.log(' -------------- refreshState ' + card.stateind + ' --------------- ');
        setState({ grid: card, ind: card.stateind++ });
    }

    useEffect(() => {
        card.setupEvents();

        if (needGetRows && card.selectedRow() === undefined) {

            card.getRows({ filters: card.collectFilters(), card: card }).then(
                rows => {
                    card.rows = rows;
                    card.afterGetRows();
                    card.refreshState();
                }
            );
        }

        if (card.columns.length <= 0 && card.getColumns) {
            card.getColumns();
        }

        return () => {
            card.removeEvents();
        }
    }, [card, needGetRows])

    return (card.render());
}
// =================================================================================================================================================================
export class CardINUClass extends GridINUClass {

    constructor(props) {
        super(props);

        const card = this;

        card.cardRow = props.cardRow;

        card.visible = true;

        card.isVisible = props.isVisible || card.isVisible;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isVisible() {
        return this.visible;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        return (
            <>
                {super.render()}
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const grid = this;

        const params = [
            { key: 'atoken', value: grid.dataGetter.atoken },
            { key: 'pageSize', value: 1 },
            { key: 'pageNumber', value: 1 },
        ];

        let i = 0;
        for (let cond of e.filters) {
            params.push({ key: 'f' + i++, value: cond });
        }

        return new Promise(function (resolve, reject) {
            grid.dataGetter.get({ url: grid.entity + '/list', params: params }).then(
                (res) => {
                    if (res != null) {
                        grid.totalRows = res.count;
                        resolve(res.rows);
                    } else {
                        reject(Error("Error getting rows"));
                    }
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}