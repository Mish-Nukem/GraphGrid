import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
import { FieldEdit } from '../../../Grid/FieldEdit';
import { Dropdown } from '../../../Grid/Dropdown';
import { ReportParamsPage } from '../../../Reports/Pages/ReportParamsPage';
export class POAAGridClass extends GridINUClass {

    render() {
        const grid = this;
        return (
            <>
                {super.render()}
                <Dropdown init={(dd) => { grid.reportsDropdown = dd; }} getItems={(e) => { return grid.getReportsList(e); }} onItemClick={(e) => { grid.showReport(e.itemId); }}></Dropdown>
                {
                    grid.isShowingTNReport ?
                        <ReportParamsPage
                            nameReport={grid.TNReportName}
                            pos={grid.TNReportPos}
                            visible={grid.isShowingTNReport}
                            onClose={() => {
                                grid.isShowingTNReport = false;
                                grid.TNReportName = '';
                                grid.refreshState();
                            }}
                            outerParamValues={[{ entity: 'TinuPointObservPoaaEntity', value: grid.selectedValue(), text: grid.selectedText() }]}
                        >
                        </ReportParamsPage>
                        : <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const grid = this;

        super.addToolbarButtons();

        let btn = {
            id: grid.buttons.length,
            name: 'reports',
            title: 'Отчеты',
            click: (e) => grid.showTNReporstList(e),
            img: Images.images.report,
        };

        grid.buttons.push(btn);
        grid._buttonsDict[btn.name] = btn;

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showTNReporstList(e) {
        const grid = this;

        if (!grid.reportsDropdown) return;

        const elem = document.getElementById(e.target.id);
        grid.reportsDropdown.opt.parentRect = elem ? elem.getBoundingClientRect() : e.target.getBoundingClientRect();

        grid.reportsDropdown.popup(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showReport(id) {
        const grid = this;

        const menuItem = grid.reportsDropdown.items.find((item) => {
            return item.id === id;
        });

        grid.TNReportPos = grid.TNReportPos || { x: 100, y: 100 };
        grid.isShowingTNReport = true;
        grid.TNReportName = menuItem.text;
        grid.refreshState();
        //alert('Sowing report: ' + id);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getReportsList() {
        const grid = this;
        return new Promise(function (resolve/*, reject*/) {
            if (grid.reportsList) {
                resolve(grid.reportsList);
                return;
            }

            GLObject.dataGetter.get({ url: 'TinuPointObservPoaaEntity/getReportsList', params: [] }).then(
                (result) => {
                    if (result) {
                        grid.reportsList = result;
                        resolve(grid.reportsList);

                        grid.refreshState();
                    }
                }
            );
        });

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}