import { cache } from "react";

export class DataGetter {
    constructor(settings, onError) {
        const dg = this;

        dg.onError = onError;

        dg.APIurl = settings.APIurl;
    }

    refreshToken() {
        const dg = this;
        return new Promise(function (resolveRefresh, rejectRefresh) {
            if (!dg.rtoken) {
                resolveRefresh();
                return;
            }

            fetch(dg.APIurl + 'system/refreshToken', {
                mode: 'cors',
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([{ key: 'rtoken', value: dg.rtoken }])
            })
                .then((response) => {
                    return response.text();
                }).then(tokens => {
                    if (tokens) {
                        const arr = tokens.split(';');
                        if (arr.length !== 2) {
                            rejectRefresh();
                            return;
                        }

                        dg.atoken = arr[0];
                        dg.rtoken = arr[1];

                        resolveRefresh();
                    }
                    else {
                        rejectRefresh('Unable to refresh token');
                    }
                }).catch(ex => {
                    rejectRefresh(ex);
                });
        });
    }

    get = function (e) {
        const dg = this;

        return new Promise(function (resolve, reject) {
            let refresh = false;
            let errorText = '';

            function doRequest() {
                return new Promise(() => {
                    if (e.params) {
                        const item = e.params.find((item) => String(item.key) === 'atoken');

                        if (item) {
                            item.value = dg.atoken;
                        }
                        else {
                            e.params.push({ key: 'atoken', value: dg.atoken });
                        }
                    }

                    const fetchParams = {
                        mode: 'cors',
                        method: e.method || 'post',
                        headers: {},
                    };

                    if (e.method !== 'get') {
                        fetchParams.body = e.params ? JSON.stringify(e.params) : e.data || null;
                    }

                    if (e.contentType !== null) {
                        fetchParams.headers['Content-Type'] = e.contentType || 'application/json';
                    }

                    fetch(dg.APIurl + e.url, fetchParams)
                        .then((response) => {
                            if (response.status === 500 || !response.ok) {
                                if (!refresh && e.url !== 'system/login') {
                                    refresh = true;
                                    dg.refreshToken().then(() => {
                                        doRequest().then(res => {
                                            resolve(res);
                                        }).catch(error => {
                                            reject(error);
                                            if (dg.onError) {
                                                dg.onError(error);
                                            }
                                        });
                                    }).catch(error => {
                                        reject(error);
                                    });
                                }
                                else {
                                    response.text().then((txt) => {
                                        reject(txt);
                                    });
                                }
                                return;
                            }

                            if (e.type && e.type.toLowerCase() === 'text') {
                                resolve(response.text());
                            }
                            else {
                                resolve(response.json());
                            }
                        })
                        .catch(error => {
                            errorText = `Error getting ${e.url}: ${error}`;
                            if (dg.onError) {
                                dg.onError(error);
                            }
                            reject(errorText);
                        });
                },
                    (error) => {
                        reject(error);
                        if (dg.onError) {
                            dg.onError(error);
                        }

                    });
            }

            doRequest().then(res => {
                resolve(res);
            }).catch(error => {
                reject(error);
                if (dg.onError) {
                    dg.onError(error);
                }
            });
        })
    }
}