//import { GridINUClass } from '../Grid/GridINU';
//import { PMGridClass } from './Pages/EntityGrids/MRGrid';
import { DDObjGridClass } from '../Common/Pages/DDObjGrid';
import { GridCreator } from '../Grid/Utils/GridClassCreator'
import { POAAGridClass } from '../MR/Pages/EntityGrids/POAAGrid';
export class MRGridCreator extends GridCreator {
    constructor(props) {
        super(props);
    }

    CreateGridClass(props) {
        const entity = props.entity || '';

        if (entity.toLowerCase() === 'ddobjectentity') {
            return new DDObjGridClass(props);
        }
        else if (entity.toLowerCase() === 'tinupointobservpoaaentity') {
            return new POAAGridClass(props);
        }

        return super.CreateGridClass(props);
    }

    GetSchemeInfo(entity, schemeName) {
        if (!entity) return null;

        if (entity.toLowerCase() === 'tinupointobservpoaaentity') {
            return { schemeName: 'GM_Geology_POAA_xml', inSchemeUid: '6' };
        }
        //else if (entity.toLowerCase() === 'tinuobjectworkobwaentity') {
        //    return { schemeName: 'GM_Geology_POAA_xml', inSchemeUid: '6' };
        //}
        else if (entity.toLowerCase() === 'tinulinecommonlncmentity') {
            return { schemeName: 'GM_Lines_for_outer_scheme_xml', inSchemeUid: '0' };
        }

        

        return super.GetSchemeInfo(entity, schemeName);
    }
}