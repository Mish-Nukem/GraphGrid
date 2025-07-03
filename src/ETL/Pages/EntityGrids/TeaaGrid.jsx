import { NodeStatus } from '../../../Grid/Base';
import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
//import { GridDB } from '../../../Grid/GridDB';
import { GraphClass } from '../../../Grid/Graph';
import { GraphComponent } from '../../../Grid/GraphComponent';
import { DataExchangePage } from '../DataExchangePage';

// Настройка обмена
export class TeaaGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord() {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };
        grid.popupPos = grid.cardPos;

        grid.cardRow = grid.selectedRow();
        grid.cardIsShowing = true;
        grid.popupIsShowing = true;
        grid.popupTitle = grid.title;
        grid.onClosePopup = grid.closeCard;

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;
        return (
            <>
                {super.render()}
                {grid.renderDataExchangePage()}
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCardContent() {
        const grid = this;
        return (
            <GraphComponent
                uid={`${grid.graph.uid}_select_${grid.uid}_`}
                schemeName={'TuningCardScheme'}
                nodeBeforeOpenCondition={{ '2': `ID_TUNING_EXCH_TEAA in (${grid.selectedValue()})` }}
            >
            </GraphComponent >
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const node = this;

        super.addToolbarButtons();

        let btn = {
            id: node.buttons.length,
            name: 'report',
            title: 'Вызов обмена данными для текущей настройки',
            //label: 'Обмен данными',
            click: (e) => node.runDataExchange(e),
            img: Images.images.rightLeft,
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return grid.protocolIsShowing ? grid.renderExportProtocolContent() : super.renderPopupContent();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderExportProtocolContent() {
        const grid = this;
        return (
            <GraphComponent
                uid={`${grid.graph.uid}_exportProtocol_${grid.uid}_`}
                graph={grid.exportProtocolGraph}
            >
            </GraphComponent>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    runDataExchange() {
        const grid = this;
        grid._dataExchangePageVisible = true;
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderDataExchangePage() {
        const grid = this;
        const row = grid.selectedRow();

        if (!grid._dataExchangePageVisible || !row) return <></>;

        grid.exchPos = grid.exchPos || { x: 210, y: 210 };

        return (
            <DataExchangePage
                pos={grid.exchPos}
                edId={row['ID_TUNING_EXCH_TEAA']}
                edType={row['ID_TUNING_EXCH_TYPE_TEAA']}
                nameExchange={row['ID_TUNING_DATASF_TEAA_NAME']}
                visible={grid._dataExchangePageVisible}
                init={(de) => {
                    de.visible = grid._dataExchangePageVisible;
                    de.showProtocol = (rows) => { grid.showExportProtocol(rows); };
                }}
                onClose={() => { grid._dataExchangePageVisible = false; }}
            ></DataExchangePage>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //showReport() {
    //    const grid = this;
    //    const row = grid.selectedRow();
    //    if (!row) return;

    //    const params = [
    //        { key: 'ID_teaa', value: row['ID_TUNING_EXCH_TEAA'] },
    //    ];

    //    grid.dataGetter.get({ url: 'TinuTuningExchTeaaEntity/test1', params: params }).then(
    //        (data) => {
    //            if (data && data.length) {
    //                grid.showExportProtocol(data);
    //            }
    //        }
    //    );


    //alert('TeaaGridClass Showing report!');
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showExportProtocol(data) {
        const grid = this;
        grid.popupIsShowing = true;
        grid.protocolIsShowing = true;
        grid._dataExchangePageVisible = false;

        grid.reportPos = grid.reportPos || { x: 110, y: 110, w: 800, h: 600 };
        grid.popupPos = grid.reportPos;
        grid.popupTitle = 'Протокол экспорта';

        grid.exportProtocolGraph = new GraphClass();

        //graph.noCachWave = true;
        grid.exportProtocolGraph.uid = 'ExportProtocolGraph';

        let i = 0;
        for (let item of data.innerList) {

            let node = {
                id: i, uid: i, title: item.entityNameRu, status: NodeStatus.grid, columns: [], pageSize: 0,
                getRows: () => { return new Promise(function (resolve) { resolve(item.rows); }) }, parents: [], children: [],
            };

            for (let name in item.headersColumns) {
                node.columns.push({ name: name, title: item.headersColumns[name], filtrable: false, sortable: false });
            }

            grid.exportProtocolGraph.nodesDict[node.id] = node;
            i++;
        }

        grid.onClosePopup = () => {
            grid.protocolIsShowing = false;
            grid.reportRows = [];
        };

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}