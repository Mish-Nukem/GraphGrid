//import { GridINUClass } from '../Grid/GridINU';
//import { PMGridClass } from './Pages/EntityGrids/MRGrid';
import { DDObjGridClass } from '../Common/Pages/DDObjGrid';
import { GridCreator } from '../Grid/Utils/GridClassCreator'
export class MRGridCreator extends GridCreator {
    constructor(props) {
        super(props);
    }

    CreateGridClass(props) {
        const entity = props.entity || '';

        if (entity.toLowerCase() === 'ddobjectentity') {
            return new DDObjGridClass(props);
        }

        return super.CreateGridClass(props);
    }

}