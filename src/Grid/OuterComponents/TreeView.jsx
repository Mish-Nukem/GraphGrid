import React, { useState/*, useEffect, useCallback*/ } from 'react';
import { Images } from '../Themes/Images';
//import { FaSquare, FaCheckSquare, FaMinusSquare } from "react-icons/fa";
//import { IoMdArrowDropright } from "react-icons/io";
import TreeView, { flattenTree } from "react-accessible-treeview";
import { Grid } from '../Grid';
//import Tree from 'rc-tree';
//import cx from "classnames";
export function RTreeView(props) {
    const [selectedIds, setSelectedIds] = useState([]);
    //const [expandedIds, setExpandedIds] = useState([]);

    const selectedId = selectedIds && selectedIds.length ? selectedIds[0] : props.data.length > 1 ? props.data[1].id : null;

    const GetNodeProps = function (id) {
        return new Promise(function (resolve, reject) {

            let selectedNode = props.data.find(function (item) {
                return item.id == id;
            });

            if (!selectedNode || !selectedNode.metadata) {
                resolve([]);
                return;
            }

            const rows = [];
            for (let key in selectedNode.metadata) {
                rows.push({ Key: key, Value: selectedNode.metadata[key] });
            }
            //selectedNode ? selectedNode.metadata : [];

            if (rows != null) {
                resolve(rows);
            } else {
                reject(Error("Error getting rows"));
            }
        });
    };

    const GetColumns = () => {
        return [{ name: 'Key', title: 'Параметр', w: 240 }, { name: 'Value', title: 'Значение', w: 240 }]
    }

    return (
        <div className="tree-div">
            <TreeView
                data={props.data}
                aria-label="Checkbox tree"
                multiSelect
                selectedIds={selectedIds}
                defaultSelectedIds={props.data.length > 1 ? [props.data[1].id] : []}
                propagateSelect
                propagateSelectUpwards
                togglableSelect
                onSelect={(props) => console.log('onSelect callback: ', props)}
                onNodeSelect={(props) => {
                    //console.log('onNodeSelect callback: ', props);
                    //selectedNode = props.element;
                    setSelectedIds([props.element.id]);
                }}
                nodeRenderer={({
                    element,
                    isBranch,
                    isExpanded,
                    isSelected,
                    isHalfSelected,
                    isDisabled,
                    getNodeProps,
                    level,
                    handleSelect,
                    handleExpand,
                }) => {
                    return (
                        <div {...getNodeProps()}
                            style={{ paddingLeft: 20 * (level - 1) }}
                        >
                            {!isBranch ? <></> : isExpanded ? Images.images.caretDown(20, 10) : Images.images.caretRight(20, 10)}
                            {Images.images.filterSelect(20, 10)}
                            <span onClick={handleSelect} className={`name ${isSelected ? 'selected' : ''}`} title={element.name}>{element.name}</span>
                        </div>

                    );
                }}
            />
            <div className="tree-right-panel">
                {
                    !selectedId ? <></>
                        :
                        <Grid
                            getRows={(e) => {
                                return GetNodeProps(e.grid._lastId);
                            }}
                            getColumns={GetColumns}
                            init={(grid) => {
                                if (selectedId && (!grid._lastId || grid._lastId != selectedId)) {
                                    grid._lastId = selectedId;
                                    grid.refresh();
                                }
                            }}
                            renderCell={(grid, col, row) => {
                                const val = String(row[col.name]);
                                if (col.name === 'Value' && val && val.length > 50) {
                                    return (
                                        <textarea
                                            value={val}
                                            style={{
                                                width: '100%',
                                                resize: 'vertical',
                                                overflowX: 'hidden',
                                                boxSizing: 'border-box',
                                                marginBottom: '-3px',
                                                fieldSizing: 'content',
                                            }}
                                        >
                                        </textarea>
                                    );
                                }

                                return grid.defaultRenderCell(grid, col, row);
                            }}
                        >
                        </Grid>
                }
            </div>
        </div>
    );
}