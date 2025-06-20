import { GridINUClass } from '../Grid/GridINU';
import { PMGridClass } from './Pages/EntityGrids/PMGrid';
import { TeaaGridClass } from '../ETL/Pages/EntityGrids/TeaaGrid';
export function PMGridCreator() {
    return {
        CreateGridClass: (props) => {
            const entity = props.entity || '';

            if (entity.toLowerCase() === 'srremarkentity') {
                return new PMGridClass(props);
            }
            else if (entity.toLowerCase() === 'tinutuningexchteaaentity') {
                return new TeaaGridClass(props);
            }

            return new GridINUClass(props);
        }
    }
}