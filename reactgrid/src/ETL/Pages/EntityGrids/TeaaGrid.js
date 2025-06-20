import { GridINU, GridINUClass } from '../../../Grid/GridINU';
import { GridDB } from '../../../Grid/GridDB';
import { Graph } from '../../../Grid/GraphComponent';
import { DataExchangePage } from '../DataExchangePage';

// Настройка обмена
export class TeaaGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord(e) {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };
        grid.popupPos = grid.cardPos;

        grid.cardRow = grid.selectedRow();
        grid.cardIsShowing = true;
        grid.popupIsShowing = true;
        grid.lookupTitle = grid.title;
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
            <Graph
                uid={`${grid.graph.uid}_select_${grid.uid}_`}
                schemeName={'TuningCardScheme'}
                nodeBeforeOpenCondition={{ '2': `ID_TUNING_EXCH_TEAA in (${grid.selectedValue()})` }}
                dataGetter={grid.dataGetter}
                gridCreator={grid.graph.gridCreator}
            >
            </Graph >
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
            label: 'Обмен данными',
            click: (e) => node.runDataExchange(e)
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return grid.reportIsShowing ? grid.renderReportContent() : super.renderPopupContent();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderReportContent() {
        const grid = this;
        return (
            <GridDB
                pageSize={0}
                filtersDisabled={true}
                sortDisabled={true}
                getRows={() => {
                    return new Promise(function (resolve, reject) {
                        if (grid.reportRows != null) {
                            resolve(grid.reportRows);
                        } else {
                            reject(Error("Error getting rows"));
                        }
                    })
                }}
            >
            </GridDB>
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
                init={(de) => { de.visible = grid._dataExchangePageVisible; }}
                onClose={() => { grid._dataExchangePageVisible = false; }}
            ></DataExchangePage>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showReport() {
        const grid = this;
        const row = grid.selectedRow();
        if (!row) return;

        const params = [
            { key: 'ID_teaa', value: row['ID_TUNING_EXCH_TEAA'] },
        ];

        grid.dataGetter.get({ url: 'TinuTuningExchTeaaEntity/test1', params: params }).then(
            (data) => {
                if (data && data.length) {
                    grid.showExportResult(data);
                }
            }
        );


        //alert('TeaaGridClass Showing report!');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showExportResult(data) {
        const grid = this;
        grid.popupIsShowing = true;
        grid.reportIsShowing = true;

        grid.reportPos = grid.reportPos || { x: 110, y: 110, w: 800, h: 600 };
        grid.popupPos = grid.reportPos;
        grid.lookupTitle = 'Протокол экспорта';

        grid.reportRows = data;

        grid.onClosePopup = () => {
            grid.reportIsShowing = false;
            grid.reportRows = [];
        };

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}