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

			fetch(dg.APIurl + e.url, {
				mode: 'cors',
				method: 'post',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(e.params)
			})
				.then((response) => {
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
					reject(Error(`Error getting ${e.url}: ${error}`));
				});
		})
	}
}