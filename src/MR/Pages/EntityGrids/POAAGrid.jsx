import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
import { FieldEdit } from '../../../Grid/FieldEdit';
import { Dropdown } from '../../../Grid/Dropdown';
import { MainMenu } from '../../../Grid/Pages/MainMenu';
import { ReportParamsPage } from '../../../Reports/Pages/ReportParamsPage';
import { BaseComponent } from '../../../Grid/Base';
export class POAAGridClass extends GridINUClass {

    render() { ////<MainMenu init={(dd) => { grid.reportsDropdown = dd; }} getItems={(e) => { return grid.getReportsList(e); }} onItemClick={(e) => { grid.showReport(e.itemId); }}></MainMenu>
        const grid = this;
        return (
            <>
                {super.render()}
                
                {
                    grid.isShowingTNReport ?
                        <ReportParamsPage
                            nameReport={grid.TNReportName}
                            title={grid.TNReportTitle}
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
            render: () => {
                return (
                    <MainMenu
                        key={`tb_${btn.id}_`}
                        allowCollapse={false}
                        mainMenuItemClass={grid.opt.toolbarButtonsClass || BaseComponent.theme.toolbarButtonsClass}
                        divClassName={''}
                        init={(dd) => {
                            if (grid.reportsDropdownInitialized) return;

                            grid.reportsDropdownInitialized = true;
                            grid.reportsDropdown = dd;
                            dd.getMainMenuItems = grid.getReportsList;
                        }}
                        onMenuItemClick={(e, item) =>
                        {
                            grid.showReport(e, item);
                        }}
                    >
                    </MainMenu>
                );
                //grid.reportsDropdown.render();
            }
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
    showReport(e, item) {
        const grid = this;

        if (item.items) return;

        grid.TNReportPos = grid.TNReportPos || { x: 100, y: 100 };
        grid.isShowingTNReport = true;
        grid.TNReportName = item.action;
        grid.TNReportTitle = item.text;
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
                        grid.reportsList[0].img = Images.images.report;
                        //grid.reportsList.push({ id: '-1', text: 'Отчеты', img: Images.images.report, items: result });
                        resolve(grid.reportsList);

                        grid.refreshState();
                    }
                }
            );
        });

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}