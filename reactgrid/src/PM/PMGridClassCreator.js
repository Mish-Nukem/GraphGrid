import { GridINUClass } from '../Grid/GridINU';
import { PMGridClass } from './Pages/EntityGrids/PMGrid';
export function PMGridCreator() {
    return {
        CreateGridClass: (props) => {
            const entity = props.entity || '';

            if (entity.toLowerCase() === 'srremarkentity') {
                return new PMGridClass(props);
            }

            return new GridINUClass(props);
        }
    }
}