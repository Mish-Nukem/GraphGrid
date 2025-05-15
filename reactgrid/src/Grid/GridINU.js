import { useState, useEffect } from 'react';
import { GridFLClass } from './GridFL.js';
import { NodeStatus } from './Base';
import { WaveType } from './Graph.js';

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

	//if (!grid.refreshState) {
		grid.refreshState = function () {
			grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
			setState({ grid: grid, ind: grid.stateind++ });
		}
	//}

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
		//grid.getRows = this.getRows;
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