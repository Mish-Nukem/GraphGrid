import { GridINUClass } from '../Grid/GridINU';
import { PMGridClass } from './Pages/EntityGrids/PMGrid';
import { DDObjGridClass } from './Pages/EntityGrids/DDObjGrid';
import { GridCreator } from '../Grid/Utils/GridClassCreator'
export class PMGridCreator extends GridCreator {
    constructor(props) {
        super(props);
    }

    CreateGridClass(props) {
        const entity = props.entity || '';

        if (entity.toLowerCase() === 'srremarkentity') {
            return new PMGridClass(props);
        }
        else if (entity.toLowerCase() === 'ddobjectentity') {
            return new DDObjGridClass(props);
        }

        return super.CreateGridClass(props);
    }
}