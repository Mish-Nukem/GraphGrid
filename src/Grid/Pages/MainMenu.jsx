import { useState, useEffect } from 'react';
import { Images } from '../Themes/Images';
import { BaseComponent } from '../Base';
import { Dropdown } from '../Dropdown';
export function MainMenu(props) {
    let menu = null;

    const [menuState, setState] = useState({ menu: menu, ind: 0 });

    menu = menuState.menu || new MainMenuClass(props);

    if (props.init) {
        props.init(menu);
    }

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

        menu.menuItems = props.menuItems;
        menu.onMenuItemClick = props.onMenuItemClick;

        menu.mainMenuItemClass = props.mainMenuItemClass || BaseComponent.theme.mainMenuItemClass;

        menu.showingItems = [];
        //menu.translate = props.translate || ((text) => { return text; });
        menu.prepareMenu();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareMenu() {
        const menu = this;
        if (!menu.menuItems || menu.menuItems.length <= 0) return;

        menu.rootLevel = [];
        menu.itemsDict = {};
        menu.activeItems = {};
        menu.selectedItems = {};

        for (let item of menu.menuItems) {
            if (item.parent === undefined) {
                item.level = 1;
                menu.rootLevel.push(item);
            }
            menu.itemsDict[item.id] = item;
        }

        let found = true;
        while (found) {
            found = false;

            for (let item of menu.menuItems) {
                if (item.level !== undefined) continue;

                let parentItem = menu.itemsDict[item.parent];
                if (!parentItem || parentItem.level === undefined) continue;

                found = true;

                parentItem.items = parentItem.items || [];
                parentItem.items.push(item);
                parentItem.noClose = true;
                item.level = parentItem.level + 1;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const menu = this;

        return (
            menu.menuItems && menu.menuItems.length > 0 ?
                <>
                    <div
                        key={`mainmenu_div_`}
                        className="main-menu-div"
                        style={{ height: menu.collapsed ? '0' : '' }}
                    >
                        <button
                            key={`menucollapse_button_`}
                            onClick={() => { menu.collapsed = !menu.collapsed; menu.refreshState(); }}
                            title={!menu.collapsed ? menu.translate('Collapse') : menu.translate('Expand')}
                            className='menu-collapse-button'
                        >
                            {menu.collapsed ? /*Images.images.caretDown() : Images.images.caretUp()*/Images.images.chevronDown(20, 10) : Images.images.chevronUp(20, 10)}
                        </button>
                        {
                            !menu.collapsed ?
                                <>
                                    {
                                        menu.rootLevel.map((item, ind) => {
                                            return (
                                                <button
                                                    key={`menurootitem_${menu.id}_${item.id}_${ind}_`}
                                                    title={menu.translate(item.title || item.text)}
                                                    className={(menu.mainMenuItemClass || '')
                                                        + (menu.activeItems[item.id] ? ' menu-item-selected' : ' menu-item')
                                                        + (menu.selectedItems[item.id] ? ' active' : '')}
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
                                                    onMouseOut={() => {
                                                        if (!menu.activeItems[item.id]) return;

                                                        menu.isShowingDropdown = false;

                                                        setTimeout(() => {
                                                            menu.closeDropdowns();
                                                        }, 10);
                                                    }}
                                                >
                                                    {menu.translate(item.text)}
                                                </button>
                                            );
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
                                                            if (menu.activeItems[childItem.id]/* && !childItem.items*/) return;

                                                            menu.activeItems[childItem.id] = 1;
                                                            menu.showChildren(e, childItem);
                                                        }}
                                                        onMouseLeave={() => {
                                                            menu.isShowingDropdown = false;
                                                            setTimeout(() => {
                                                                //menu.hideChildren(item);
                                                                menu.closeDropdowns();
                                                            }, 100);
                                                        }}
                                                        items={item.items}
                                                        dimensionsByContent={true}
                                                        isModal={false}
                                                        pos={{ x: item.x, y: item.y, minW: item.minW }}
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
    showChildren(e, item) {
        const menu = this;

        if (item.items && item.items.length > 0) {

            menu.isShowingDropdown = true;
            //menu.showingItems = item.level === 1 ? [] : menu.showingItems;

            const rect = e.target.getBoundingClientRect();
            item.x = parseInt(rect.x) + (item.level === 1 ? 0 : parseInt(rect.width));
            item.y = parseInt(rect.y) + (item.level === 1 ? parseInt(rect.height) : 0);
            item.minW = parseInt(rect.width);
        }
        else {
            menu.isShowingDropdown = item.level !== 1;
        }

        //if (e.skipActivate) {
        //    menu.refreshState();
        //    return;
        //}

        menu.showingItems = [];
        menu.activeItems = {};
        while (item) {
            if (!e.skipActivate) {
                menu.activeItems[item.id] = 1;
            }

            if (item.items && item.items.length > 0) {
                menu.showingItems.push(item);
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
            menu.onMenuItemClick(e, item);

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
    setupEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}