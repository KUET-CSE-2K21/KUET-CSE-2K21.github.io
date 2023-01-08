const KEY_SIZE = 2048


function waitinBanner(bool_) {
	arr = ['Cookin tomatoes...',
		'Cleanin the clutters...',
		'Lemme do my thinsss',
		'Would you wait please?',
		'Your PC is burnin...',
		'Patience is a virtue',
		'Brewing coffee..',
		'Watering the plants..'
	]
	var banner = document.querySelector("#banner")
	banner.innerHTML = arr[Math.floor(Math.random() * arr.length)]
	if (bool_) {
		banner.classList.remove('hidden')

	}
	else {
		banner.classList.add('hidden')

	}
}


function download(data, filename, type) {
	var file = new Blob([data], { type: type });
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}


const copy = async (dom) => {
	dom.select()
	dom.setSelectionRange(0, 99999);
	try {
		await navigator.clipboard.writeText(dom.innerHTML);
		SoftAlert('Content copied to clipboard');
	} catch (err) {
		SoftAlert('Failed to copy: ' + err);
	}
}

function SoftAlert(t) {
	swal(t)
	/*banner = document.querySelector("#banner")
	banner.innerHTML = t
	banner.classList.remove("hidden")
	setTimeout(() =>
		banner.addEventListener("click", () => {
			banner.classList.add('hidden')
			banner = document.querySelector("#banner")
			banner.removeEventListener('click')
		}, false), 100)
*/
}


async function sleep(t) {
	await new Promise(r => setTimeout(r, t))
}


async function generate(form_) {
	waitinBanner(true);
	let crypt = new JSEncrypt({ default_key_size: KEY_SIZE })
	let generate_form = document.getElementById("generator")
	let user1 = generate_form.elements["user1"].value
	let user2 = generate_form.elements["user2"].value
	let pass1 = generate_form.elements["pass1"].value
	let pass1v = generate_form.elements["pass1v"].value
	let pass2 = generate_form.elements["pass2"].value
	let pass2v = generate_form.elements["pass2"].value


	if (user1 == '') { SoftAlert(`user1 fill up username`); waitinBanner(false); return }
	if (user2 == '') { SoftAlert(`user2 fill up username`); waitinBanner(false); return }
	if (user1 == user2) { SoftAlert(`useranmes can't be same`); waitinBanner(false); return }
	if (pass1 == '') { SoftAlert(`${user1} fill up password`); waitinBanner(false); return }
	if (pass2 == '') { SoftAlert(`${user2} fill up password`); waitinBanner(false); return }
	if (pass1 != pass1v) { SoftAlert(`${user1}'s passwords do not match`); waitinBanner(false); return }
	if (pass2 != pass2v) { SoftAlert(`${user2}'s passwords do not match`); waitinBanner(false); return }



	await new Promise(r => setTimeout(r, 1500));

	let pubKey = await crypt.getPublicKey()
	let privKey = await crypt.getPrivateKey()
	let encrypted1 = btoa(CryptoJS.AES.encrypt(privKey, pass1).toString())
	let encrypted2 = btoa(CryptoJS.AES.encrypt(privKey, pass2).toString())
	let publicK = btoa(pubKey)

	download(encrypted1, `${user1}_priavte_key`)
	download(encrypted2, `${user2}_priavte_key`)
	download(publicK, `public_key`)

	await new Promise(r => setTimeout(r, 500));

	waitinBanner(false)
}

async function readFileAsText(file) {
	try {
		let result_base64 = await new Promise((resolve) => {
			let fileReader = new FileReader();
			fileReader.onload = (e) => resolve(fileReader.result);
			fileReader.readAsText(file);
		});
		return result_base64;
	} catch (e) {
		console.log(e)
		SoftAlert("Malformed File")
		return false
	}
}

function base64encode(plaintext) {
	let ret
	try {
		ret = btoa(plaintext)
		return ret
	} catch (e) {
		SoftAlert("Failed ATOB")
		return false
	}
}

function base64decode(base64data) {
	var ret

	try {
		ret = atob(base64data)
		return ret
	} catch (e) {
		SoftAlert("Failed ATOB")
		return false
	}
}

function getPrivKey(base64data, key) {
	let privK
	let privKe = base64decode(base64data)
	try {
		privK = CryptoJS.AES.decrypt(privKe, key).toString(CryptoJS.enc.Utf8)
	} catch (e) {
		console.log(e)
		SoftAlert("Wrong password")
		return false
	}
	return privK
}

async function test(form_) {
	waitinBanner(true)
	var privKe, privK, pubK
	try {
		privKe = base64decode(await readFileAsText(form_.elements["privk"].files[0]))
		pubK = base64decode(await readFileAsText(form_.elements["pubk"].files[0]))
	} catch (e) {
		console.log(e)
		SoftAlert("malformed file")
	}
	try {
		privK = await CryptoJS.AES.decrypt(privKe, form_.elements["pass"].value).toString(CryptoJS.enc.Utf8)
	} catch (e) {
		console.log(e)
		SoftAlert("Wrong password")
	}
	let crypt1 = new JSEncrypt()
	crypt1.setPublicKey(pubK)
	let tester = `
	O@BO"Upoqwf	ljn2'IP4
	[/SD[JWFQJWFW'

	[ovwepowepo[f

		{OJFEs
	`
	let testE = crypt1.encrypt(tester)
	let crypt2 = new JSEncrypt()
	crypt2.setPrivateKey(privK)
	if (crypt2.decrypt(testE) === tester) SoftAlert("OK")

	waitinBanner(false)
}

async function decrypt(form_) {
	waitinBanner(true)
	await sleep(100)
	let file = form_.elements["privk"].files[0]
	let pass = form_.elements["pass"].value
	let content = form_.elements["content"].value
	let privK = getPrivKey(await readFileAsText(file), pass)
	let crypt = new JSEncrypt()
	crypt.setPrivateKey(privK)
	let data = crypt.decrypt(content) || 'Decryption failed'
	form_.elements["contentD"].innerHTML = data
	waitinBanner(false)
}

async function encrypt(form_) {
	waitinBanner(true)
	await sleep(100)
	let pubK = form_.elements["pubk"]
	let content = form_.elements["content"].value
	let crypt = new JSEncrypt()
	crypt.setPublicKey(base64decode(await readFileAsText(pubK.files[0])))
	let data = crypt.encrypt(content)
	form_.elements["contentE"].innerHTML = data
	waitinBanner(false)
}

window.onload = () => {
	waitinBanner(false)
}