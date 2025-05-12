import { useState, useEffect } from 'react';
import { GridFLClass } from './GridFL.js';
// ==================================================================================================================================================================
export function GridINU(props) {
	let grid = null;

	const [gridState, setState] = useState({ grid: grid, ind: 0 });

	grid = gridState.grid;
	let needGetRows = false;
	if (!grid) {
		grid = new GridINUClass(props);
		needGetRows = !props.noAutoRefresh && !props.parentGrids;
	}

	if (props.init) {
		props.init(grid);
	}

	if (!grid.refreshState) {
		grid.refreshState = function () {
			grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
			setState({ grid: grid, ind: grid.stateind++ });
		}
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

		//grid.getRows = this.getRows;
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	render() {
		//const grid = this;

		return (
			<>
				{super.render()}
			</>
		)
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	getDefaultLinkContent() {
		const grid = this;
		return {
			applyLink: function (parentGrid) {
				if (!parentGrid || !parentGrid.rows || parentGrid.visible === false) return '';

				if (parentGrid.getConnectContent) {
					return parentGrid.getConnectContent({ child: grid });
				}

				const keyField = parentGrid.getKeyColumn();
				if (!keyField) return '';

				const activeRow = parentGrid.rows[parentGrid.selectedRowIndex];

				return activeRow ? parentGrid.entity + (parentGrid.entityAdd || '') + ' = ' + activeRow[keyField] : '1=2';
			}
		};
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	getColumn(name) {
		return { name: name, sortable: true, filtrable: true };
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	getRows(e) {
		const grid = this;
		//e.filters;

		const params = [
			{ key: 'atoken', value: grid.dataGetter.atoken },
			{ key: 'pageSize', value: grid.pageSize },
			{ key: 'pageNumber', value: grid.pageNumber },
		];

		//let i = 0;
		let orderBy = '';
		for (let col of grid.columns) {
			orderBy += col.asc ? (orderBy ? ', ' : '') + col.name : '';
			orderBy += col.desc ? (orderBy ? ', ' : '') + col.name + ' desc' : '';

		//	if (col.filter !== undefined) {
		//		params.push({ key: 'f' + i++, value: col.name + ' = ' + col.filter });
		//	}
		}

		if (orderBy) {
			params.push({ key: 'orderBy', value: orderBy });
		}

		if (e.autocompleteColumn) {
			params.push({ key: 'autocompl', value: true });
			params.push({ key: 'columns', value: e.autocompleteColumn.name });
		}

		//for (let ind in grid.parentLinks) {
		//	let link = grid.parentLinks[ind];
		//	if (link.parent.visible === false || link.parent.selectedRowIndex < 0 || !link.parent.rows.length) continue;

		//	params.push({ key: 'f' + i++, value: link.parent.entity + '=' + link.content.applyLink(link.parent) });
		//}

		let i = 0;
		for (let cond of e.filters) {
			params.push({ key: 'f' + i++, value: cond });
		}


		//return grid.dataGetter.get({ url: grid.entity + '/list', params: params, type: 'text' });

		return new Promise(function (resolve, reject) {

			//const rows = new TestData().getFamily(e);
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