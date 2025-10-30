import { useState, useEffect } from 'react';
import { MainMenuClass } from '../../Grid/Pages/MainMenu';
import { GLObject } from '../../Grid/GLObject';
import Versions from '../../Grid/Versions';
export function PMMainMenu(props) {
    let menu = null;

    const [menuState, setState] = useState({ menu: menu, ind: 0 });

    menu = menuState.menu || new PMMainMenuClass(props);

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
export class PMMainMenuClass extends MainMenuClass {
    constructor(props) {
        super(props);

        const menu = this;
        menu.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareMenu() {
        const menu = this;
        super.prepareMenu();

        for (let item of menu.menuItems) {
            menu.setItemImage(item);
        }

        menu.setRootLevelItemsWidth();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        return super.render();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setItemImage(item) {
        const menu = this;
        if (!item || !item.action && item.level == 1 || item.img) return;

        switch (item.action) {
            case 'logout':
                item.img = menu.renderImage('exit');
                break;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getMainMenuItems() {
        return new Promise((resolve) => {
            const params = [
                //{ key: 'filter', value: filter },
            ];

            GLObject.dataGetter.get({ url: 'system/getMainMenuItems', params: params }).then(
                (result) => {
                    result.unshift({ id: -1, action: 'logout', text: GLObject.serverType !== 0 ? "Выход (MSSQL)" : "Выход (PostgreSQL)" });
                    result.unshift({ id: -2, action: 'about', text: Versions.LastVersion });

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