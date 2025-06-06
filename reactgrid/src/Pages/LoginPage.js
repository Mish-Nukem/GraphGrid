import { useState, useEffect } from 'react';
import { BaseComponent } from '../Grid/Base';
//import { BootstrapTheme as Theme } from '../Grid/Themes/BootstrapGridTheme';
export function LoginPage(props) {
    let loginForm = null;

    const [state, setState] = useState({ form: null, login: '', password: '', ind: 0 });

    loginForm = state.form;
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
            setState({ form: loginForm, login: loginForm.login, password: loginForm.password, ind: loginForm.stateind++ });
        }
    }

    useEffect(() => {
        loginForm.setupEvents();

        return () => {
            loginForm.clearEvents();
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

        loginForm.dataGetter = props.dataGetter;

        loginForm.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    tryLogin() {
        const loginForm = this;

        if (loginForm.login === 'test') {
            loginForm.afterLogin('test;test');
            return;
        }

        const params = [{ key: 'login', value: loginForm.login }, { key: 'password', value: loginForm.password }];

        loginForm.dataGetter.get({ url: 'system/login', params: params, type: 'text' }).then(
            (tokens) => {
                if (tokens) {
                    const arr = tokens.split(';');
                    if (arr.length !== 2) return;

                    loginForm.dataGetter.atoken = arr[0];
                    loginForm.dataGetter.rtoken = arr[1];

                    loginForm.afterLogin(tokens);
                }
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const loginForm = this;
        return (
            <>
                <div className="login-form" style={{ width: '400px' }}>
                    <span className="login-form-item">Login</span>
                    <input className="login-form-item form-control" onChange={(e) => loginForm.login = e.target.value} value={loginForm.login}></input>
                    <span className="login-form-item">Password</span>
                    <input className="login-form-item form-control" type="password" onChange={(e) => loginForm.password = e.target.value} value={loginForm.password}></input>
                    <button className="login-form-item btn btn-primary" onClick={(e) => loginForm.tryLogin()}>Login</button>
                </div>
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearEvents() {
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
