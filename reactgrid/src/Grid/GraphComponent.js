/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, log } from './Base';
import { GraphClass, WaveType } from './Graph.js';
import { GridFL } from './Grid/GridFL';
import { Modal } from './Modal';
import AsyncSelect from 'react-select/async';
// ==================================================================================================================================================================
export function Graph(props) {
	let gc = null;

	const [graphState, setState] = useState({ graph: gc, ind: 0 });

	const oldGraph = graphState.graph;

	gc = oldGraph && oldGraph.uid === props.uid ? oldGraph : new GraphComponentClass(props);

	if (props.init) {
		props.init(gc);
	}

	if (!gc.refreshState) {
		gc.refreshState = function (clear) {
			//log('refreshState ' + graph.stateind);
			setState({ graph: gc, ind: gc.stateind++ });
		}
	}

	useEffect(() => {
		//gc.setupEvents();

		if (!gc.scheme) {
			gc.getScheme().then(
				() => {
					gc.refreshState();
				}
			);
		}

		return () => {
			//log(' 0.11 Clear GraphEvents');

			gc.removeEvents();
		}
	}, [gc])

	return (gc.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GraphComponentClass extends BaseComponent {
	constructor(props) {
		super(props);

		const gc = this;

		window._graphSeq = window._graphSeq || 0;
		window._graphDict = window._graphDict || {};

		gc.id = window._graphSeq++;
		gc.uid = props.uid || gc.id;
		gc.schemeName = props.schemeName;
		gc.dataGetter = props.dataGetter;

		if (props.scheme) {
			//gc.prepareGraph(props.sceme);
			gc.scheme = props.scheme;
		}

		gc.activeMaster = 0;
		gc.activeDetail = 0;

		gc.opt = {};
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	removeEvents() {
		const gc = this;

		if (window._graphDict && gc.uid) {
			gc.log(' delete graph')
			delete window._graphDict[gc.uid];
		}
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	render() {
		const gc = this;
		if (!gc.visible || !gc.scheme) {
			return <></>;
		}

		return (
			<div>
				<div>
					{
						gc.scheme.nodes.map((node, ind) => { return gc.renderFilter(node, true) })
					}
				</div>
				<div>
					{
						gc.scheme.nodes.map((node, ind) => { return gc.renderGridTab(node, true, ind) })
					}
				</div>
				<div>
					{
						gc.scheme.nodes.map((node, ind) => { return gc.renderGrid(node, true, ind) })
					}
				</div>
				<div>
					{
						gc.scheme.nodes.map((node, ind) => { return gc.renderFilter(node, false) })
					}
				</div>
				<div>
					{
						gc.scheme.nodes.map((node, ind) => { return gc.renderGridTab(node, false, ind) })
					}
				</div>
				<div>
					{
						gc.scheme.nodes.map((node, ind) => { return gc.renderGrid(node, false, ind) })
					}
				</div>
			</div>
		)
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	renderFilter(node, top) {
		if (node.status !== NodeStatus.filter || node.isTop !== top) return <></>;

		return (<></>);
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	renderGridTab(node, top, ind) {
		const gc = this;
		if (node.status !== NodeStatus.grid || node.isTop !== top) return <></>;

		const isActive = top && ind === gc.activeMaster || !top && ind === gc.activeDetail;
		return (
			<button
				disabled={isActive}
				onClick={(e) => gc.selectActiveTab(node, top, ind)}
			>
				{node.title}
			</button>
		);
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	renderGrid(node, top, ind) {
		const gc = this;
		const isActive = top && ind === gc.activeMaster || !top && ind === gc.activeDetail;

		if (node.status !== NodeStatus.grid || node.isTop !== top || !isActive) return <></>;

		return (
			<GridFL
				graphUid={gc.graph.uid}
				uid={node.uid}
				getRows={gc.getRows(node)}
				getColumns={gc.getColumns(node)}
				buttons={gc.getButtons(node)}
			>
			</GridFL>
		);
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	selectActiveTab(node, top, ind) {
		const gc = this;
		const isActive = top && ind === gc.activeMaster || !top && ind === gc.activeDetail;

		if (node.status !== NodeStatus.grid || node.isTop !== top || isActive) return;

		if (top) gc.activeMaster = ind; else gc.activeDetail = ind;

		gc.refreshState();
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	getScheme(e) {
		const gc = this;

		return new Promise(function (resolve, reject) {

			const params = [{ key: 'scheme', value: gc.schemeName }];

			gc.dataGetter.get({ url: 'system/graphScheme', params: params/*, type: 'text'*/ }).then(
				(schemeObj) => {
					//const obj = JSON.parse(schemeObj);
					gc.scheme = schemeObj;
					resolve(gc.scheme, e);
				}
			);
		});
	}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
	//prepareGraph(schemeObj) {
	//	const gc = this;

	//	gc.scheme = schemeObj;
	//}
	// -------------------------------------------------------------------------------------------------------------------------------------------------------------
}