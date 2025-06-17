import { useState, useEffect } from 'react';
import { MainMenuClass } from '../../Grid/Pages/MainMenu';
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
export class PMMainMenuClass extends MainMenuClass {
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