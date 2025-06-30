export class DataGetter {
    constructor(settings, /*atoken, rtoken, */onError) {
        const dg = this;

        //dg.atoken = atoken;
        //dg.rtoken = rtoken;
        dg.onError = onError;

        dg.APIurl = settings.APIurl;
    }

    refreshToken() {
        const dg = this;
        return new Promise(function (resolveRefresh, rejectRefresh) {
            if (!dg.rtoken) {
                //rejectRefresh();
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
                });
        });
    }

    get = function (e) {
        const dg = this;

        return new Promise(function (resolve, reject) {
            let refresh = false;
            let isError = false;
            let errorText = '';

            function doRequest() {
                return new Promise(function (/*resolveRequest, rejectRequest*/) {
                    try {
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
                            /*headers: { 'Content-Type': e.contentType || 'application/json' },*/
                            body: e.params ? JSON.stringify(e.params) : e.data || null
                        };

                        if (e.contentType !== null) {
                            fetchParams.headers['Content-Type'] = e.contentType || 'application/json';
                        }

                        fetch(dg.APIurl + e.url, fetchParams)
                            .then((response) => {
                                if (response.status === 500 || !response.ok) {
                                    if (!refresh) {
                                        refresh = true;
                                        dg.refreshToken().then(() => {
                                            doRequest().then((res) => resolve(res));
                                        }).catch(error => {
                                            reject(error);
                                            if (dg.onError) {
                                                dg.onError(error);
                                            }
                                        });
                                    }
                                    else {
                                        reject(response.statusText);
                                    }
                                    return;
                                }

                                if (e.type && e.type.toLowerCase() === 'text') {
                                    resolve(response.text());
                                }
                                else {
                                    resolve(response.json());
                                    //	const js = response.json();
                                    //	resolve(JSON.parse(js));
                                }
                            })
                            .catch(error => {
                                isError = true;
                                errorText = `Error getting ${e.url}: ${error}`;
                                reject(errorText);
                            });
                    }
                    finally { /**/ }
                });
            }

            try {
                doRequest().then((res) => resolve(res));
            }
            finally {
                if (isError && errorText) {
                    alert(errorText);
                }
            }
        })
    }
}