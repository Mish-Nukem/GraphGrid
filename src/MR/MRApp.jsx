//import '../Grid/css/default.css';
import { useState } from 'react';
import { GridFL } from '../Grid/GridFL';
import { GridINU } from '../Grid/GridINU';
import { GraphComponent } from '../Grid/GraphComponent';
import { LoginPage } from '../MR/Pages/LoginPage';
import appSettings from '../MR/MRSettings';
import { DataGetter } from '../Grid/Utils/DataGetter';
import { MRGridCreator } from './MRGridClassCreator'
import { MRMainMenu } from './Pages/MainMenu';
import { GLObject } from '../Grid/GLObject';
import { ReportParamsPage } from '../Reports/Pages/ReportParamsPage';
import Versions from '../Grid/Versions';
function MRApp() {
    const [state, setState] = useState({ menuObj: { id: - 2 } });

    window._logEnabled = true;

    document.title = 'Мирный';

    if (state.menuObj.id === -2) {
        GLObject.serverType = 2;
    }

    //"APIurl": "http://m2.infomega.local:5152/api/",
    //"PostgreSQLAPIurl": "http://m2.infomega.local:5152/api/"
    //"DebugAPIurl": "http://localhost:5152/api/",
    //"localAPIurl": "http://localhost/api/"

    appSettings.APIurl = appSettings.ORACLEAPIurl;

    // !!! раскомментрировать для отладки локально !!!
    if (GLObject.isDebug) {
        appSettings.APIurl = appSettings.DebugAPIurl;
    }
    // !!! раскомментрировать для отладки локально !!!

    GLObject.dataGetter = GLObject.dataGetter || new DataGetter(appSettings);
    GLObject.gridCreator = GLObject.gridCreator || new MRGridCreator();

    GLObject.dataGetter.APIurl = appSettings.APIurl;
    GLObject.appSettings = appSettings;

    GLObject.menuId = state.menuObj.id;

    GLObject.versionObj = GLObject.versionObj || new Versions();

    GLObject.changeAPIurl = GLObject.changeAPIurl || function (serverType) {
        GLObject.serverType = serverType;
        if (GLObject.isDubug) {
            GLObject.dataGetter.APIurl = appSettings.DebugAPIurl;
        }
        else {
            GLObject.dataGetter.APIurl = appSettings.APIurl = GLObject.serverType !== 0 ? appSettings.MSSQLAPIurl : appSettings.PostgreSQLAPIurl;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getMRApp = () => {
        console.log('state == ' + state.menuObj.id);

        const menuItem = state.menuObj.menuItem || {};
        const entity = menuItem.entity || '';
        //const parent = menuItem.parent || '';

        const parentItem = state.menuObj.menu && state.menuObj.menu.menuItems ? state.menuObj.menu.menuItems.find(function (item) {
            return item.id === menuItem.parent;
        }) : null;

        if (entity) {
            return (
                <>
                    <div className="div-on-menu">
                        <h3>{menuItem.text}</h3>
                    </div>

                    <div className="div-with-grid">
                        <GridINU uid={entity + '_dictionary'} entity={entity} controller={'dictionary'}></GridINU>
                    </div>
                </>
            );
        }

        if (state.menuObj.menuItem && state.menuObj.menuItem.action === 'acReports') {
            menuItem._reportParamsVisible = state.menuObj.id !== parentItem._lastItemId || menuItem._reportParamsVisible;
            parentItem._lastItemId = menuItem.id;

            parentItem.frmPos = parentItem.frmPos || { x: 200, y: 200 };

            return (
                <ReportParamsPage
                    nameReport={menuItem.text}
                    pos={parentItem.frmPos}
                    visible={menuItem._reportParamsVisible}
                    level={1}
                    onClose={() => {
                        menuItem._reportParamsVisible = false;
                        setState({ menuObj: { id: GLObject.menuId } });
                    }}
                ></ReportParamsPage>
            );
        }

        switch (state.menuObj.id) {
            case 'logout':
                setState({ menuObj: { id: - 2 } });

                GLObject.user = '';
                break;
            case 0:
                return <></>

            case 'about':
                return (
                    <>
                        <div className="div-with-grid">
                            <GridFL getRows={(e) => { return GLObject.versionObj.getRows(e) }} getColumns={GLObject.versionObj.getColumns} multi={true}></GridFL>
                        </div>
                    </>
                );

            case 'call':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
                        </div>
                    </>
                );
            //case 'acAddPropertys':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acCreateTableModule':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acRecalcGeographicCoord':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acSetStatesPOAA_VS':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acSetStatePOAA':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'acAnalysisDB':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="AnalysisDB_scheme"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acSearchErrorInMineralCard':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_DELETE_HANGING_ROWS':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName="ClearTables_scheme"></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_FIND_DOUBLE_LAB':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName="DoubleASLB_xml"></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acCheckAssayNumThr':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acClearUOXY':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acRepRef':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName="RepREfScheme"></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acCheckSEQ':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName="ListSEQ_scheme_xml"></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acWebOnWinForm':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'VS_TN_NoModal':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geology_POAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_Object_Works_NoModal':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Order_Forms_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_ListTNExecWorks':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListTNExecWorks"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_ListRequests':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListRequestsGraf"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acDescrForImpGetter':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName="ListEntityClass_scheme_xml"></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'Call_BRCD':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="Barcode_ASSAY"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_log_scheme':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="JournalScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_USOB':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="UsrAndObjScheme"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acImportGroupUsers':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acExportGroupUsers':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acImportUserLightPS':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acExportUserLightPS':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acLightImport':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acExportRefLight':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'ac_protocol_export':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="view_exp"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acPackageImportLas':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acLisImportPetrography':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acLisImportMicroprobe':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acLisImportGeochemistry':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acLisImportMineralogy':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_import_grid':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_AutoImport':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_export_spravochniki':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_ExportFromPSShort':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'ac_ExportFromPSFull':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'ac_export_grid':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="export_grid_1"></GraphComponent>
                        </div>
                    </>
                );
            case 'acChangeData':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="TuningListScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_MMPM':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="fm_MmPrjmapMR_XML"></GraphComponent>
                        </div>
                    </>
                );
            case 'acLayerProject':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="Layer_Project_scheme"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acSearchByBarcodeSM':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'acSmStorageSample':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="SmStorageSampleListScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acSmStorageCore':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="SmStorageCoreListScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acDocumentSys':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="DocumsListScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acMovementsList':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MovementsListGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'acRepairsList':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="RepairsListGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'acMustersList':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MustersListGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'acGearsList':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GearsListGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'Ac_ListRestTampPort':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="List_PORT"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_ListRequestsVn':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListRequestsGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_ListRequestsPr':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListRequestsGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'acListRequestsGis':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListRequestGis"></GraphComponent>
                        </div>
                    </>
                );
            case 'acCallWorkfactPOFM':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListTNExecWorks"></GraphComponent>
                        </div>
                    </>
                );
            case 'acRWCP_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_RWCP_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acCoordinate_Epic':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_EPAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acPOAA_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_POAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acRWRP_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_RWRP_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acLNCM_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_LNCM_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acANAA_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_ANAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acGDGD_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_GDGD_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acLCSE_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_LCSE_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acGRNA_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_GRNA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acOBWA_coord':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MR_UnOrdinatexyh_OBWA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acWorkAct':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="WorkAct"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_DispatcherPetrophysics':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="DispatcherPetrophysicsSchema"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_DispatcherPetrograph':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="DispatcherPetrographSchema"></GraphComponent>
                        </div>
                    </>
                );
            case 'acListGas':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geology_AssayMZNGAS_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acListGas_Delphi':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geology_AssayMZNGAS_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_ListAssayMzn_Asrl':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ProbaRslSchema"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acSearchByBarcodeGhlAssay':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'VS_DispatcherGeochemist':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="DispatcherGeochemistSchema"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acMineralogistProcessing':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acMinLabAssistantProcessing':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            //case 'acSearchByBarcodeMnlAssay':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'VS_DispatcherMineralogy':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="DispatcherMineralogySchema"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_List_Journal_Prob':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="JournalAssaysListScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acMoveAssay':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="List_Move_ASSA_MR"></GraphComponent>
                        </div>
                    </>
                );
            //case 'acSearchByBarcodeAssayCat':
            //    return (
            //        <>
            //            <div className="div-with-grid">
            //                <GraphComponent uid={state.menuObj.id} schemeName=""></GraphComponent>
            //            </div>
            //        </>
            //    );
            case 'acSendAcceptCatalog':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="CatalogMoving"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_List_Catalog_Prob':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geology_ASCT_xml_for_select"></GraphComponent>
                        </div>
                    </>
                );
            case 'ac_List_Prob':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geology_ASSA_for_select_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'RWGI_CALC_CUBE':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="RwgiCalcCubeMenu"></GraphComponent>
                        </div>
                    </>
                );
            case 'RWGI_CALC_RAY':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="RwgiCalcRayMenu"></GraphComponent>
                        </div>
                    </>
                );
            case 'acRwgiMetering':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="RwgiMeteringList"></GraphComponent>
                        </div>
                    </>
                );
            case 'acRwgiGround':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="RwgiGroundList"></GraphComponent>
                        </div>
                    </>
                );
            case 'PoGwsTlviewer':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListPoGwsTlviewer"></GraphComponent>
                        </div>
                    </>
                );
            case 'AcListPoGwsCollector':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListPoGwsCollector"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_Epicentre':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geophisics_EPAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'ANAA_Call_VS':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geophisics_ANAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'acListGis':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="ListGisGraf"></GraphComponent>
                        </div>
                    </>
                );
            case 'acPoExperFiltWork':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="PoExperFiltWork"></GraphComponent>
                        </div>
                    </>
                );
            case 'MONITOR_INVESTIG':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="MonitorInvestig"></GraphComponent>
                        </div>
                    </>
                );
            case 'AQ_MONITORING_GRID':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="Hydro_Geology"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_JournalDocum':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="JournalDocumTNListScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_TN':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GM_Geology_POAA_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_GdLevel':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GdGeolLevel_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_GdGeolBlock':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GdGeolBlock_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_GdOreBody':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GdGeolBody_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_GdGeolDeposit':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid={state.menuObj.id} schemeName="GdGeolDeposit_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_ListLine':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="GM_Lines" schemeName="GM_Lines_for_outer_scheme_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_Object_Grna':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Grna" schemeName="GM_Group_for_outer_scheme_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_Object_Works':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="GM_Order" schemeName="GM_Order_Forms_xml"></GraphComponent>
                        </div>
                    </>
                );
            case 'VS_License_Call':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="License" schemeName="License_scheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acObwaCoords':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="OBWA_coords" schemeName="OBWA_coords_scheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acReports':
                return (
                    <>
                    </>
                );
            case 'acDataExchangeTuning':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="TEAA" schemeName="TuningListScheme"></GraphComponent>
                        </div>
                    </>
                );
            default:
                return (
                    <h2>
                        {state.menuObj.id + ". Не реализовано!"}
                    </h2>
                );
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    return (
        state.menuObj.id < -1 ?
            <LoginPage
                afterLogin={(tokens) => {
                    if (!tokens) return;

                    setState({ menuObj: { id: 0 } });
                }}>
            </LoginPage>
            :
            <div >
                <MRMainMenu
                    //menuItems={testMenuItems}
                    onMenuItemClick={(e, item, menu) => {
                        if (item.onClick) {
                            item.onClick(e, item, menu);
                            return;
                        }

                        setState({ menuObj: { id: item.action, menuItem: item, menu: menu } });
                    }}
                >
                </MRMainMenu>
                <div className="div-on-menu">
                    {getMRApp()}
                </div>
            </div>
    );
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}

export default MRApp;