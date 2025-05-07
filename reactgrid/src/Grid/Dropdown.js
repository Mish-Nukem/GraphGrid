import { useState, useEffect } from 'react';
import { BaseComponent, log } from './Base';
import { renderToStaticMarkup } from 'react-dom/server';
import { Modal } from './Modal';
// ==================================================================================================================================================================
export function Dropdown(props) {
    let dd = null;

    const [ddState, setState] = useState({ dd: dd, ind: 0 });

    if (ddState.dd && ddState.dd.frozen) {
        dd = ddState.dd;
        dd.frozen = false;
    }
    else {
        dd = new DropdownClass(props);
    }

    //dd = ddState.dd || new DropdownClass(props);

    if (props.init) {
        props.init(dd);
    }

    if (!dd.refreshState) {
        dd.refreshState = function () {
            //log('refreshState ' + dd.stateind);
            setState({ dd: dd, ind: dd.stateind++ });
        }
    }

    useEffect(() => {
        dd.setupEvents();

        return () => {
            //log(' 0.11 Clear DropdownEvents');

            dd.clearEvents();
        }
    }, [dd])

    return (dd.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class DropdownClass extends BaseComponent {
    constructor(props) {
        super(props);

        this.opt = {};

        this.getItems = props.getItems || function ({ filter }) { return new Promise(function (resolve, reject) { resolve([]) }); };

        window._dropdownSeq = window._dropdownSeq || 0;

        this.id = window._dropdownSeq++;

        this.pageNumber = 1;
        this.pageSize = props.pageSize || 20;
        this.items = [];

        this.menuItemClass = '';
        this.menuClass = '';

        this.stateind = 0;

        this.opt.onItemClick = props.onItemClick;

        this.visible = false;
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
    renderPopup() {
        const dd = this;

        return (
            <>
                {
                    dd.allowUserFilter ? <></> : <></>
                }
                <ul
                    className={`dropdown-ul ${dd.menuClass || ''}`}
                    style={{ overflowX: 'hidden' }}
                >
                    {
                        dd.items.map((item, ind) => {
                            return (
                                <li
                                    dropdown-item={`${dd.id}_${item.id}_`}
                                    key={`${dd.id}_${item.id}_`}
                                    title={dd.translate(item.title || item.text)}
                                    className={dd.menuItemClass + (dd.activeItem === item ? ' active' : '')}
                                    onClick={(e) => dd.onItemClick(e, item.id)}
                                >
                                    {dd.translate(item.text)}
                                </li>
                            );
                        })
                    }
                    {
                        dd.allowUpload && dd.pageSize > 0 && dd.items.length === dd.pageSize * dd.pageNumber ?
                            <ul className={`dropdown-ul ${dd.menuClass || ''}`}>
                                <li dropdown-item={`${dd.id}_append_`}
                                    key={`${dd.id}_append_`}
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
    render(noModal) {
        const dd = this;

        return (
            dd.visible ? <Modal
                isModal={!noModal}
                renderContent={() => { return dd.renderPopup() }}
                closeWhenEscape={true}
                pos={dd.pos}
                closeWhenMiss={true}
                noHeader={true}
                noFooter={true}
                resizable={false}
                noPadding={true}
                hiddenOverlay={true}
            >
            </Modal> : <></>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    popup(e) {
        const dd = this;

        function afterGetItems(newItems) {
            if (newItems && newItems.length > 0) {
                dd.items.push(...newItems);
            }

            dd.lastPageNumber = dd.pageNumber;

            dd.visible = true;
            dd.frozen = true;

            const renderFake = function () {
                return (
                    <div>
                        {dd.renderPopup(true)}
                    </div>
                )
            }

            const fakeDiv = document.createElement('div');
            fakeDiv.style.opacity = 0;
            fakeDiv.style.position = 'fixed';
            fakeDiv.style.height = 'auto';
            fakeDiv.innerHTML = renderToStaticMarkup(renderFake());
            document.body.append(fakeDiv);
            const rect = getComputedStyle(fakeDiv);
            const w = parseInt(rect.width) + 2;
            const h = parseInt(rect.height) + 2;
            fakeDiv.remove();

            if (dd.items.length <= 0 && !dd.opt.allowUserFilter) return;

            const parentRect = dd.opt.parentRect ? dd.opt.parentRect : /*dd.opt.parentElem ? dd.opt.parentElem.getBoundingClientRect() :*/ { x: e.clientX, y: e.clientY, width: e.width || 0, height: e.height || 0 };

            dd.pos = {
                x: parentRect.x,
                y: parentRect.y + parseInt(parentRect.height),
                w: Math.max(w, parentRect.width),
                h: h
            };

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
        dd.visible = false;
        if (dd.opt.onClose) {
            dd.opt.onClose();
        }
        dd.frozen = true;

        dd.items = [];
        delete dd.activeItem;
        delete dd.lastPageNumber;

        dd.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onItemClick(e, itemId) {
        const dd = this;

        if (itemId === 'append') {
            dd.appendItems();
        }
        else {
            if (dd.opt.onItemClick) {
                dd.opt.onItemClick({ owner: dd.opt.owner, itemId: itemId, dropdown: dd });
            }
            dd.close();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
        const dd = this;
        function onKeyDown(e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            let ind;

            switch (key) {
                case 'esc', 'escape':
                    dd.close();;
                    break;
                case 'enter':
                    if (!dd.activeItem) return;

                    dd.opt.onItemClick({ owner: dd.opt.owner, itemId: dd.activeItem.id, dropdown: dd });
                    dd.close();
                    break;
                case 'down', 'arrowdown':
                    if (dd.activeItem) {
                        ind = dd.items.indexOf(dd.activeItem);

                        if (ind < 0 || ind === dd.items.length - 1) return;

                        dd.activeItem = dd.items[ind + 1];
                    }
                    else if (dd.items.length > 0) {
                        dd.activeItem = dd.items[0];
                    }

                    dd.frozen = true;
                    dd.refreshState();
                    break;
                case 'up', 'arrowup':
                    if (dd.activeItem) {
                        ind = dd.items.indexOf(dd.activeItem);

                        if (ind <= 0) return;

                        dd.activeItem = dd.items[ind - 1];
                    }
                    else if (dd.items.length > 0) {
                        dd.activeItem = dd.items[0];
                    }

                    dd.frozen = true;
                    dd.refreshState();
                    break;
                default:
                    break;
            }
        }

        document.addEventListener('keydown', onKeyDown);


        dd.clearEvents = function () {
            document.removeEventListener('keydown', onKeyDown);
        }
    }
}
// ==================================================================================================================================================================