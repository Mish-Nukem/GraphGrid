import { useState, useEffect } from 'react';
import { BaseComponent } from '../../Grid/Base';
import { GLObject } from '../../Grid/GLObject';
import { ClipLoader } from 'react-spinners';
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

        loginForm.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    tryLogin() {
        const loginForm = this;

        const params = [{ key: 'login', value: loginForm.login }, { key: 'password', value: loginForm.password }];

        GLObject.dataGetter.get({ url: 'system/login', params: params, type: 'text' }).then(
            (tokens) => {
                if (tokens) {
                    const arr = tokens.split(';');
                    if (arr.length !== 2) return;

                    GLObject.dataGetter.atoken = arr[0];
                    GLObject.dataGetter.rtoken = arr[1];

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
                    <span className="login-form-item">Server Type</span>
                    <select
                        onChange={(e) => {
                            const serverType = e.target.selectedOptions.length > 0 && e.target.selectedOptions[0].value === 'MSSQL' ? 1 : 0;

                            GLObject.changeAPIurl(serverType);

                            loginForm.refreshState();
                        }}
                        value={GLObject.serverType === 1 ? "MSSQL" : "PostgreSQL"}
                    >
                        <option >PostgreSQL</option>
                        <option >MSSQL</option>
                    </select>
                    <span className="login-form-item">Login</span>
                    <input className="login-form-item form-control" onChange={(e) => loginForm.login = e.target.value} value={loginForm.login}></input>
                    <span className="login-form-item">Password</span>
                    <input className="login-form-item form-control" type="password" onChange={(e) => loginForm.password = e.target.value} value={loginForm.password}></input>
                    {
                        loginForm.isLogging ?
                            <div className='grid-loader'>
                                <ClipLoader
                                    size={15}
                                />
                            </div>
                            :
                            <button className="login-form-item btn btn-primary" onClick={() => {
                                loginForm.isLogging = true;
                                loginForm.refreshState();
                                loginForm.tryLogin();
                            }}>Login</button>
                    }
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
