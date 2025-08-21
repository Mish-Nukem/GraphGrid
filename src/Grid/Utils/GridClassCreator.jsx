import { GridINUClass } from '../GridINU';
import { GridFLClass } from '../GridFL';
import { TeaaGridClass } from '../../ETL/Pages/EntityGrids/TeaaGrid';
export class GridCreator {
    CreateGridClass(props) {
        const entity = props.entity || '';

        if (entity.toLowerCase() === 'tinutuningexchteaaentity') {
            return new TeaaGridClass(props);
        }

        if (props.entity) {
            return new GridINUClass(props);
        }
        else {
            return new GridFLClass(props);
        }
    }

    GetEntityController() {
        return 'dictionary';
    }

}