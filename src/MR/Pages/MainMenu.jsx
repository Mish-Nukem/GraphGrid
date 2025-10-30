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
                item.img = menu.renderImage('InterfaceSettings');
                break;
            case 'acChangePassword':
                item.img = menu.renderImage('ChangePassword');
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
                item.img = menu.renderImage('SearchByBarcodeSM'); 
                break;
            case 'acListIMK':
                item.img = menu.renderImage('ListIMK');
                break;
            case 'acSmStorageSample':
                item.img = menu.renderImage('SmStorageSample'); 
                break;
            case 'acSmStorageCore':
                item.img = menu.renderImage('SmStorageCore'); 
                break;
            case 'acDocumentSys':
                item.img = menu.renderImage('DocumentSys'); 
                break;
            case 'acMovementsList':
                item.img = menu.renderImage('MovementsList'); 
                break;
            case 'acRepairsList':
                item.img = menu.renderImage('RepairsList'); 
                break;
            case 'acMustersList':
                item.img = menu.renderImage('MustersList'); 
                break;
            case 'acGearsList':
                item.img = menu.renderImage('GearsList'); 
                break;
            case 'Ac_ListRestTampPort':
                item.img = menu.renderImage('ListRestTampPort'); 
                break;
            case 'ac_ListRequestsVn':
                item.img = menu.renderImage('ListRequestsVn'); 
                break;
            case 'ac_ListRequestsPr':
                item.img = menu.renderImage('ListRequestsPr'); 
                break;
            case 'acListRequestsGis':
                item.img = menu.renderImage('ListRequestsGis'); 
                break;
            case 'acCallWorkfactPOFM':
                item.img = menu.renderImage('CallWorkfactPOFM'); 
                break;
            case 'acRWCP_coord':
                item.img = menu.renderImage(''); 
                break;
            case 'acCoordinate_Epic':
                item.img = menu.renderImage('OrdinatesEpic'); 
                break;
            case 'acPOAA_coord':
                item.img = menu.renderImage('OrdinatesPOAA'); 
                break;
            case 'acRWRP_coord':
                item.img = menu.renderImage(''); 
                break;
            case 'acLNCM_coord':
                item.img = menu.renderImage('OrdinatesLinear'); 
                break;
            case 'acANAA_coord':
                item.img = menu.renderImage('OrdinatesANAA'); 
                break;
            case 'acGDGD_coord':
                item.img = menu.renderImage('OrdinatesGDGD'); 
                break;
            case 'acLCSE_coord':
                item.img = menu.renderImage('OrdinatesLCSE'); 
                break;
            case 'acGRNA_coord':
                item.img = menu.renderImage('OrdinatesGRNA'); 
                break;
            case 'acOBWA_coord':
                item.img = menu.renderImage('OrdinatesOBWA'); 
                break;
            case 'acWorkAct':
                item.img = menu.renderImage('WorkAct'); 
                break;
            case 'VS_DispatcherPetrophysics':
                item.img = menu.renderImage('DispatcherPetrophysics'); 
                break;
            case 'VS_DispatcherPetrograph':
                item.img = menu.renderImage('DispatcherPetrograph'); 
                break;
            case 'acListGas':
                item.img = menu.renderImage(''); 
                break;
            case 'acListGas_Delphi':
                item.img = menu.renderImage('ListGas_Delphi'); 
                break;
            case 'VS_ListAssayMzn_Asrl':
                item.img = menu.renderImage('ListAssayMzn_Asrl'); 
                break;
            case 'VS_DispatcherGeochemist':
                item.img = menu.renderImage('DispatcherGeochemist'); 
                break;
            case 'acMineralogistProcessing':
                item.img = menu.renderImage('MineralogistProcessing'); 
                break;
            case 'acMinLabAssistantProcessing':
                item.img = menu.renderImage('MinLabAssistantProcessing'); 
                break;
            case 'acSearchByBarcodeMnlAssay':
            case 'acSearchByBarcodeAssayCat':
            case 'acSearchByBarcodeGhlAssay':
                
                item.img = menu.renderImage('SearchByBarcodeASSA'); 
                break;
            case 'VS_DispatcherMineralogy':
                item.img = menu.renderImage('DispatcherMineralogy'); 
                break;
            case 'VS_List_Journal_Prob':
                item.img = menu.renderImage('JournalASSA'); 
                break;
            case 'acMoveAssay':
                item.img = menu.renderImage('MoveASSA'); 
                break;
            case 'acSendAcceptCatalog':
                item.img = menu.renderImage('SendAcceptASSA'); 
                break;
            case 'ac_List_Catalog_Prob':
                item.img = menu.renderImage('CatalogASSA'); 
                break;
            case 'ac_List_Prob':
                item.img = menu.renderImage('ListASSA');
                break;
            case 'RWGI_CALC_CUBE':
                item.img = menu.renderImage('RwgiCalcCube'); 
                break;
            case 'RWGI_CALC_RAY':
                item.img = menu.renderImage('RwgiCalcRay'); 
                break;
            case 'acRwgiMetering':
                item.img = menu.renderImage('RwgiMetering'); 
                break;
            case 'acRwgiGround':
                item.img = menu.renderImage('RwgiGround'); 
                break;
            case 'PoGwsTlviewer':
                item.img = menu.renderImage('PoGwsTlviewer'); 
                break;
            case 'AcListPoGwsCollector':
                item.img = menu.renderImage('ListPoGwsCollector'); 
                break;
            case 'VS_Epicentre':
                item.img = menu.renderImage('Epicentre'); 
                break;
            case 'ANAA_Call_VS':
                item.img = menu.renderImage('ANAA'); 
                break;
            case 'acListGis':
                item.img = menu.renderImage('ListGIS'); 
                break;
            case 'acPoExperFiltWork':
                item.img = menu.renderImage('PoExperFiltWork'); 
                break;
            case 'MONITOR_INVESTIG':
                item.img = menu.renderImage('MONITOR_INVESTIG'); 
                break;
            case 'AQ_MONITORING_GRID':
                item.img = menu.renderImage('AQ_MONITORING'); 
                break;
            case 'VS_JournalDocum':
                item.img = menu.renderImage(''); 
                break;
            case 'VS_TN':
                item.img = menu.renderImage('POAA');
                break;
            case 'VS_GdLevel':
                item.img = menu.renderImage('GdLevel');
                break;
            case 'VS_GdGeolBlock':
                item.img = menu.renderImage('GdGeolBlock');
                break;
            case 'VS_GdOreBody':
                item.img = menu.renderImage('GdOreBody');
                break;
            case 'VS_GdGeolDeposit':
                item.img = menu.renderImage('GdGeolDeposit');
                break;
            case 'VS_ListLine':
                item.img = menu.renderImage('LNCM');
                break;
            case 'VS_Object_Grna':
                item.img = menu.renderImage('GRNA');
                break;
            case 'VS_Object_Works':
                item.img = menu.renderImage('OBWA');
                break;
            case 'VS_License_Call':
                item.img = menu.renderImage('LCNE');
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
                        item.img = menu.renderImage('GDGD');
                        break;
                    case 'ac_List_Prob':
                    case 'ac_List_Catalog_Prob':
                    case 'VS_List_Journal_Prob':
                        item.img = menu.renderImage('ASSA');
                        break;
                    case 'acSendAcceptCatalog':
                    case 'acSearchByBarcodeMnlAssay':
                    case 'acMoveAssay':
                    case 'acMinLabAssistantProcessing':
                    case 'acMineralogistProcessing':
                        item.img = menu.renderImage('BarcodeASSA');
                        break;
                    case 'acListGis':
                        item.img = menu.renderImage('GIS');
                        break;
                    case 'acRwgiGround':
                        item.img = menu.renderImage('RWGI');
                        break;
                    case 'acRWCP_coord':
                    case 'acRWRP_coord':
                        item.img = menu.renderImage('Ordinates');
                        break;
                    case 'VS_DispatcherMineralogy':
                        item.img = menu.renderImage('Mineralogy');
                        break;
                    case 'VS_DispatcherGeochemist':
                        item.img = menu.renderImage('Geochemy');
                        break;
                    case 'VS_ListAssayMzn_Asrl':
                    case 'acListGas_Delphi':
                        item.img = menu.renderImage('Microzond');
                        break;
                    case 'acOBWA_coord':
                    case 'acGRNA_coord':
                    case 'acLCSE_coord':
                    case 'acGDGD_coord':
                    case 'acANAA_coord':
                        item.img = menu.renderImage('OrdinatesArea');
                        break;
                    case 'acCoordinate_Epic':
                    case 'acPOAA_coord':
                        item.img = menu.renderImage('OrdinatesPoint');
                        break;
                    case 'Ac_ListRestTampPort':
                    case 'ac_ListRequestsVn':
                    case 'ac_ListRequestsPr':
                    case 'acListRequestsGis':
                        item.img = menu.renderImage('ListRequests');
                        break;
                    case 'acGearsList':
                    case 'acMovementsList':
                    case 'acRepairsList':
                    case 'acMustersList':
                        item.img = menu.renderImage('Gears');
                        break;
                    case 'acLayerProject':
                    case 'ac_MMPM':
                        item.img = menu.renderImage('LayerMaps');
                        break;
                    case 'acQueryBuilder':
                        item.img = menu.renderImage('QueryBuilder');
                        break;
                    case 'acFuncInterpreter':
                        item.img = menu.renderImage('Reports');
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
                        item.img = menu.renderImage('DataExchange');
                        break;
                    case 'acAnalysisTuning':
                        item.img = menu.renderImage('Dictionaries');
                        break;
                    case 'acConstrXMLSchemeForms':
                        item.img = menu.renderImage('UserTables');
                        break;
                    case 'ac_USOB':
                    case 'ac_log_scheme':
                    case 'Call_BRCD':
                    case 'acDescrForImpGetter':
                        item.img = menu.renderImage('SystemAdministration');
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