import { useState, useEffect } from 'react';
import { Images } from '../Themes/Images';
import { BaseComponent } from '../Base';
import { Dropdown } from '../Dropdown';
import { GLObject } from '../GLObject';
import { renderToStaticMarkup } from 'react-dom/server';
export function MainMenu(props) {
    let menu = null;

    const [menuState, setState] = useState({ menu: menu, ind: 0 });

    menu = menuState.menu || new MainMenuClass(props);

    if (props.init) {
        props.init(menu);
    }

    menu.mainMenuItemClass = props.mainMenuItemClass || BaseComponent.theme.mainMenuItemClass;

    menu.refreshState = function () {
        setState({ menu: menu, ind: menu.stateind++ });
    }

    useEffect(() => {
        menu.setupEvents(menu);

        if (!menu.menuItems || menu.menuItems.length <= 0) {

            menu.getMainMenuItems().then(
                menuItems => {
                    menu.menuItems = menuItems;
                    menu.prepareMenu();
                    menu.refreshState();
                }
            );
        }

        return () => {
            menu.clearEvents();
        }
    }, [menu])

    return (menu.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class MainMenuClass extends BaseComponent {
    constructor(props) {
        super(props);

        const menu = this;
        menu.stateind = 0;

        menu.id = MainMenuClass._seq++;

        menu.divClassName = props.divClassName != null ? props.divClassName : "main-menu-div";
        menu.allowCollapse = props.allowCollapse != null ? props.allowCollapse : true;

        menu.menuItems = props.menuItems;
        menu.onMenuItemClick = props.onMenuItemClick;

        menu.getDisabled = props.getDisabled;

        menu.showingItems = [];

        if (menu.menuItems && menu.menuItems.length > 0) {
            menu.prepareMenu();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _seq = 0;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareMenu() {
        const menu = this;
        if (!menu.menuItems || menu.menuItems.length <= 0) return;

        menu.rootLevel = [];
        menu.itemsDict = {};
        menu.activeItems = {};
        menu.selectedItems = {};

        for (let item of menu.menuItems) {
            if (item.parent == null || item.parent === '') {
                item.level = 1;
                menu.rootLevel.push(item);

            }
            menu.itemsDict[item.id] = item;
        }

        let found = true;
        while (found) {
            found = false;

            for (let item of menu.menuItems) {
                if (item.level != null) continue;

                let parentItem = menu.itemsDict[item.parent];
                if (!parentItem || parentItem.level == null) continue;

                found = true;

                parentItem.items = parentItem.items || [];
                parentItem.items.push(item);
                parentItem.noClose = true;
                item.level = parentItem.level + 1;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setRootLevelItemsWidth() {
        const menu = this;
        for (let item of menu.rootLevel) {
            if (item.minW == null) {
                item.minW = menu.getRootLevelItemWidth(item);
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRootLevelItemWidth(item) {
        const menu = this;
        let res = 0;
        const fakeDiv = document.createElement('div');
        fakeDiv.style.opacity = 0;
        fakeDiv.style.position = 'fixed';
        fakeDiv.style.height = 'auto';
        fakeDiv.className = menu.divClassName;
        fakeDiv.innerHTML = renderToStaticMarkup(menu.renderRootLevelItem(item, 0));
        document.body.append(fakeDiv);
        const rect = getComputedStyle(fakeDiv);
        res = parseInt(rect.width) + 2;//(item.img ? 6 : 2);
        fakeDiv.remove();
        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const menu = this;

        return (
            menu.menuItems && menu.menuItems.length > 0 ?
                <>
                    <div
                        key={`mainmenu_div_${menu.id}_`}
                        className={menu.divClassName}
                        style={{ height: menu.collapsed ? '0' : '' }}
                    >
                        {
                            menu.allowCollapse ?
                                <button
                                    key={`menucollapse_button_${menu.id}_`}
                                    onClick={() => { menu.collapsed = !menu.collapsed; menu.refreshState(); }}
                                    title={!menu.collapsed ? menu.translate('Collapse') : menu.translate('Expand')}
                                    className='menu-collapse-button'
                                >
                                    {menu.collapsed ? Images.images.chevronDown(20, 10) : Images.images.chevronUp(20, 10)}
                                </button>
                                :
                                <></>
                        }
                        {
                            !menu.collapsed ?
                                <>
                                    {
                                        menu.rootLevel.map((item, ind) => {
                                            return menu.renderRootLevelItem(item, ind);
                                        })
                                    }
                                    {
                                        menu.isShowingDropdown ?
                                            menu.showingItems.map((item, ind) => {
                                                return (
                                                    <Dropdown
                                                        key={`menudropdownitem_${menu.id}_${item.id}_${ind}_`}
                                                        onItemClick={(e) => menu.onItemClick(e, e.itemId)}
                                                        onClose={() => {
                                                            menu.isShowingDropdown = false;
                                                            menu.showingItems = [];
                                                            menu.refreshState();
                                                        }}
                                                        onItemMouseEnter={(e, childItem) => {
                                                            if (menu.activeItems[childItem.id]) return;

                                                            menu.activeItems[childItem.id] = 1;
                                                            menu.showChildren(e, childItem);
                                                        }}
                                                        onMouseLeave={() => {
                                                            menu.isShowingDropdown = false;
                                                            setTimeout(() => {
                                                                menu.closeDropdowns();
                                                            }, 100);
                                                        }}
                                                        items={item.items}
                                                        dimensionsByContent={true}
                                                        isModal={false}
                                                        pos={{ x: item.x, y: item.y, minW: item.minW, maxX: item.maxX }}
                                                        init={(dd) => {
                                                            dd.activeItem = item.items.find(function (fitem) {
                                                                return menu.selectedItems[fitem.id];
                                                            });
                                                        }}
                                                    >
                                                    </Dropdown>
                                                );
                                            })
                                            :
                                            <></>
                                    }
                                </>
                                :
                                <></>
                        }
                    </div>
                </>
                :
                <></>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderRootLevelItem(item, ind) {
        const menu = this;

        return (
            <button
                key={`menurootitem_${menu.id}_${item.id}_${ind}_`}
                title={menu.translate(item.title || item.text)}
                className={(menu.mainMenuItemClass || '')
                    + (menu.activeItems[item.id] ? ' menu-item-root-selected' : ' menu-item-root')
                    + (menu.selectedItems[item.id] ? ' active' : '')}
                disabled={menu.getDisabled && menu.getDisabled({ item: item }) || item.disabled ? 'disabled' : ''}
                onClick={(e) => menu.onItemClick(e, item.id)}
                onMouseEnter={(e) => {
                    if (menu.activeItems[item.id]) {
                        setTimeout(() => {
                            menu.closeDropdowns(e, item.id);
                        }, 10);
                        return;
                    }

                    menu.activeItems[item.id] = 1;
                    menu.showChildren(e, item);
                }}
                onMouseLeave={() => {
                    setTimeout(() => {
                        if (!menu.activeItems[item.id] || +menu.activeItems[item.id] > 1) return;

                        menu.isShowingDropdown = false;

                        menu.closeDropdowns();
                    }, 300);
                }}
                style={{ minWidth: item.minW, whiteSpace: 'nowrap' }}
            >
                {item.img ? item.img() : ''}
                {menu.translate(item.text)}
            </button>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showChildren(e, item) {
        const menu = this;

        if (item.items && item.items.length > 0) {

            menu.isShowingDropdown = true;

            const rect = e.target.getBoundingClientRect();

            if (item.level > 1 && rect.x + rect.width * 2 >= document.documentElement.clientWidth) {
                item.maxX = parseInt(rect.x);
            }

            if (item.minW == null || item.minW <= 0) {
                item.minW = parseInt(rect.width);
            }

            item.x = parseInt(rect.x) + (item.level === 1 ? 0 : parseInt(rect.width));
            item.y = parseInt(rect.y) + (item.level === 1 ? parseInt(rect.height) : 0);
        }
        else {
            menu.isShowingDropdown = item.level !== 1;
        }

        menu.showingItems = [];
        menu.activeItems = {};
        let i = 1;
        while (item) {
            if (!e.skipActivate) {
                menu.activeItems[item.id] = i++;
            }

            if (item.items && item.items.length > 0) {
                menu.showingItems.unshift(item);
            }

            item = menu.itemsDict[item.parent];
        }

        menu.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeDropdowns() {
        const menu = this;

        if (menu.isShowingDropdown || menu.showingItems.length <= 0) return;

        menu.showingItems = [];
        menu.activeItems = {};
        menu.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    hideChildren(item) {
        const menu = this;

        if (menu.isShowingDropdown || menu.showingItems.length <= 0) return;

        menu.showingItems = [];
        menu.activeItems = {};
        item = menu.itemsDict[item.parent];

        while (item) {
            menu.showingItems.push(item);
            menu.activeItems[item.id] = 1;

            item = menu.itemsDict[item.parent];
        }

        menu.isShowingDropdown = menu.showingItems.length > 0;

        menu.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onItemClick(e, itemId) {
        const menu = this;
        let item = menu.itemsDict[itemId];

        if (item.level === 1 && (!item.items || item.items.length <= 0)) {
            menu.activeItems = {};
        }

        if (item.items && item.items.length > 0) {
            menu.showChildren(e, item)
        }
        else {
            menu.onMenuItemClick(e, item, menu);

            menu.selectedItems = {};
            while (item) {
                menu.selectedItems[item.id] = 1;
                item = menu.itemsDict[item.parent];
            }

            menu.isShowingDropdown = false;
            menu.closeDropdowns();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getMainMenuItems() {
        const menu = this;
        return new Promise((resolve) => { resolve(menu.menuItems); });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderImage(name) {
        return () => {
            if (!Images._outerImagesDict || !Images._outerImagesDict[name]) return <></>;

            return (
                <div dangerouslySetInnerHTML={{ __html: Images._outerImagesDict[name] }} className="image-container-div"></div>
            )
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}