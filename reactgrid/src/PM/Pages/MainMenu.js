import { useState, useEffect } from 'react';
import { BaseComponent } from '../../Grid/Base';
import { Dropdown } from '../../Grid/Dropdown';
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
        menu.dataGetter = props.dataGetter;
        menu.onMenuItemClick = props.onMenuItemClick;

        //menu.translate = props.translate || ((text) => { return text; });
        menu.prepareMenu();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareMenu() {
        const menu = this;
        if (!menu.menuItems || menu.menuItems.length <= 0) return;

        menu.rootLevel = [];
        menu.itemsDict = {};

        for (let item of menu.menuItems) {
            if (!item.parent) {
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
                    >
                        <div
                            key={`menucollapse_div_`}
                            className="menu-collapse-div"
                        >
                            <button
                                key={`menucollapse_button_`}
                                onClick={(e) => { menu.collapsed = !menu.collapsed; menu.refreshState(); }}
                            >
                                {!menu.collapsed ? menu.translate('Collapse') : menu.translate('Expand')}
                            </button>
                        </div>
                        {
                            !menu.collapsed ?
                                <>
                                    {
                                        menu.rootLevel.map((item, ind) => {
                                            return (
                                                <button
                                                    key={`menurootitem_${menu.id}_${item.id}_${ind}_`}
                                                    title={menu.translate(item.title || item.text)}
                                                    className={menu.menuItemClass}
                                                    onClick={(e) => menu.onItemClick(e, item.id)}
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
                                                        onClose={(e) => {
                                                            menu.isShowingDropdown = false;
                                                            menu.showingItems = [];
                                                            menu.refreshState();
                                                        }}
                                                        items={item.items}
                                                        dimensionsByContent={true}
                                                        pos={{ x: item.x, y: item.y }}
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
    onItemClick(e, itemId) {
        const menu = this;
        const item = menu.itemsDict[itemId];

        if (item.items && item.items.length > 0) {
            menu.isShowingDropdown = true;
            menu.showingItems = menu.showingItems || [];
            menu.showingItems.push(item);
            item.x = e.clientX;
            item.y = e.clientY;
            menu.refreshState();
        }
        else {
            menu.onMenuItemClick(e, item);
            menu.isShowingDropdown = false;
            menu.showingItems = [];
            menu.refreshState();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getMainMenuItems() {
        const menu = this;

        return new Promise((resolve) => {
            const params = [
                //{ key: 'filter', value: filter },
            ];

            menu.dataGetter.get({ url: 'system/getMainMenuItems', params: params }).then(
                (result) => {
                    resolve(result);
                });
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearEvents() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}