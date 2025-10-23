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
                selectingNodeObject={fcolumn._fieldEditObj}
                prevGraph={fcolumn.prevGraph}
                prevGrid={fcolumn.grid}
                level={fcolumn._fieldEditObj ? fcolumn._fieldEditObj.level + 1 : 1}
                onSelectFilterValue={(e) => {
                    const fe = fcolumn._fieldEditObj;
                    fe._selectedOptions = e.values || [];

                    fe.value = e.value;
                    fe.text = e.text;

                    e.fe = fe;
                    fe.lookupIsShowing = false;
                    if (fcolumn.grid) {
                        fcolumn.grid._clicksDisabled = false;
                    }

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