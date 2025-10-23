import { useState, useEffect } from 'react';
import { MainMenuClass } from '../../Grid/Pages/MainMenu';
import { GLObject } from '../../Grid/GLObject';
export function MRMainMenu(props) {
    let menu = null;

    const [menuState, setState] = useState({ menu: menu, ind: 0 });

    menu = menuState.menu || new MRMainMenuClass(props);

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
export class MRMainMenuClass extends MainMenuClass {
    constructor(props) {
        super(props);

        const menu = this;
        menu.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        return super.render();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getMainMenuItems() {
        return new Promise((resolve) => {
            const params = [
                //{ key: 'filter', value: filter },
            ];

            GLObject.dataGetter.get({ url: 'system/getMainMenuItems', params: params }).then(
                (result) => {
                    result.unshift({ id: -1, action: 'logout', text: GLObject.serverType !== 0 ? "Выход (ORACLE)" : "Выход (PostgreSQL)" });
                    result.unshift({ id: -2, action: 'about', text: GLObject.versionNum });

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