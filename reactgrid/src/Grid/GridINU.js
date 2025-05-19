import { useState, useEffect } from 'react';
import { GridFLClass } from './GridFL.js';
import { NodeStatus } from './Base';
import { WaveType } from './Graph.js';
import { CardINU } from './CardINU';
import { Modal } from './Modal';
// ==================================================================================================================================================================
export function GridINU(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid) {
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridINUClass(props);
        needGetRows = !props.noAutoRefresh && !props.parentGrids;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.refreshState = function () {
        grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
        setState({ grid: grid, ind: grid.stateind++ });
    }

    useEffect(() => {
        grid.setupEvents();

        if (needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0)) {

            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            );
        }

        if (grid.columns.length <= 0 && grid.getColumns) {
            grid.getColumns();
        }

        return () => {
            grid.removeEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}

// ==================================================================================================================================================================
export class GridINUClass extends GridFLClass {

    constructor(props) {
        super(props);

        const grid = this;

        grid.entity = props.entity;
        grid.entityAdd = props.entityAdd;
        grid.dataGetter = props.dataGetter;

        grid.status = NodeStatus.grid;
        grid.visible = true;

        grid.isVisible = props.isVisible || grid.isVisible;

        grid.onSelectValue = props.onSelectValue || function () { };

        grid.addButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isVisible() {
        return this.visible;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const node = this;
        return (
            <>
                {super.render()}
                {
                    node.cardIsShowing ?
                        <Modal
                            renderContent={() => { return node.renderCard() }}
                            pos={node.cardPos}
                            onClose={(e) => node.closeCard(e)}
                            init={(wnd) => { wnd.visible = node.cardIsShowing; }}
                        >
                        </Modal>
                        :
                        <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addButtons() {
        const node = this;

        //if (node._buttonsAdded) return;

        //GridClass.applyTheme(node);

        //node._buttonsAdded = true;

        //node.buttons.push({
        //    id: node.buttons.length,
        //    name: 'edit',
        //    title: node.translate('Start edit'),
        //    label: node.images.edit ? '' : node.translate('Start edit'),
        //    click: (e) => node.startEdit(e),
        //    img: node.images.edit
        //});

        node.buttons.push({
            id: node.buttons.length,
            name: 'commit',
            title: node.translate('Commit changes'),
            label: node.images.commit ? '' : node.translate('Commit changes'),
            img: node.images.commit,
            click: (e) => node.commitChanges(e),
            getDisabled: (e) => node.commitChangesDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'rollback',
            title: node.translate('Rollback changes'),
            label: node.images.rollback ? '' : node.translate('Rollback changes'),
            img: node.images.rollback,
            click: (e) => node.rollbackChanges(e),
            getDisabled: (e) => node.rollbackChangesDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'add',
            title: node.translate('Add new record'),
            label: node.images.addRecord ? '' : node.translate('Add new record'),
            img: node.images.addRecord,
            click: (e) => node.addRecord(e),
            getDisabled: (e) => node.addRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'copy',
            title: node.translate('Copy record'),
            label: node.images.copyRecord ? '' : node.translate('Copy record'),
            img: node.images.copyRecord,
            click: (e) => node.copyRecord(e),
            getDisabled: (e) => node.copyRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'delete',
            title: node.translate('Delete record'),
            label: node.images.deleteRecord ? '' : node.translate('Delete record'),
            img: node.images.deleteRecord,
            click: (e) => node.deleteRecord(e),
            getDisabled: (e) => node.deleteRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'view',
            title: node.translate('View record'),
            label: node.images.viewRecord ? '' : node.translate('View record'),
            img: node.images.viewRecord,
            click: (e) => node.viewRecord(e),
            getDisabled: (e) => node.viewRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'selectValue',
            title: node.translate('Select'),
            label: node.images.selectFilterValue ? '' : node.translate('Select value'),
            click: (e) => node.onSelectValue(e),
            img: node.images.selectFilterValue,
            getVisible: () => { return node.isSelecting },
        });

        node._buttonsDict = {};
        for (let btn of node.buttons) {
            node._buttonsDict[btn.name] = btn;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isEditing() {
        const node = this;
        return node._isEditing === true;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChanges(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesDisabled(e) {
        const node = this;
        return !node.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChanges(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesDisabled(e) {
        const node = this;
        return !node.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecord(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecordDisabled(e) {
        const node = this;
        return node.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecord(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecordDisabled(e) {
        const node = this;
        return node.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecord(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecordDisabled(e) {
        const node = this;
        return node.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord(e) {
        const node = this;

        node.cardPos = node.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        node.cardNode = node;
        node.cardIsShowing = true;
        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecordDisabled(e) {
        const node = this;
        return node.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeCard(e) {
        const node = this;
        node.cardIsShowing = false;
        node.cardNode = null;
        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCard() {
        const node = this;
        return (
            <CardINU
                cardRow={node.cardNode.selectedRow()}

                uid={node.cardNode.uid || node.cardNode.id}
                entity={node.cardNode.entity}
                dataGetter={node.dataGetter || node.cardNode.dataGetter}
                init={(card) => {
                    card.visible = true;
                    card.columns = node.cardNode.columns;
                }}
            >
            </CardINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getDefaultLinkContent() {
        const grid = this;
        return {
            applyLink: function (parentNode) {
                if (!parentNode || parentNode.visible === false) return '';

                if (parentNode.status === NodeStatus.grid) {
                    if (!parentNode.rows || parentNode.rows.length <= 0) return '1=2'
                }

                if (parentNode.getConnectContent) {
                    return parentNode.getConnectContent({ child: grid });
                }

                const keyField = parentNode.getKeyColumn ? parentNode.getKeyColumn() : parentNode.keyField;
                if (!keyField) return '';

                const activeValue = parentNode.status === NodeStatus.grid ? parentNode.selectedValue() : parentNode.value;
                if (!activeValue) return '';

                return activeValue ? parentNode.entity + (parentNode.entityAdd || '') + ' = ' + activeValue : '1=2';
            }
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    skipOnWaveVisit(e) {
        if (super.skipOnWaveVisit(e)) return true;

        const grid = this;
        if (e.waveType === WaveType.refresh) {
            if (!grid.visible || grid.status === NodeStatus.hidden) return true;
            if (grid.status === NodeStatus.filter && !grid._selecting) return true;
        }
        else if (e.waveType === WaveType.value) {
            if (grid.visible === false || grid.status === NodeStatus.hidden) return true;
        }

        return false;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getColumn(name) {
        return { name: name, sortable: true, filtrable: true };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const grid = this;

        const params = [
            { key: 'atoken', value: grid.dataGetter.atoken },
            { key: 'rtoken', value: grid.dataGetter.rtoken },
            { key: 'pageSize', value: grid.pageSize },
            { key: 'pageNumber', value: grid.pageNumber },
        ];

        let orderBy = '';
        for (let col of grid.columns) {
            orderBy += col.asc ? (orderBy ? ', ' : '') + col.name : '';
            orderBy += col.desc ? (orderBy ? ', ' : '') + col.name + ' desc' : '';
        }

        if (orderBy) {
            params.push({ key: 'orderBy', value: orderBy });
        }

        if (e.autocompleteColumn) {
            params.push({ key: 'autocompl', value: true });
            params.push({ key: 'columns', value: e.autocompleteColumn.name });
        }

        let i = 0;
        for (let cond of e.filters) {
            params.push({ key: 'f' + i++, value: cond });
        }

        return new Promise(function (resolve, reject) {
            grid.dataGetter.get({ url: grid.entity + '/' + (!e.autocompleteColumn ? 'list' : 'autocomplete'), params: params }).then(
                (res) => {
                    if (res != null) {
                        if (!e.autocompleteColumn) {
                            grid.totalRows = res.count;
                        }
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