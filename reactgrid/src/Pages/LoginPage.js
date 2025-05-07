import { useState, useEffect } from 'react';
import { BaseComponent, log } from '../Grid/Base';
export function LoginPage(props) {
    let loginForm = null;

    const [loginState, setState] = useState({ login: '', ind: 0 });

    loginForm = loginState.login;
    if (!loginForm) {
        loginForm = new loginFormClass(props);
    }

    if (props.init) {
        props.init(loginForm);
    }

    //login.log(' 0.1 Reinit. rows = ' + login.rows.length + '. state = ' + login.stateind);

    if (!loginForm.refreshState) {
        loginForm.refreshState = function () {
            loginForm.log(' -------------- refreshState ' + loginForm.stateind + ' --------------- ');
            setState({ login: loginForm, ind: loginForm.stateind++ });
        }
    }

    useEffect(() => {
        loginForm.setupEvents();

        return () => {
            loginForm.removeEvents();
        }
    }, [loginForm])

    return (loginForm.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class loginFormClass extends BaseComponent {
    constructor(props) {
        super(props);

        const loginForm = this;

        loginForm.afterLogin = props.afterLogin;

        loginForm.stateind = 0;
    }

    render() {
        const loginForm = this;
        return (
            <>
                <button onClick={(e) => loginForm.afterLogin() }>Login</button>
            </>
        );
    }

    setupEvents() {
    }

    removeEvents() {
    }
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
