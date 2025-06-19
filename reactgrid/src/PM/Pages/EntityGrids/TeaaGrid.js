import { GridINU, GridINUClass } from '../../../Grid/GridINU';
import { GridDB } from '../../../Grid/GridDB.js';
// Настройка обмена
export class TeaaGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const node = this;

        super.addToolbarButtons();

        let btn = {
            id: node.buttons.length,
            name: 'report',
            title: 'Протокол экспорта', //node.translate('Протокол экспорта'),
            label: 'Протокол экспорта', //node.translate('Протокол экспорта'),
            click: (e) => node.showReport(e)
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
        //keyField = { ''}
        //nameField = { ''}
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