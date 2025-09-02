import { GridINUClass } from '../GridINU';
import { GridFLClass } from '../GridFL';
import { TeaaGridClass } from '../../ETL/Pages/EntityGrids/TeaaGrid';
import { GraphComponent } from '../GraphComponent';
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

    GetSchemeInfo(/*entity, schemeName*/) {
        return null;
    }

    renderSelectingGraph(fcolumn) {
        return (
            <GraphComponent
                uid={`${fcolumn.id}_select_${fcolumn.entity}_`}
                schemeName={fcolumn.schemeInfo.schemeName}
                selectingNodeUid={fcolumn.schemeInfo.inSchemeUid}
                selectingNodeMulti={fcolumn.multi}
                selectingNodeValue={fcolumn.value}
                onSelectFilterValue={(e) => {
                    const fe = fcolumn._fieldEditObj;

                    e.value = e.selectedValue;
                    e.text = e.selectedText;
                    fe._selectedOptions = e.selectedValues;
                    fe.lookupIsShowing = false;

                    fe.onChange(e);
                }}
            >
            </GraphComponent>
        );
    }

    GetEntityController() {
        return 'dictionary';
    }

}