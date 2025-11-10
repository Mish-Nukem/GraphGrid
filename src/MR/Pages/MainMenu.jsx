import { useState, useEffect } from 'react';
import { MainMenuClass } from '../../Grid/Pages/MainMenu';
import { GLObject } from '../../Grid/GLObject';
import Versions from '../../Grid/Versions';
import { Images } from '../../Grid/Themes/Images';
export function MRMainMenu(props) {
    let menu = null;

    const [menuState, setState] = useState({ menu: menu, ind: 0 });

    menu = menuState.menu || new MRMainMenuClass(props);

    if (props.init) {
        props.init(menu);
    }

    menu.refreshState = function () {
        setState({ menu: menu, ind: menu.stateind++ });
    }

    useEffect(() => {
        menu.setupEvents(menu);

        if (!menu.menuItems || menu.menuItems.length <= 0) {

            menu.getMainMenuItems().then(
                menuItems => {
                    menu.menuItems = menuItems;
                    menu.prepareMenu();
                    menu.refreshState();
                }
            );
        }

        return () => {
            menu.clearEvents();
        }
    }, [menu])

    return (menu.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class MRMainMenuClass extends MainMenuClass {
    constructor(props) {
        super(props);

        const menu = this;
        menu.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareMenu() {
        const menu = this;
        super.prepareMenu();

        for (let item of menu.menuItems) {
            menu.setItemImage(item);
        }

        menu.setRootLevelItemsWidth();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        return super.render();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getMainMenuItems() {
        return new Promise((resolve) => {
            const params = [
                //{ key: 'filter', value: filter },
            ];

            GLObject.dataGetter.get({ url: 'system/getMainMenuItems', params: params }).then(
                (result) => {
                    result.unshift({ id: -1, action: 'logout', text: GLObject.serverType !== 0 ? "Выход (ORACLE)" : "Выход (PostgreSQL)" });
                    result.unshift({ id: -2, action: 'about', text: Versions.LastVersion });

                    resolve(result);
                });
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setItemImage(item) {
        const menu = this;
        if (!item || !item.action && item.level == 1 || item.img) return;

        let chAction, chItm;

        switch (item.action) {
            case 'logout':
                item.img = menu.renderImage('exit');
                break;
            case 0:
                break;
            case 'about':
                item.img = menu.renderImage(''); 
                break;
            case 'call':
                item.img = menu.renderImage(''); 
                break;
            case 'acQueryBuilder':
                item.img = menu.renderImage('');
                break;
            case 'acFuncInterpreter':
                item.img = menu.renderImage('');
                break;
            case 'SelectColors_Main':
                item.img = menu.renderImage('Управление_системой_Настройки_интерфейса');
                break;
            case 'acChangePassword':
                item.img = menu.renderImage('Управление_системой__Смена_пароля');
                break;
                
            //case 'acAddPropertys':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acCreateTableModule':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acRecalcGeographicCoord':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acSetStatesPOAA_VS':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acSetStatePOAA':
            //    item.img = menu.renderImage(''); 
            //    break;
            case 'acAnalysisDB':
                item.img = menu.renderImage(''); 
                break;
            //case 'acSearchErrorInMineralCard':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'ac_DELETE_HANGING_ROWS':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'ac_FIND_DOUBLE_LAB':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acCheckAssayNumThr':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acClearUOXY':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acRepRef':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acCheckSEQ':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acWebOnWinForm':
            //    item.img = menu.renderImage(''); 
            //    break;
            case 'VS_TN_NoModal':
                item.img = menu.renderImage(''); 
                break;
            case 'VS_Object_Works_NoModal':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_ListTNExecWorks':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_ListRequests':
                item.img = menu.renderImage(''); 
                break;
            //case 'acDescrForImpGetter':
            //    break;
            case 'Call_BRCD':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_log_scheme':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_USOB':
                item.img = menu.renderImage(''); 
                break;
            case 'acImportGroupUsers':
                item.img = menu.renderImage('');
                break;
            case 'acExportGroupUsers':
                item.img = menu.renderImage('');
                break;
            case 'acImportUserLightPS':
                item.img = menu.renderImage('');
                break;
            case 'acExportUserLightPS':
                item.img = menu.renderImage('');
                break;
            case 'acLightImport':
                item.img = menu.renderImage('');
                break;
            case 'acExportRefLight':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_protocol_export':
                item.img = menu.renderImage(''); 
                break;
            //case 'acPackageImportLas':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acLisImportPetrography':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acLisImportMicroprobe':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acLisImportGeochemistry':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'acLisImportMineralogy':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'ac_import_grid':
            //    item.img = menu.renderImage('');
            //    break;
            //case 'ac_AutoImport':
            //    item.img = menu.renderImage('');
            //    break;
            case 'ac_export_spravochniki':
                item.img = menu.renderImage('');
                break;
            case 'ac_ExportFromPSShort':
                item.img = menu.renderImage('');
                break;
            case 'ac_ExportFromPSFull':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_export_grid':
                item.img = menu.renderImage(''); 
                break;
            case 'acChangeData':
                item.img = menu.renderImage(''); 
                break;
            case 'ac_MMPM':
                item.img = menu.renderImage(''); 
                break;
            case 'acLayerProject':
                item.img = menu.renderImage(''); 
                break;
            case 'acSearchByBarcodeSM':
                item.img = menu.renderImage('Гидрогеология_Опробование_Штрихкодирование_Найти_по_штрихкоду'); 
                break;
            case 'acListIMK':
                item.img = menu.renderImage('Кернохранилище_ИМК');
                break;
            case 'acSmStorageSample':
                item.img = menu.renderImage('Кернохранилище_Образцы'); 
                break;
            case 'acSmStorageCore':
                item.img = menu.renderImage('Кернохранилище_Керн'); 
                break;
            case 'acDocumentSys':
                item.img = menu.renderImage('Документы_Документы'); 
                break;
            case 'acMovementsList':
                item.img = menu.renderImage('Управление_работами_Учет_приборов_Перемещения'); 
                break;
            case 'acRepairsList':
                item.img = menu.renderImage('Управление_работами_Учет_приборов_Ремонты'); 
                break;
            case 'acMustersList':
                item.img = menu.renderImage('Управление_работами_Учет_приборов_Поверки'); 
                break;
            case 'acGearsList':
                item.img = menu.renderImage('Управление_работами_Учет_приборов_Приборы'); 
                break;
            case 'Ac_ListRestTampPort':
                item.img = menu.renderImage('Управление_работами_Заявки_Восстановление_и_ликвидация_скважин'); 
                break;
            case 'ac_ListRequestsVn':
                item.img = menu.renderImage('Управление_работами_Заявки_Выноска'); 
                break;
            case 'ac_ListRequestsPr':
                item.img = menu.renderImage('Управление_работами_Заявки_Привязка'); 
                break;
            case 'acListRequestsGis':
                item.img = menu.renderImage('Управление_работами_Заявки_ГИС'); 
                break;
            case 'acCallWorkfactPOFM':
                item.img = menu.renderImage('Управление_работами_Выполнение_работ'); 
                break;
            case 'acRWCP_coord':
                item.img = menu.renderImage(''); 
                break;
            case 'acCoordinate_Epic':
                item.img = menu.renderImage('Координаты_объектов_Точечные_Эпицентры'); 
                break;
            case 'acPOAA_coord':
                item.img = menu.renderImage('Координаты_объектов_Точечные_Точки_наблюдений'); 
                break;
            case 'acRWRP_coord':
                item.img = menu.renderImage(''); 
                break;
            case 'acLNCM_coord':
                item.img = menu.renderImage('Координаты_объектов_Линейные'); 
                break;
            case 'acANAA_coord':
                item.img = menu.renderImage('Координаты_объектов_Площадные_Аномалии'); 
                break;
            case 'acGDGD_coord':
                item.img = menu.renderImage('Координаты_объектов_Площадные_Месторождения'); 
                break;
            case 'acLCSE_coord':
                item.img = menu.renderImage('Координаты_объектов_Площадные_Лицензии'); 
                break;
            case 'acGRNA_coord':
                item.img = menu.renderImage('Координаты_объектов_Площадные_Участки'); 
                break;
            case 'acOBWA_coord':
                item.img = menu.renderImage('Координаты_объектов_Площадные_Объекты_работ'); 
                break;
            case 'acWorkAct':
                item.img = menu.renderImage('Документы_Лабораторные_акты'); 
                break;
            case 'VS_DispatcherPetrophysics':
                item.img = menu.renderImage('Лаборатории_Петрофизика'); 
                break;
            case 'VS_DispatcherPetrograph':
                item.img = menu.renderImage('Лаборатории_Петрография'); 
                break;
            case 'acListGas':
                item.img = menu.renderImage(''); 
                break;
            case 'acListGas_Delphi':
                item.img = menu.renderImage('Лаборатории_Микрозонд_Шашки'); 
                break;
            case 'VS_ListAssayMzn_Asrl':
                item.img = menu.renderImage('Лаборатории_Микрозонд_Пробы'); 
                break;
            case 'VS_DispatcherGeochemist':
                item.img = menu.renderImage('Лаборатории_Геохимия_Пробы'); 
                break;
            case 'acMineralogistProcessing':
                item.img = menu.renderImage('Лаборатории_Минералогия_Обработка_минералогом_по_штрихкоду'); 
                break;
            case 'acMinLabAssistantProcessing':
                item.img = menu.renderImage('Лаборатории_Минералогия_Обработка_лаборантом_по_штрихкоду'); 
                break;
            case 'acSearchByBarcodeMnlAssay':
            case 'acSearchByBarcodeAssayCat':
            case 'acSearchByBarcodeGhlAssay':
                item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Штрихкодирование_Найти_по_штрихкоду'); 
                break;
            case 'VS_DispatcherMineralogy':
                item.img = menu.renderImage('Лаборатории_Минералогия_Пробы'); 
                break;
            case 'VS_List_Journal_Prob':
                item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Журналы_проб'); 
                break;
            case 'acMoveAssay':
                item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Штрихкодирование_Перемещение_проб'); 
                break;
            case 'acSendAcceptCatalog':
                item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Штрихкодирование_Отправка_прием_проб_сканирование'); 
                break;
            case 'ac_List_Catalog_Prob':
                item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Каталоги_проб'); 
                break;
            case 'ac_List_Prob':
                item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Список_проб');
                break;
            case 'RWGI_CALC_CUBE':
                item.img = menu.renderImage('Геофизика_РВГИ_Расчеты_3D_куба'); 
                break;
            case 'RWGI_CALC_RAY':
                item.img = menu.renderImage('Геофизика_РВГИ_Расчеты_2D_лучей_просвечивания'); 
                break;
            case 'acRwgiMetering':
                item.img = menu.renderImage('Геофизика_РВГИ_Измерения'); 
                break;
            case 'acRwgiGround':
                item.img = menu.renderImage('Геофизика_РВГИ_Участок'); 
                break;
            case 'PoGwsTlviewer':
                item.img = menu.renderImage('Геофизика_ГИС_Телевьювер'); 
                break;
            case 'AcListPoGwsCollector':
                item.img = menu.renderImage('Геофизика_ГИС_Коллекторы'); 
                break;
            case 'VS_Epicentre':
                item.img = menu.renderImage('Геофизика_Эпицентры'); 
                break;
            case 'ANAA_Call_VS':
                item.img = menu.renderImage('Геофизика_Аномалии'); 
                break;
            case 'acListGis':
                item.img = menu.renderImage('Геофизика_ГИС_Список_ГИС'); 
                break;
            case 'acPoExperFiltWork':
                item.img = menu.renderImage('Гидрогеология_ОФР'); 
                break;
            case 'MONITOR_INVESTIG':
                item.img = menu.renderImage('Гидрогеология_Режимные_наблюдения'); 
                break;
            case 'AQ_MONITORING_GRID':
                item.img = menu.renderImage('Гидрогеология_ВК_и_Режимные_сети'); 
                break;
            case 'VS_JournalDocum':
                item.img = menu.renderImage(''); 
                break;
            case 'VS_TN':
                item.img = menu.renderImage('Поиски_и_Разведка_Точки_наблюдений');
                break;
            case 'VS_GdLevel':
                item.img = menu.renderImage('Обеспечение_работ_Месторождения_Горизонты');
                break;
            case 'VS_GdGeolBlock':
                item.img = menu.renderImage('Обеспечение_работ_Месторождения_Блоки');
                break;
            case 'VS_GdOreBody':
                item.img = menu.renderImage('Обеспечение_работ_Месторождения_Рудные_тела');
                break;
            case 'VS_GdGeolDeposit':
                item.img = menu.renderImage('Обеспечение_работ_Месторождения_Месторождения');
                break;
            case 'VS_ListLine':
                item.img = menu.renderImage('Обеспечение_работ_Линии_маршруты_наблюдений');
                break;
            case 'VS_Object_Grna':
                item.img = menu.renderImage('Обеспечение_работ_Участки');
                break;
            case 'VS_Object_Works':
                item.img = menu.renderImage('Обеспечение_работ_Объекты_работ');
                break;
            case 'VS_License_Call':
                item.img = menu.renderImage('Обеспечение_работ_Лицензии');
                break;
            case 'acObwaCoords':
                item.img = menu.renderImage(''); 
                break;
            case 'acReports':
                item.img = menu.renderImage(''); 
                break;
            case 'acDataExchangeTuning':
                break;
            case null: case '': case undefined:
                if (!item.items || item.items.length <= 0) return;

                switch (item.text.toLowerCase()) {
                    case 'отчеты':
                        item.img = menu.renderImage('Карты_отчеты_Отчеты');
                        return;
                    case 'справочники':
                        item.img = menu.renderImage('Управление_системой_Справочники');
                        return;
                }

                //chAction = item.items[0].action;
                for (let ind in item.items) {
                    chItm = item.items[ind];
                    if (!chItm.items || chItm.items.length <= 0) {
                        chAction = chItm.action;
                        break;
                    }
                }

                switch (chAction) {
                    case 'VS_GdGeolDeposit':
                    case 'VS_GdOreBody':
                    case 'VS_GdGeolBlock':
                    case 'VS_GdLevel':
                        item.img = menu.renderImage('Обеспечение_работ_Месторождения');
                        break;
                    case 'ac_List_Prob':
                    case 'ac_List_Catalog_Prob':
                    case 'VS_List_Journal_Prob':
                        item.img = menu.renderImage('Поиски_и_Разведка_Опробование');
                        break;
                    case 'acSendAcceptCatalog':
                    case 'acSearchByBarcodeMnlAssay':
                    case 'acMoveAssay':
                    case 'acMinLabAssistantProcessing':
                    case 'acMineralogistProcessing':
                        item.img = menu.renderImage('Поиски_и_Разведка_Опробование_Штрихкодирование');
                        break;
                    case 'acListGis':
                        item.img = menu.renderImage('Геофизика_ГИС');
                        break;
                    case 'acRwgiGround':
                        item.img = menu.renderImage('Геофизика_РВГИ');
                        break;
                    case 'acRWCP_coord':
                    case 'acRWRP_coord':
                        item.img = menu.renderImage('Геофизика_РВГИ_Координаты');
                        break;
                    case 'VS_DispatcherMineralogy':
                        item.img = menu.renderImage('Лаборатории_Минералогия');
                        break;
                    case 'VS_DispatcherGeochemist':
                        item.img = menu.renderImage('Лаборатории_Геохимия');
                        break;
                    case 'VS_ListAssayMzn_Asrl':
                    case 'acListGas_Delphi':
                        item.img = menu.renderImage('Лаборатории_Микрозонд');
                        break;
                    case 'acOBWA_coord':
                    case 'acGRNA_coord':
                    case 'acLCSE_coord':
                    case 'acGDGD_coord':
                    case 'acANAA_coord':
                        item.img = menu.renderImage('Координаты_объектов_Площадные');
                        break;
                    case 'acCoordinate_Epic':
                    case 'acPOAA_coord':
                        item.img = menu.renderImage('Координаты_объектов_Точечные');
                        break;
                    case 'Ac_ListRestTampPort':
                    case 'ac_ListRequestsVn':
                    case 'ac_ListRequestsPr':
                    case 'acListRequestsGis':
                        item.img = menu.renderImage('Управление_работами_Заявки');
                        break;
                    case 'acGearsList':
                    case 'acMovementsList':
                    case 'acRepairsList':
                    case 'acMustersList':
                        item.img = menu.renderImage('Управление_работами_Учет_приборов');
                        break;
                    case 'acLayerProject':
                    case 'ac_MMPM':
                        item.img = menu.renderImage('Карты_отчеты_Разрезы_и_карты');
                        break;
                    case 'acQueryBuilder':
                        item.img = menu.renderImage('Карты_отчеты_Запросы_к_базе_данных');
                        break;
                    case 'acFuncInterpreter':
                        item.img = menu.renderImage('Карты_отчеты_Отчеты');
                        break;
                    case 'acChangeData':
                    case 'ac_export_grid':
                    case 'ac_ExportFromPSFull':
                    case 'ac_ExportFromPSShort':
                    case 'ac_export_spravochniki':
                    case 'ac_protocol_export':
                    case 'acExportRefLight':
                    case 'acLightImport':
                    case 'acImportGroupUsers':
                    case 'acExportGroupUsers':
                    case 'acImportUserLightPS':
                    case 'acExportUserLightPS':
                        item.img = menu.renderImage('Управление_системой_Обмен_данными');
                        break;
                    case 'acAnalysisTuning':
                        item.img = menu.renderImage('Управление_системой_Справочники');
                        break;
                    case 'acConstrXMLSchemeForms':
                        item.img = menu.renderImage('Управление_системой_Пользовательские_таблицы');
                        break;
                    case 'ac_USOB':
                    case 'ac_log_scheme':
                    case 'Call_BRCD':
                    case 'acDescrForImpGetter':
                        item.img = menu.renderImage('Управление_системой__Администрирование_системы');
                        break;
                    //case null: case '': case undefined:
                    //    if (!item.items[0].items || item.items[0].items.length <= 0) return;
                    //    switch (item.items[0].action) {
                    //        case 'VS_GdGeolDeposit':
                    //            item.img = menu.renderImage('GDGD');
                    //            break;
                    //    }
                    //    break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}