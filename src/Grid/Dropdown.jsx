import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
import { Images } from './Themes/Images';
import { ModalClass } from './Modal';
// ==================================================================================================================================================================
export function Dropdown(props) {
    let dd = null;

    const [ddState, setState] = useState({ dd: dd, ind: 0 });

    if (ddState.dd) {
        dd = ddState.dd;
    }
    else {
        dd = new DropdownClass(props);
    }

    if (props.init && !ModalClass._isFake) {
        props.init(dd);
    }

    dd.refreshState = function () {
        setState({ dd: dd, ind: dd.stateind++ });
    }

    useEffect(() => {
        dd.setupEvents();

        return () => {
            dd.clearEvents();
        }
    }, [dd])

    return (dd.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class DropdownClass extends ModalClass {
    constructor(props) {
        super(props);

        const dd = this;

        dd.getItems = props.getItems || function () { return new Promise(function (resolve) { resolve([]) }); };

        window._dropdownSeq = window._dropdownSeq || 0;

        dd.id = window._dropdownSeq++;

        dd.pageNumber = 1;
        dd.pageSize = props.pageSize || 20;
        dd.items = props.items || [];

        dd.menuItemClass = props.menuItemClass || BaseComponent.theme.menuItemClass;
        dd.menuClass = props.menuClass || BaseComponent.theme.menuClass;

        dd.stateind = 0;

        dd.opt.onItemClick = props.onItemClick;
        dd.opt.onClose = props.onClose;

        dd.opt.parentRect = props.parentRect;

        dd.maxW = props.maxW;

        dd.opt.closeWhenEscape = true;
        dd.opt.noHeader = true;
        dd.opt.noFooter = true;
        dd.opt.resizable = false;
        dd.opt.noPadding = true;
        dd.opt.hiddenOverlay = true;
        //dd.opt.closeWhenMiss = !props.closeWhenMouseLeave;
        //dd.opt.isModal = !props.closeWhenMouseLeave;

        dd.opt.onItemMouseEnter = props.onItemMouseEnter;

        dd.renderContent = dd.renderDropdownContent;

        dd.visible = dd.items.length > 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    appendItems() {
        const dd = this;

        dd.pageNumber++;

        dd.getItems({ filter: dd.filter }).then(
            items => {
                dd.items = items;

                dd.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderDropdownContent() {
        const dd = this;

        return (
            <>
                {
                    dd.allowUserFilter ? <></> : <></>
                }
                <ul
                    key={`dropdown_${dd.id}_`}
                    className={`dropdown-ul ${dd.menuClass || ''}`}
                    style={{ overflowX: 'hidden' }}
                >
                    {
                        dd.items.map((item, ind) => {
                            return (
                                <li
                                    dropdown-item={`${dd.id}_${item.id}_`}
                                    key={`dropdownitem_${dd.id}_${item.id}_${ind}_`}
                                    title={dd.translate(item.title || item.text)}
                                    className={dd.menuItemClass + (dd.activeItem === item ? ' active' : '')}
                                    onClick={(e) => dd.onItemClick(e, item.id)}
                                    onMouseEnter={(e) => {
                                        if (!dd.opt.onItemMouseEnter) return;
                                        dd.opt.onItemMouseEnter(e, item);
                                    }}
                                >
                                    {dd.translate(item.text)}
                                    {item.items && item.items.length > 0 ? <div>{Images.images.next(20, 10)}</div> : ''}
                                </li>
                            );
                        })
                    }
                    {
                        dd.allowUpload && dd.pageSize > 0 && dd.items.length === dd.pageSize * dd.pageNumber ?
                            <ul className={`dropdown-ul ${dd.menuClass || ''}`}
                                key={`dropdownadd_${dd.id}_`}
                            >
                                <li dropdown-item={`${dd.id}_append_`}
                                    key={`dropdownitem_$${dd.id}_append_`}
                                    title={dd.translate('load more records')}
                                    className={dd.menuItemClass}
                                    onClick={(e) => dd.onItemClick(e, 'append')}
                                >
                                    ${dd.translate('more...')}
                                </li>
                            </ul>
                            : <></>
                    }
                </ul>
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        return super.render();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    popup(e) {
        const dd = this;

        function afterGetItems(newItems) {
            if (newItems && newItems.length > 0) {
                dd.items.push(...newItems);
            }

            dd.lastPageNumber = dd.pageNumber;

            dd.visible = dd.items.length > 0;

            const rect = dd.getDimensionsByContent();

            if (dd.items.length <= 0 && !dd.opt.allowUserFilter) return;

            const parentRect = dd.opt.parentRect ? dd.opt.parentRect : { x: e.clientX, y: e.clientY, width: e.width || 0, height: e.height || 0 };

            dd.opt.pos = {
                x: parentRect.x,
                y: parentRect.y + parseInt(parentRect.height),
                w: Math.max(rect.w, parentRect.width),
                h: rect.h
            };

            if (dd.maxW !== undefined) {
                dd.opt.pos.w = Math.min(dd.opt.pos.w, dd.maxW);
            }
            //log(' DropdownPos w = ' + dd.pos.w + ', h = ' + dd.pos.h);

            dd.refreshState();
        }

        if (!dd.lastPageNumber || dd.lastPageNumber !== dd.pageNumber || dd.items.length <= 0) {
            dd.getItems({ filter: dd.filter, pageSize: dd.pageSize, pageNumber: dd.pageNumber }).then(
                items => {
                    afterGetItems(items);
                }
            );
        }
        else {
            afterGetItems();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    close() {
        const dd = this;

        dd.items = [];
        delete dd.activeItem;
        delete dd.lastPageNumber;

        super.close();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onItemClick(e, itemId) {
        const dd = this;

        if (itemId === 'append') {
            dd.appendItems();
        }
        else {
            if (dd.opt.onItemClick) {
                dd.opt.onItemClick({ owner: dd.opt.owner, itemId: itemId, dropdown: dd, clientX: e.clientX, clientY: e.clientY, target: e.target });
            }

            const clickedItem = dd.items.find(function (item) {
                return item.id === itemId;
            });

            if (!clickedItem || !clickedItem.noClose) {
                dd.close();
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
        const dd = this;

        super.setupEvents();

        function onKeyDown(e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            let ind;

            switch (key) {
                case 'enter':
                    if (!dd.activeItem) return;

                    dd.opt.onItemClick({ owner: dd.opt.owner, itemId: dd.activeItem.id, dropdown: dd });
                    dd.close();
                    break;
                case 'down':
                case 'arrowdown':
                    if (dd.activeItem) {
                        ind = dd.items.indexOf(dd.activeItem);

                        if (ind < 0 || ind === dd.items.length - 1) return;

                        dd.activeItem = dd.items[ind + 1];
                    }
                    else if (dd.items.length > 0) {
                        dd.activeItem = dd.items[0];
                    }

                    dd.refreshState();
                    break;
                case 'up':
                case 'arrowup':
                    if (dd.activeItem) {
                        ind = dd.items.indexOf(dd.activeItem);

                        if (ind <= 0) return;

                        dd.activeItem = dd.items[ind - 1];
                    }
                    else if (dd.items.length > 0) {
                        dd.activeItem = dd.items[0];
                    }

                    dd.refreshState();
                    break;
                case 'tab':
                    dd.close();
                    break;
                default:
                    break;
            }
        }

        document.addEventListener('keydown', onKeyDown);

        const remClearEvents = dd.clearEvents;
        dd.clearEvents = function () {
            remClearEvents();
            document.removeEventListener('keydown', onKeyDown);
        }
    }
}
// ==================================================================================================================================================================