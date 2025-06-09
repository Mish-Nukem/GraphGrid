export class DataGetter {
    constructor(settings, atoken, rtoken) {
        const dg = this;

        dg.atoken = atoken;
        dg.rtoken = rtoken;

        dg.APIurl = settings.APIurl;
    }

    get = function (e) {
        const dg = this;

        return new Promise(function (resolve, reject) {
            let refresh = false;
            let isError = false;
            let errorText = '';


            function refreshToken() {
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

            function doRequest() {
                return new Promise(function (resolveRequest, rejectRequest) {
                    fetch(dg.APIurl + e.url, {
                        mode: 'cors',
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(e.params)
                    })
                        .then((response) => {
                            if (response.status === 500 || !response.ok) {
                                if (!refresh) {
                                    refresh = true;
                                    refreshToken().then(() => {
                                        doRequest().then((res) => resolve(res));
                                    }).catch(error => {
                                        reject(error);
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