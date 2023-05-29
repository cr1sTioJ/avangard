var umodal;
var activeNavLink;
var currentDate;
var session = {};
var contextmenu;

var rentContextMenu = [
	ContextItem('Проблема решена', function(event){
		var id = event.target.parentNode.getAttribute('data-rentid');
		RdPostRequest('./scripts/php/cancelRentProblem.php', {'id': id}, function(data){
			if (data['status'] == 'ok') {
				if (event.target.parentNode.classList.contains('has_problem')) event.target.parentNode.classList.remove('has_problem');
			}
			notification('Информация', data['msg']);
		});
	}),
	ContextItem('Отменить заказ', function(event){
		var id = event.target.parentNode.getAttribute('data-rentid');
		RdPostRequest('./scripts/php/cancelRent.php', {'id': id}, function(data){
			if (data['status'] == 'ok') {
				if (event.target.parentNode.classList.contains('has_problem')) event.target.parentNode.classList.remove('has_problem');
				event.target.parentNode.classList.add('canceled');
			}
			notification('Информация', data['msg']);
		});
	})
]

var serialContextMenu = [
	ContextItem("Изменить состояние", function(event){
		var serial = event.target.innerHTML;
		RdPostRequest('./scripts/php/toggleState.php', {'id': serial, 'whom': 'boat'}, function(data){
			if (data['status'] == 'ok') {
				notification('Результат', 'Успешно!');
				if (event.target.classList.contains('inactive')){ 
					event.target.classList.remove('inactive')
				}
				else {
					event.target.classList.add('inactive')
				}
			}
			else {
				notification('Ошибка', data['msg']);
			}
		});
	})
];

var captainContextMenu = [
	ContextItem("Изменить состояние", function(event){
		var id = event.target.parentNode.getAttribute('data-captainid');
		RdPostRequest('./scripts/php/toggleState.php', {'id': id, 'whom': 'captain'}, function(data){
			if (data['status'] == 'ok') {
				notification('Результат', 'Успешно!');
				if (event.target.parentNode.classList.contains('inactive')){ 
					event.target.parentNode.classList.remove('inactive')
				}
				else {
					event.target.parentNode.classList.add('inactive')
				}
			}
			else {
				notification('Ошибка', data['msg']);
			}
		});
	})
];

var claimContextMenu = [
	ContextItem("Удалить файл", function(event){
		var filename = event.target.innerHTML;
		RdPostRequest('./scripts/php/deleteClaim.php', {'file': filename}, function(data){
			if (data['status'] == 'ok'){
				var files = umodal.ufooter.querySelector('div.claim-files');
				files.removeChild(event.target.parentNode);
			}
			notification('Информация', data['msg']);
		});
	})
];

var discountContextMenu = [
	ContextItem("Удалить скидку", function(event){
		var discountsContainer = umodal.ubody.querySelector('div.discount-inputs-container');
		discountsContainer.removeChild(event.target);
	})
];

var contractContextMenu = [
	ContextItem("Скачать договор", (event) => {
		let row;
		if (event.target.className != 'rents-list-row') row = event.target.parentNode;
		else row = event.tar
		let rentId = row.getAttribute('data-rentid');
		window.location.href = `http://cr1stioj.rustdev.ru/avangard/api/getContract.php?id=${rentId}`;
	})
];

// Nowhere without them

function Create(type, cl, parent, html = null, attributes = null, prepend = false) {
	var elem = document.createElement(type);
	if (cl != null) {
		elem.className = cl;
	}
	if (html != null) {
		elem.innerHTML = html;
	}
	if (parent != null) {
		if (prepend) parent.prepend(elem)
		else parent.appendChild(elem);
	}
	if (attributes != null){
		for (var a in attributes) {
			elem.setAttribute(a, attributes[a]);
		}
	}
	return elem;
}

function closeUmodal() {
	document.body.style.overflow = "auto";
	document.body.removeChild(umodal);
}

function uModal(title, ubody = true, ufooter = true, uclose = true, closeByClick = false) {
	document.body.style.overflow = "hidden";

	if (umodal != null && umodal.parentNode != null) {
		umodal.parentNode.removeChild(umodal);
	}

	umodal = Create("div", "umodal", document.body);

	umodal.onclick = function (event) {
		if (event.target == this && closeByClick) {
			document.body.style.overflow = "auto";
			document.body.removeChild(umodal);
		}
	}
	umodal.uframe = Create("div", "umodal-frame box", umodal);
	if (title != null) {
		umodal.utop = Create("div", "header", umodal.uframe, title);
		if (uclose) {
			umodal.utop.uclose = Create("div", "uclose", umodal.utop, '<i class="fa fa-times" aria-hidden="true"></i>');
			umodal.utop.uclose.onclick = function () {
				document.body.style.overflow = "auto";
				document.body.removeChild(umodal);
			}
		}
	}
	if (ubody) { umodal.ubody = Create("div", "body", umodal.uframe); }
	if (ufooter) { umodal.ufooter = Create("div", "footer", umodal.uframe); }

	umodal.setIcon = function (icon) {
		if (umodal.utop != null) {
			umodal.utop.className = "header header-icon";
			umodal.utop.style.backgroundImage = "url('" + icon + "')";
		}
	}

	if (!ufooter) {
		umodal.ubody.style.borderRadius = "0 0 6px 6px";
	}
}

function RdGetRequest(dataUrl, onLoad = null, onProgress = null, onError = null) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4) {
			if (onLoad != null && xmlHttp.status == 200) {onLoad(JSON.parse(xmlHttp.responseText)); }
			else if (onError != null && xmlHttp.status != 200) { onError(xmlHttp.status); }
		}
	}
	xmlHttp.onerror = function (event) { if (onError != null) { onError(xmlHttp.status); } }
	xmlHttp.onprogress = function (event) { if (onProgress != null) { onProgress(event.loaded, event.total); } }
	xmlHttp.open("GET", dataUrl, true);
	xmlHttp.send(null);
}

function RdPostRequest(dataUrl, data, onLoad = null, onProgress = null, onError = null) {
	var xmlHttp = new XMLHttpRequest();
	var json = JSON.stringify(data);
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4) {
			if(onLoad != null && xmlHttp.status == 200) { onLoad(JSON.parse(xmlHttp.responseText)); } else if(onError != null && xmlHttp.status != 200) { onError(xmlHttp.status); }
		}
    }
	xmlHttp.onerror = function(event) { if(onError != null) { onError(xmlHttp.status); } }
	xmlHttp.onprogress = function(event) { if(onProgress != null) { onProgress(event.loaded, event.total); } }
    xmlHttp.open("POST", dataUrl, true);
	xmlHttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xmlHttp.send(json);
}

// uModal windows

function openLoginWindow() {
	uModal("Авторизация", true, false, true);

	var inputs = [
		{ 'type': 'email', 'name': 'email', 'placeholder': 'Эл. почта', 'required': '1' },
		{ 'type': 'password', 'name': 'password', 'placeholder': 'Пароль', 'required': '1' }
	];

	var ubody = umodal.ubody;
	var form = Create("form", null, ubody);
	form.setAttribute('method', 'post');
	form.setAttribute('action', '../avangard/scripts/php/login.php');
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var input = Create('input', null, form);
		var attributes = inputs[i];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var buttons = Create('div', 'buttons', form);
	var a = Create('a', null, buttons, 'Создать аккаунт');
	a.onclick = openRegWindow;
	var submit = Create('input', null, buttons);
	submit.setAttribute('type', 'submit');
	submit.setAttribute('value', 'Вход');

	formHandler('./scripts/php/login.php', function (data) {
		if (data['status'] == 'ok'){
			notification('Авторизация', data['msg']);
			closeUmodal();
			session['user_id'] = data['user_id'];
			session['first_name'] = data['first_name'];
			parseSession();
			window.location.reload();
		}
		else {
			notification('Авторизация', data['msg']);
			var wrongInput = umodal.querySelectorAll(`input[name="${data['name']}"]`)[0];
			setTimeout(() => wrongInput.classList.remove('deny'), 3000);
			wrongInput.classList.add('deny');
		}
	});
}

function openRegWindow() {
	uModal("Регистрация", true, false, true);

	var inputs = [
		{ 'type': 'text', 'name': 'last_name', 'placeholder': 'Фамилия', 'required': '1' },
		{ 'type': 'text', 'name': 'first_name', 'placeholder': 'Имя', 'required': '1' },
		{ 'type': 'text', 'name': 'middle_name', 'placeholder': 'Отчество (если имеется)'},
		{ 'type': 'date', 'name': 'dob', 'placeholder': 'Дата рождения', 'required': '1', 'max': currentDate },
		{ 'type': 'text', 'name': 'passport', 'placeholder': 'Серия и номер паспорта', 'class': 'passport-mask', 'required': '1' },
		{ 'type': 'text', 'name': 'reg_place', 'placeholder': 'Место регистрации', 'required': '1' },
		{ 'type': 'tel', 'name': 'telephone', 'placeholder': 'Телефон', 'required': '1' },
		{ 'type': 'email', 'name': 'email', 'placeholder': 'Эл. почта', 'required': '1' },
		{ 'type': 'password', 'name': 'password', 'placeholder': 'Пароль', 'required': '1' },
		{ 'type': 'password', 'name': 'password_conf', 'placeholder': 'Подтверждение пароля', 'required': '1' },

	];

	var ubody = umodal.ubody;

	var form = Create('form', null, ubody);
	form.setAttribute('method', 'post');
	form.setAttribute('id', '_form')
	form.setAttribute('action', '../avangard/scripts/php/reg.php');

	for (var i in inputs) {
		var input = Create('input', null, form);
		var attributes = inputs[i];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var buttons = Create('div', 'buttons', form);
	var submit = Create('input', null, buttons);
	submit.setAttribute('type', 'submit');
	submit.setAttribute('value', 'Зарегистрироваться');

	phoneInputValidate();
	inputValidate();
	formHandler('./scripts/php/reg.php', function(data){
		if (data['status'] == 'ok'){
			notification('Регистрация', data['msg']);
			closeUmodal();
		}
		else {
			notification('Регистрация', data['msg']);
			var wrongInput = umodal.querySelectorAll(`input[name="${data['name']}"]`)[0];
			setTimeout(() => wrongInput.classList.remove('deny'), 3000);
			wrongInput.classList.add('deny');
		}
	});
}

function openAddingBoatWindow() {
	uModal("Новое судно", true, false, true);

	var inputs = [
		{ 'title': 'Название', 'attributes': { 'name': 'name', 'type': 'text', 'required': '1' } },
		{ 'title': 'Стоимость', 'attributes': { 'name': 'cost', 'type': 'number', 'step': 1, 'required': '1' } },
		{ 'title': 'Длина', 'attributes': { 'name': 'length', 'type': 'number', 'step': 0.01, 'required': '1' } },
		{ 'title': 'Скорость', 'attributes': { 'name': 'speed', 'type': 'number', 'step': 0.01, 'required': '1' } },
		{ 'title': 'Вместимость', 'attributes': { 'name': 'capacity', 'type': 'number', 'step': 1, 'required': '1' } },
		{ 'title': 'Количество кают', 'attributes': { 'name': 'cabins', 'type': 'number', 'step': 1, 'required': '1' } },
		{ 'title': 'Запас воды', 'attributes': { 'name': 'water', 'type': 'number', 'step': 0.01, 'required': '1' } },
		{ 'title': 'Запас топлива', 'attributes': { 'name': 'fuel', 'type': 'number', 'step': 0.01, 'required': '1' } },
		{ 'title': 'Осадка', 'attributes': { 'name': 'draught', 'type': 'number', 'step': 0.01, 'required': '1' } },
	];

	var ubody = umodal.ubody;

	var form = Create("form", null, ubody);
	form.setAttribute("method", "post");
	form.setAttribute("action", "./scripts/php/addBoat.php");
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var inputInfo = Create("div", "input-info", form, inputs[i]['title']);
		var input = Create("input", null, inputInfo);

		var attributes = inputs[i]['attributes'];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a])
		}
	}

	var inputInfo = Create("div", "input-info", form, "Фотография");
	var label = Create("label", "input-file", inputInfo);
	var input = Create("input", null, label);
	input.setAttribute('required', '1');
	input.setAttribute('type', 'file');
	input.setAttribute('name', 'file');
	input.setAttribute('accept', 'image/png, image/jpeg');
	input.setAttribute('id', 'js-file');

	Create("span", "input-file-btn", label, "Выберите файл");
	Create("span", "input-file-text", label, "Здесь будет выведено название файла");
	var submitButton = Create("input", null, form);
	submitButton.setAttribute("type", "submit");
	submitButton.setAttribute("value", "Добавить");


	configureFileInput();
	formHandler('./scripts/php/addBoat.php', function(data){
		if (data['status'] == 'ok'){
			closeUmodal();
			$(activeNavLink).click();
		}
		notification('Информация', data['msg']);
	});
}


function openCaptainInfoWindow(id) {
	RdGetRequest(`./api/getCaptains.php?id=${id}`, function (captain) {
		var fullname = captain['last_name'] + " " + captain['first_name'] + " " + captain['middle_name'];
		uModal(fullname, true, false, true, true);
		var rows = [
			{ "title": "Дата рождения", "value": normalizeDate(captain['dob']) },
			{ "title": "Серия и номер паспорта", "value": captain['passport'] },
			{ "title": "Телефон", "value": captain['telephone'] },
			{ "title": "Электронная почта", "value": captain['email'] },
			{ "title": "Водительские права (номер)", "value": captain['license_num'] },
			{ "title": "Дата получения водит. прав", "value": normalizeDate(captain['license_date']) },
			{ "title": "Плата за услуги", "value": normalizeCost(captain['cost']) },
			{ "title": "Место регистрации", "value": captain['reg_place'] },
		];
		var content = "";

		for (var r in rows) {
			var row = rows[r];
			content += `
				<div class="personal-data">
					<div class="personal-data-title">${row['title']}</div>
					<div class="personal-data-value">${row['value']}</div>
				</div>
			`;
		}
		umodal.ubody.innerHTML = content;
	});
}

function openClientInfoWindow(id) {
	RdGetRequest(`./api/getClients.php?id=${id}`, function (client) {
		var fullname = client['last_name'] + " " + client['first_name'] + " " + (client['middle_name'] ? client['middle_name']: '');
		uModal(fullname, true, false, true, true);
		var rows = [
			{ "title": "Дата рождения", "value": normalizeDate(client['dob']) },
			{ "title": "Серия и номер паспорта", "value": client['passport'] },
			{ "title": "Телефон", "value": client['telephone'] },
			{ "title": "Электронная почта", "value": client['email'] },
			{ "title": "Количество заказов", "value": client['orders'] },
			{ "title": "Место регистрации", "value": client['reg_place'] },
		];

		let body = umodal.ubody;

		for (let r in rows) {
			let row = rows[r];
			let personalData = Create('div', 'personal-data', body);
			Create('div', 'personal-data-title', personalData, row['title']);
			Create('div', 'personal-data-value', personalData, row['value']);
		}
	});
}

async function openBoatInfoEditWindow(name) {
	var is_admin = await isAdmin();
	if (!is_admin){
		notification("Внимание", "Доступ запрещен, т.к. Вы не администратор");
		return;
	}

	RdGetRequest(`./api/getBoats.php?name=${name}`, function (boat) {
		console.log(boat);
		uModal(boat.name, true, true, true);
		var inputs = [
			{ 'title': 'Название', 'attributes': { 'name': 'name', 'type': 'text', 'value': boat.name } },
			{ 'title': 'Стоимость', 'attributes': { 'name': 'cost', 'type': 'number', 'step': 1, 'value': boat.cost } },
			{ 'title': 'Длина', 'attributes': { 'name': 'length', 'type': 'number', 'step': 0.01, 'value': boat.length } },
			{ 'title': 'Скорость', 'attributes': { 'name': 'speed', 'type': 'number', 'step': 0.01, 'value': boat.speed } },
			{ 'title': 'Вместимость', 'attributes': { 'name': 'capacity', 'type': 'number', 'step': 1, 'value': boat.capacity } },
			{ 'title': 'Количество кают', 'attributes': { 'name': 'cabins', 'type': 'number', 'step': 1, 'value': boat.cabins } },
			{ 'title': 'Запас воды', 'attributes': { 'name': 'water', 'type': 'number', 'step': 0.01, 'value': boat.water } },
			{ 'title': 'Запас топлива', 'attributes': { 'name': 'fuel', 'type': 'number', 'step': 0.01, 'value': boat.fuel } },
			{ 'title': 'Осадка', 'attributes': { 'name': 'draught', 'type': 'number', 'step': 0.01, 'value': boat.draught } },
		];

		var ubody = umodal.ubody;
		var form = Create('form', null, ubody);
		form.setAttribute('method', 'post');
		form.setAttribute("action", "./scripts/php/editBoat.php");
		form.setAttribute('id', '_form');

		var idInput = Create('input', null, form);
		idInput.setAttribute('style', 'display: none');
		idInput.setAttribute('readonly', 1);
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', boat.id);

		for (var i in inputs) {
			var inputInfo = Create('div', 'input-info', form, inputs[i]['title']);
			var input = Create('input', null, inputInfo);
			var attributes = inputs[i]['attributes'];

			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}

		var inputInfo = Create('div', 'input-info', form);
		var label = Create('label', 'input-file', inputInfo);
		var input = Create('input', null, label);
		input.setAttribute('type', 'file');
		input.setAttribute('name', 'file');
		input.setAttribute('accept', 'image/png, image/jpeg');
		input.setAttribute('id', 'js-file');
		Create('span', 'input-file-btn', label, 'Выберите файл');
		Create('span', 'input-file-text', label, boat.img);

		var imgName = Create('input', null, form);
		imgName.setAttribute('name', 'img');
		imgName.setAttribute('value', boat.img);
		imgName.setAttribute('hidden', 1);
		var submit = Create('input', null, form);
		submit.setAttribute('type', 'submit');
		submit.setAttribute('value', 'Сохранить');

		var footer = umodal.ufooter;

		var currentList = Create('div', null, footer, 'Текущий список:');
		currentList.setAttribute('style', "font-size: 20px; margin-bottom: 5px");
		var serials = Create('div', 'boat-serials', footer);

		for (var i = 0; i < boat.serials.length; i++) {
			var boatSerial = Create('div', 'boat-serial', serials, boat.serials[i]['serial']);

			if (boat.serials[i]['active'] == 0) {
				boatSerial.classList.add('inactive');
			}

			boatSerial.contextItems = serialContextMenu;
		}

		var serialsInput = Create('div', 'boat-serials-input', footer, `
			<form method="post" action="./scripts/php/addSerial.php" id="addserial-form">
				<input name="id" type="text" style="display: none" readonly value="${boat.id}">
				<input name="serial" type="text" required placeholder="Серийный номер" class="serial-mask">
				<input type="submit" value="+">
			</form>
		`);

		configureFileInput();
		inputValidate();

		formHandler('./scripts/php/addSerial.php', function(data) {
			if (data['status'] == 'ok') {
				notification('Результат', data['msg']);
				var boatSerial = Create('div', 'boat-serial', serials, data['serial']);
				boatSerial.contextItems = serialContextMenu;
				
				var inputSerial = footer.querySelector('input[name="serial"]');
				inputSerial.value = '';
			}
			else {
				notification('Результат', data['msg']);
			}
		}, 'addserial-form');

		formHandler('./scripts/php/editBoat.php', function(data){
			if (data['status'] == 'ok') {
				closeUmodal();
				$(activeNavLink).click();
				notification('Результат', data['msg'], 1000);
			}
			else {
				notification('Результат', data['msg']);
			}
		});
	});
}

function openAddingCaptainWindow() {
	uModal('Новый капитан', true, false, true);

	var inputs = [
		{ 'title': 'Фамилия', 'attributes': { 'name': 'last_name', 'type': 'text', 'required': '1' } },
		{ 'title': 'Имя', 'attributes': { 'name': 'first_name', 'type': 'text', 'required': '1' } },
		{ 'title': 'Отчество', 'attributes': { 'name': 'middle_name', 'type': 'text' } },
		{ 'title': 'Дата рождения', 'attributes': { 'name': 'dob', 'type': 'date', 'required': '1' } },
		{ 'title': 'Серия и номер паспорта', 'attributes': { 'name': 'passport', 'class': "passport-mask", 'type': 'text', 'required': '1' } },
		{ 'title': 'Место регистрации', 'attributes': { 'name': 'reg_place', 'type': 'text', 'required': '1' } },
		{ 'title': 'Телефон', 'attributes': { 'name': 'telephone', 'type': 'tel', 'required': '1' } },
		{ 'title': 'Электронная почта', 'attributes': { 'name': 'email', 'type': 'email', 'required': '1' } },
		{ 'title': 'Водительские права (номер)', 'attributes': { 'class': 'license-num-mask', 'name': 'license_num', 'type': 'text', 'required': '1' } },
		{ 'title': 'Дата получения водит. прав', 'attributes': { 'name': 'license_date', 'type': 'date', 'required': '1' } },
		{ 'title': 'Плата за услуги', 'attributes': { 'name': 'cost', 'type': 'number', 'required': '1' } },
	];

	var ubody = umodal.ubody;

	var form = Create('form', null, ubody);
	form.setAttribute('method', 'post');
	form.setAttribute('action', './scripts/php/addCaptain.php');
	form.setAttribute('id', '_form');

	for (var i in inputs) {
		var inputInfo = Create('div', 'input-info', form, inputs[i]['title']);
		var input = Create('input', null, inputInfo);
		var attributes = inputs[i]['attributes'];

		for (var a in attributes) {
			input.setAttribute(a, attributes[a]);
		}
	}

	var submit = Create('input', null, form);
	submit.setAttribute('type', 'submit');
	submit.setAttribute('value', 'Добавить');

	phoneInputValidate();
	inputValidate();

	formHandler('./scripts/php/addCaptain.php', function(data){
		if (data['status'] == 'ok'){
			$(activeNavLink).click();
			closeUmodal();
		}
		notification('Информация', data['msg']);
	});
}

function openCaptainInfoEditWindow(id) {
	RdGetRequest(`./api/getCaptains.php?id=${id}`, function (captain) {
		var fullname = captain['last_name'] + ' ' + captain['first_name'] + ' ' + captain['middle_name'];
		uModal(fullname, true, false, true);

		var inputs = [
			{ 'title': 'Фамилия', 'attributes': { 'name': 'last_name', 'type': 'text', 'value': captain['last_name'], 'required': 1 }},
			{ 'title': 'Имя', 'attributes': { 'name': 'first_name', 'type': 'text', 'value': captain['first_name'], 'required': 1 } },
			{ 'title': 'Отчество', 'attributes': { 'name': 'middle_name', 'type': 'text', 'value': captain['middle_name'] } },
			{ 'title': 'Дата рождения', 'attributes': { 'name': 'dob', 'type': 'date', 'value': captain['dob'], 'required': 1 } },
			{ 'title': 'Серия и номер паспорта', 'attributes': { 'name': 'passport', 'class': "passport-mask", 'type': 'text', 'value': captain['passport'], 'required': 1 } },
			{ 'title': 'Место регистрации', 'attributes': { 'name': 'reg_place', 'type': 'text', 'value': captain['reg_place'], 'required': 1 } },
			{ 'title': 'Телефон', 'attributes': { 'name': 'telephone', 'type': 'tel', 'value': captain['telephone'], 'required': 1 } },
			{ 'title': 'Электронная почта', 'attributes': { 'name': 'email', 'type': 'email', 'value': captain['email'], 'required': 1 } },
			{ 'title': 'Водительские права (номер)', 'attributes': { 'name': 'license_num', 'class': "license-num-mask", 'type': 'text', 'value': captain['license_num'], 'required': 1 } },
			{ 'title': 'Дата получения водит. прав', 'attributes': { 'name': 'license_date', 'type': 'date', 'value': captain['license_date'], 'required': 1 } },
			{ 'title': 'Плата за услуги', 'attributes': { 'name': 'cost', 'type': 'number', 'value': captain['cost'], 'required': 1 } }
		];

		var ubody = umodal.ubody;
		
		var form = Create('form', null, ubody);
		form.setAttribute('method', 'post');
		form.setAttribute('action', './scripts/php/editCaptain.php');
		form.setAttribute('id', '_form');

		var idInput = Create('input', null, form);
		idInput.setAttribute('name', 'id');
		idInput.setAttribute('value', id);
		idInput.setAttribute('style', 'display: none');
		idInput.setAttribute('readonly', 1);

		for (var i in inputs) {
			var inputInfo = Create('div', 'input-info', form, inputs[i]['title']);
			var input = Create('input', null, inputInfo);
			var attributes = inputs[i]['attributes'];

			for (var a in attributes) {
				input.setAttribute(a, attributes[a]);
			}
		}

		var submit = Create('input', null, form);
		submit.setAttribute('type', 'submit');
		submit.setAttribute('value', 'Сохранить');

		phoneInputValidate();
		inputValidate();

		formHandler('./scripts/php/editCaptain.php', function(data){
			if (data['status'] == 'ok'){
				notification('Информация', data['msg']);
				$(activeNavLink).click();
				closeUmodal();
			}
			else {
				notification('Информация', data['msg']);
			}
		});
	});
}

function openRentInfoWindow(id, isCanceled) {
	RdGetRequest(`./api/getRents.php?id=${id}`, function (rent) {
		var modalName = isCanceled ? 'ЗАКАЗ ОТМЕНЕН ' + rent['cancel_time'] : "Информация об аренде от " + normalizeDate(rent['date']);
		uModal(modalName, true, !isCanceled, true, true);

		var rows = [
			{ "title": "Идентификационный номер судна", "value": rent['boat'] },
			{ "title": "Название судна", "value": rent['name'] },
			{ "title": "Клиент", "value": rent['client'] },
			{ "title": "Капитан", "value": rent['captain'] },
			{ "title": "Дата заключения договора", "value": normalizeDate(rent['contract']) },
			{ "title": "Дата взятия в аренду", "value": normalizeDate(rent['date']) },
			{ "title": "Количество дней аренды", "value": rent['days'] },
			{ "title": "Итоговая стоимость", "value": normalizeCost(rent['total_cost']) }
		];

		var ubody = umodal.ubody;
		var hasProblem = (rent['has_problem'] === '1');
		if (hasProblem && !isCanceled) {
			Create('div', null, ubody, 'Внимание! С заказом возникла проблема.<br>Проверьте доступность судна и капитана на выбранные пользователем дни', {
				'style': 'margin-bottom: 5px; color: red'
			});
		}
		for (var r in rows){
			var row = rows[r];
			var personalData = Create('div', 'personal-data', ubody);
			Create('div', 'personal-data-title', personalData, row['title']);
			Create('div', 'personal-data-value', personalData, row['value']);
		}

		Create('button', 'contract-download', ubody, 'Скачать договор аренды').onclick = () => {
			window.location.href = `http://cr1stioj.rustdev.ru/avangard/api/getContract.php?id=${id}`;
		};

		var footer = umodal.ufooter;
		Create('div', 'claims-container', footer, 'Список претензий');
		var claims = rent['claims'];
		var files = Create('div', 'claim-files', footer);
		for (var i = 0; i < claims.length; i++) {
			var claim = claims[i];
			var boatID = Create('div', 'boat-id', files);
			var a = Create('a', null, boatID, claim['file'], {
				'href': 'claims/' + claim['file'],
				'download': claim['file']
			});
			a.contextItems = claimContextMenu;
		}
		var claimInput = Create('div', 'claim-input', footer);

		var form = Create('form', null, claimInput, null, {
			'method': 'POST',
			'action': 'scripts/php/addClaim.php',
			'id': 'claim-upload'
		});
		Create('input', null, form, null, {
			'name': 'rent',
			'type': 'hidden',
			'readonly': 1,
			'value': id
		});
		Create('input', null, form, null, {
			'type': 'submit',
			'value': 'Загрузить'
		});
		var label = Create('label', 'input-file', form);
		Create('input', null, label, null, {
			'name': 'file',
			'type': 'file',
			'accept': '.pdf, .txt, .docx, .doc',
			'id': 'js-file',
			'required': 1
		});
		Create('span', 'input-file-btn', label, 'Выберите файл');
		Create('span', 'input-file-text', label, 'Здесь будет выведено название файла');

		configureFileInput();

		formHandler('scripts/php/addClaim.php', function(data){
			if (data['status'] == 'ok'){
				closeUmodal();
				$(activeNavLink).click();
			}
			notification('Информация', data['msg']);
		}, 'claim-upload');
	});
}

async function openDiscountsEditWindow() {
	var is_admin = await isAdmin();
	if (!is_admin) {
		notification("Внимание", "Доступ запрещен, т.к. Вы не администратор");
		return; 
	}

	RdGetRequest("./api/getDiscounts.php", function (discounts) {
		uModal("Скидки", true, false, true);

		var ubody = umodal.ubody;
		var container = Create('div', 'discounts-container', ubody);
		var info = Create('div', 'discounts-info', container);
		Create('div', 'discounts-info orders', info, 'Количество заказов');
		Create('div', 'discounts-info value', info, 'Скидка (в %)');

		var form = Create('form', null, container, null, {
			'method': 'post',
			'action': 'scripts/php/editDiscounts.php',
			'id': 'discounts-editor'
		});

		var formInputs = Create('div', 'discount-inputs-container', form);

		for (var d in discounts) {
			var discount = discounts[d];
			var row = Create('div', 'discount-input-row', formInputs);
			row.contextItems = discountContextMenu;
			Create('input', 'discount-input-orders', row, null, {
				'type': 'number',
				'min': 0,
				'name': 'orders[]',
				'required': '1',
				'value': discount['orders']
			});
			Create('input', 'discount-input-value', row, null, {
				'type': 'number',
				'min': 0,
				'max': 100,
				'name': 'value[]',
				'required': '1',
				'value': Math.floor(discount['discount'] * 100)
			});
		}

		var discountAdd = Create('div', 'discount-add', form, '<i class="fa-regular fa-square-plus"></i>');
		discountAdd.onclick = function() {
			var row = Create('div', 'discount-input-row', formInputs);
			row.contextItems = discountContextMenu;
			Create('input', 'discount-input-orders', row, null, {
				'type': 'number',
				'min': 0,
				'name': 'orders[]',
				'required': '1'
			});
			Create('input', 'discount-input-value', row, null, {
				'type': 'number',
				'step': 0.01,
				'min': 0,
				'max': 100,
				'name': 'value[]',
				'required': '1'
			});
		}

		Create('input', null, form, null, {
			'type': 'submit',
			'value': 'Сохранить'
		});

		formHandler('scripts/php/editDiscounts.php', function(data){
			if (data['status'] == 'ok') {
				closeUmodal();
			}
			notification('Информация', data['msg']);
		}, 'discounts-editor');
	});
}

async function openRentMenu(data) {
	uModal('Окно аренды', true, true, true, false);

	const userData = await getUserData();
	var discount = userData['discount'];
	if (discount == null) discount = 0;
	var ubody = umodal.ubody;

	const boatCost = data['total_cost'] * (1 - discount);
	var totalCost = boatCost;
	var costDivValue;

	var rows = [
		{ "title": "Выбранное судно", "value": data['boat_name'] },
		{ "title": "Дата начала аренды", "value": normalizeDate(data['date'])},
		{ "title": "Количество полных дней", "value": numWord(data['days'], ['день', 'дня', 'дней'])},
		{ "title": "Итоговая стоимость", "value": normalizeCost(totalCost) + ' руб.', 'id': 'total-cost'}
	];

	for (var r in rows) {
		var row = rows[r];
		var rentInfo = Create('div', 'personal-data', ubody);
		Create('div', 'personal-data-title', rentInfo, row['title']);

		if (row['id'] == 'total-cost') {
			costDivValue = Create('div', 'personal-data-value', rentInfo, row['value']);
			if (discount != 0) costDivValue.innerHTML += ' (с учетом скидки в ' + discount*100 + '% на судно)'
		}
		else {
			Create('div', 'personal-data-value', rentInfo, row['value']);
		}
	}

	var footer = umodal.ufooter;

	var form = Create('form', null, footer, null, {
		'method': 'POST',
		'action': '',
		'id': 'final-rent',
		'style': 'display: flow-root'
	});
	
	if (data['captains'].length != 0) {
		var captainsIDs = [];

		var captainSelection = Create('select', null, form, null, {
			'name': 'captain'
		});
	
		Create('option', null, captainSelection, 'Выберите капитана');
		captainsIDs.push({'name': 'Выберите капитана', 'id': -1});

		for (var c in data['captains']) {
			var captain = data['captains'][c];
			var optionInner =  captain['full_name'] + ' (' + captain['cost'] + ' руб/сутки)';
			Create('option', null, captainSelection, optionInner);
			captainsIDs.push({'name': optionInner, 'id': captain['id']});
		}

		captainSelection.onchange = function() {
			if (this.value != 'Выберите капитана') {
				var captainCost = this.value.match(/\d/g);
				captainCost = captainCost.join("");
				totalCost = boatCost + captainCost * data['days'];
				costDivValue.innerHTML = normalizeCost(totalCost) + ' руб.';
				if (discount != 0) costDivValue.innerHTML += ' (с учетом скидки в ' + discount*100 + '% на судно)'
			} 
			else {
				totalCost = boatCost;
				costDivValue.innerHTML = normalizeCost(boatCost) + ' руб.';
				if (discount != 0) costDivValue.innerHTML += ' (с учетом скидки в ' + discount*100 + '% на судно)'
			}
		}
	}
	else {
		notification('Извините', 'Увы, но свободных капитанов из нашего коллектива на выбранные дни нет :(')
	}

	var ownCaptain = Create('div', 'own-captain', form, 'У меня имеется собственный капитан');
	ownCaptain.onclick = function(e) {
		totalCost = boatCost;
		costDivValue.innerHTML = normalizeCost(boatCost) + ' руб.';
		if (discount != 0) costDivValue.innerHTML += ' (с учетом скидки в ' + discount*100 + '% на судно)'
		if (captainSelection) form.removeChild(captainSelection);
		form.removeChild(this);
		var hintText = "Для регистрации капитана позвоните нашему мененджеру по номеру +7 (926) 878-38-09 или напишите нам в Telegram";
		var inputInfo = Create(
			'div', 
			'input-info', 
			form, 
			`Введите эл. почту уже зарегистрированного капитана <i class="fa-regular fa-circle-question" data-title="${hintText}"></i>`,
			null,
			true
		);
		
		Create('input', null, inputInfo, null, {
			'name': 'email',
			'type': 'email',
			'required': 1,
			'style': 'width: 450px'
		});
	}

	Create('input', null, form, null, {
		'type': 'button',
		'value': 'Арендовать',
		'style': 'float: right; cursor: pointer',
	}).onclick = function(){
		var toSend;
		var rentForm = umodal.ufooter.querySelector('#final-rent');
		var selectedCaptain = rentForm.querySelector('select');
		if (selectedCaptain != null) {
			selectedCaptain = selectedCaptain.value;
			var captainID;
			for (var c in captainsIDs) if (captainsIDs[c]['name'] == selectedCaptain) captainID = captainsIDs[c]['id'];

			toSend = {
				'captain_id': captainID,
				'total_cost': totalCost,
				'date': data['date'],
				'days': data['days'],
				'boats': data['boats'],
				'boat_name': data['boat_name']
			};
		}
		else {
			var email = rentForm.querySelector('input[name="email"]').value;
			toSend = {
				'email': email,
				'total_cost': totalCost,
				'date': data['date'],
				'days': data['days'],
				'boats': data['boats'],
				'boat_name': data['boat_name']
			};
		}

		RdPostRequest('scripts/php/rentBoat.php', toSend, function(data){
			if (data['status'] == 'ok') {
				closeUmodal();
			}
			notification('Информация', data['msg']);
		});
	};

}

// Client's main pages

function showBoats() {
	var isAnyActiveSerial = function(serials){
		for (var s in serials) {
			if (serials[s]['active'] == 1) return true;
		}
		return false;
	}

	RdGetRequest("./api/getBoats.php", function (data) {
		var container = document.getElementsByClassName("container")[0];
		if (container.classList.contains("admin")) return;
		container.innerHTML = "";
		var list = Create("div", "yachts-list", container);
		for (var b in data) {
			var boat = data[b];
			if (boat['serials'].length == 0 || !isAnyActiveSerial(boat['serials'])) continue;
			
			var item = Create("div", "yachts-item", list);
			item.onclick = function () {
				var boatName = this.querySelectorAll("div.yachts-info.title")[0]['innerText'];
				showBoatInfo(boatName);
			}
			var a = Create("a", null, item);
			//a.href = 
			Create("div", "yachts-photo-title", a, "<img src = '" + boat.img + "'>");
			var info = Create("div", "yachts-info", a);
			Create("div", "yachts-info title", info, boat.name);
			var formatCost = new Intl.NumberFormat("ru").format(boat.cost);
			Create("div", "yachts-info text", info,
				`Длина ${boat.length} м<br>
				Вместимость до ${boat.capacity} гостей<br>
				${formatCost} ₽/сутки<br>`
			);
		}
	});
}

function showBoatInfo(boatName) {
	RdGetRequest(`./api/getBoats.php?name=${boatName}`, function (data) {
		var container = document.getElementsByClassName("container")[0];
		if (container.classList.contains("admin")) return;
		container.innerHTML = "";

		var returner = Create("div", "returner", container, `<i class="fa-regular fa-circle-left"></i>`);
		returner.onclick = showBoats;

		var info = Create("div", "boat-info", container);
		Create("div", "boat-title-photo", info, "<img src = '" + data.img + "'>");
		var description = Create("div", "boat-description", info);
		var meta = Create("div", "boat-meta", description);
		var metaName = Create("div", "boat-meta-name", meta, data.name);
		var metaPrice = Create("div", "boat-meta-price", meta, normalizeCost(data.cost) + " ₽/сутки");
		var table = Create("div", "boat-table", description);
		
		if (data.name.length >= 17 && data.name.length < 19) {
			metaName.style.fontSize = metaPrice.style.fontSize = "23px";
		}
		else if (data.name.length >= 19) {
			metaName.style.fontSize = metaPrice.style.fontSize = "20px";
		}

		var characteristics = {
			"Вместимость": data.capacity + " чел",
			"Длина": data.length + " м",
			"Максимальная скорость": data.speed + " км/ч",
			"Запас воды": data.water + " л",
			"Запас топлива": data.fuel + " л",
			"Количество кают": data.cabins,
			"Осадка": data.draught + " м"
		};

		for (var c in characteristics) {
			var line = Create("div", "boat-table-line", table);
			Create("div", "boat-table-name", line, c);
			Create("div", "boat-table-value", line, characteristics[c]);
		}

		var menu = Create("div", "rent-menu", description);
		var form = Create("form", null, menu, null, {
			'method': 'post',
			'action': './scripts/php/getRentInfo.php',
			'id': 'rent-form'
		});
		Create('input', null, form, null, {
			'name': 'date',
			'type': 'date',
			'required': 1,
			'min': currentDate,
			'value': currentDate
		});
		Create('input', null, form, null, {
			'name': 'boat',
			'type': 'hidden',
			'readonly': 1,
			'value': boatName
		});
		Create('input', null, form, null, {
			'name': 'days',
			'type': 'number',
			'required': 1,
			'placeholder': 'Дни',
			'min': 1,
			'max': 31
		});
		Create('input', null, form, null, {
			'type': 'submit',
			'value': 'Арендовать'
		});

		formHandler('scripts/php/getRentInfo.php', function(data){
			if (data['status'] == 'ok') {
				data['boat_name'] = boatName;
				openRentMenu(data);
			}
			else {
				notification('Информация', data['msg']);
			}
		}, 'rent-form');
	});
}

// Admin's main pages

function showBoatsList() {
	RdGetRequest("./api/getBoats.php", function (data) {
		var container = document.getElementsByClassName("container admin")[0];
		container.innerHTML = "";
		if (!container.classList.contains("admin")) return;
		var list = Create("div", "boats-list", container);

		for (var b in data) {
			var boat = data[b];
			var item = Create("div", "boats-list-item", list);
			item.onclick = function () {
				var boatName = this.querySelectorAll("div.boats-list-item-text.title")[0].innerText;
				openBoatInfoEditWindow(boatName);
			}
			Create("div", "boats-list-item-img", item, '<img src="' + boat.img + '">');
			var text = Create("div", "boats-list-item-text", item);
			Create("div", "boats-list-item-text title", text, boat.name);
			Create("div", "boats-list-item-text amount", text, "Количество: " + boat.amount + " шт.");
		}

		var add = Create("div", "boats-list-item add", list);
		add.onclick = openAddingBoatWindow;
		Create("div", "boats-list-item-img", add, '<img src="./img/png/boat.png">');
		var text = Create("div", "boats-list-item-text", add);
		Create("div", "boats-list-item-text title", text, "Новое судно");
	});
}

function showClientsList() {
	RdGetRequest("./api/getClients.php", function (data) {
		var container = document.getElementsByClassName("container admin")[0];
		container.innerHTML = "";
		if (!container.classList.contains("admin")) return;

		var list = Create("div", "table-list", container);
		var listHeader = Create("div", "table-list-header", list);
		var heads = [
			{ "class": "table-list-head last-name", "value": "Фамилия" },
			{ "class": "table-list-head first-name", "value": "Имя" },
			{ "class": "table-list-head middle-name", "value": "Отчество" },
			{ "class": "table-list-head telephone", "value": "Телефон" },
			{ "class": "table-list-head email", "value": "Эл. почта" },
		];

		for (var h in heads) {
			var head = heads[h];
			Create("div", head['class'], listHeader, head['value']);
		}

		for (var c in data) {
			var client = data[c];
			var row = Create("div", "table-list-row", list);
			row.setAttribute("data-clientid", client.id);
			row.onclick = function () {
				var id = this.getAttribute("data-clientid");
				openClientInfoWindow(id);
			}
			Create("div", "table-list-cell last-name", row, client['last_name']);
			Create("div", "table-list-cell first-name", row, client['first_name']);
			var hasMiddleName = client['middle_name'] != '' && client['middle_name'] != null ? true : false;
			var middleName = Create("div", "table-list-cell middle-name", row, hasMiddleName ? client['middle_name']: '<Отсутствует>');
			if (!hasMiddleName) middleName.style.opacity = '0.8';
			Create("div", "table-list-cell telephone", row, client['telephone']);
			Create("div", "table-list-cell email", row, client['email']);
		}
	});
}

function showRentsList() {
	RdGetRequest("./api/getRents.php", function (data) {
		var container = document.getElementsByClassName("container admin")[0];
		container.innerHTML = "";
		if (!container.classList.contains("admin")) return;

		var list = Create("div", "table-list", container);
		var listHeader = Create("div", "table-list-header", list);
		var heads = [
			{ "class": "table-list-head boat", "value": "Название судна" },
			{ "class": "table-list-head client", "value": "Клиент" },
			{ "class": "table-list-head captain", "value": "Капитан" },
			{ "class": "table-list-head date", "value": "Дата аренды" },
			{ "class": "table-list-head days", "value": "Количество дней" },
		];

		for (var h in heads) {
			var head = heads[h];
			Create("div", head['class'], listHeader, head['value']);
		}

		for (var r in data) {
			var rent = data[r];
			var canceled = rent['canceled'] == '1' ? true : false;
			var hasProblem = rent['has_problem'] == '1' ? true : false;
			var row = Create("div", "table-list-row rents", list, null, {
				'data-rentID': rent['id']
			});

			if (canceled) row.classList.add('canceled');
			if (hasProblem && !canceled) row.classList.add('has_problem');

			var name = Create("div", "table-list-cell boat", row, rent['name'], {
				'data-rentID': rent['id'],
				'data-canceled': canceled
			});
			var client = Create("div", "table-list-cell client", row, rent['client'], {
				"data-clientID": rent['client_id']
			});
			var captain = Create("div", "table-list-cell captain", row, rent['captain'], {
				"data-captainID": rent['captain_id']
			});

			name.contextItems = rentContextMenu
			client.contextItems = rentContextMenu
			captain.contextItems = rentContextMenu

			Create("div", "table-list-cell date", row, normalizeDate(rent['date'])).contextItems = rentContextMenu;
			Create("div", "table-list-cell days", row, rent['days']).contextItems = rentContextMenu;

			name.onclick = function () {
				var id = this.getAttribute("data-rentID");
				var isCanceled = (this.getAttribute('data-canceled') === 'true');
				openRentInfoWindow(id, isCanceled);
			}
			client.onclick = function () {
				var id = this.getAttribute("data-clientID");
				openClientInfoWindow(id);
			}
			captain.onclick = function () {
				var id = this.getAttribute("data-captainID");
				openCaptainInfoWindow(id);
			}
		}
	});
}

function showCaptainsList() {
	RdGetRequest("./api/getCaptains.php", function (data) {
		var container = document.getElementsByClassName("container admin")[0];
		container.innerHTML = "";
		if (!container.classList.contains("admin")) return;

		var list = Create("div", "table-list", container);
		var listHeader = Create("div", "table-list-header", list);
		var heads = [
			{ "class": "table-list-head last-name", "value": "Фамилия" },
			{ "class": "table-list-head first-name", "value": "Имя" },
			{ "class": "table-list-head middle-name", "value": "Отчество" },
			{ "class": "table-list-head cost", "value": "Стоимость услуг" },
			{ "class": "table-list-head telephone captain", "value": "Телефон" },
		];

		for (var h in heads) {
			var head = heads[h];
			Create("div", head['class'], listHeader, head['value']);
		}

		for (var c in data) {
			var captain = data[c];
			var row = Create("div", "table-list-row", list);
			if (captain['active'] == '0'){
				row.classList.add('inactive');
			}
			row.contextItems = captainContextMenu;
			row.setAttribute("data-captainID", captain['id']);
			row.onclick = function () {
				var id = this.getAttribute("data-captainID");
				openCaptainInfoEditWindow(id);
			}
			Create("div", "table-list-cell last-name", row, captain['last_name']).contextItems = captainContextMenu;
			Create("div", "table-list-cell first-name", row, captain['first_name']).contextItems = captainContextMenu;
			var hasMiddleName = captain['middle_name'] != '' ? true : false;
			var middleName = Create("div", "table-list-cell middle-name", row, hasMiddleName ? captain['middle_name'] : '<Отсутствует>').contextItems = captainContextMenu;
			if (!hasMiddleName) middleName.style.opacity = '0.8';
			Create("div", "table-list-cell cost", row, normalizeCost(captain['cost'])).contextItems = captainContextMenu;
			Create("div", "table-list-cell telephone captain", row, captain['telephone']).contextItems = captainContextMenu;
		}
		var addRow = Create("div", "table-list-row add", list, 'Новый капитан');
		addRow.onclick = openAddingCaptainWindow;
	});
}

function stopSession() {
	RdGetRequest('./scripts/php/logout.php', function(data){
		if (data['status'] == 'ok') notification('Информация', data['msg']);
		setTimeout(() => window.location.replace('http://cr1stioj.rustdev.ru/avangard/'), 1500);
	});
}

// Setting, validation, auxiliary 

function setActiveNavLink() {
	var navHandlers = {
		"nav-boats": showBoatsList,
		"nav-clients": showClientsList,
		"nav-rents": showRentsList,
		"nav-captains": showCaptainsList,
		"nav-discounts": openDiscountsEditWindow,
		"nav-exit": stopSession
	};
	var navlinks = document.getElementsByClassName("nav-link");

	if (navlinks.length == 0) return;

	for (var i = 0; i < navlinks.length; i++) {
		navlinks[i].onclick = function () {
			if (activeNavLink != null) activeNavLink.classList.remove("active");
			this.classList.add("active");
			activeNavLink = this;
			configureContextMenu();
		};
	}

	for (var nav in navHandlers) {
		var navlink = document.getElementById(nav);
		navlink.addEventListener("click", navHandlers[nav]);
	}

	navlinks[0].click();
}

function notification(_title, _text, _interval = 5000) {
	new Toast({
		title: _title,
		text: _text,
		theme: 'light',
		autohide: true,
		interval: _interval
	});
}

function phoneInputValidate() {
	var phoneInputs = document.querySelectorAll('input[type="tel"]');

	var getInputNumbersValue = function (input) {
		return input.value.replace(/\D/g, '');
	}

	var onPhonePaste = function (e) {
		var input = e.target,
			inputNumbersValue = getInputNumbersValue(input);
		var pasted = e.clipboardData || window.clipboardData;
		if (pasted) {
			var pastedText = pasted.getData('Text');
			if (/\D/g.test(pastedText)) {
				input.value = inputNumbersValue;
				return;
			}
		}
	}

	var onPhoneInput = function (e) {
		var input = e.target,
			inputNumbersValue = getInputNumbersValue(input),
			selectionStart = input.selectionStart,
			formattedInputValue = "";

		if (!inputNumbersValue) {
			return input.value = "";
		}

		if (input.value.length != selectionStart) {
			if (e.data && /\D/g.test(e.data)) {
				input.value = inputNumbersValue;
			}
			return;
		}

		if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
			if (inputNumbersValue[0] == "9") inputNumbersValue = "7" + inputNumbersValue;
			var firstSymbols = (inputNumbersValue[0] == "8") ? "8" : "+7";
			formattedInputValue = input.value = firstSymbols + " ";
			if (inputNumbersValue.length > 1) {
				formattedInputValue += '(' + inputNumbersValue.substring(1, 4);
			}
			if (inputNumbersValue.length >= 5) {
				formattedInputValue += ') ' + inputNumbersValue.substring(4, 7);
			}
			if (inputNumbersValue.length >= 8) {
				formattedInputValue += '-' + inputNumbersValue.substring(7, 9);
			}
			if (inputNumbersValue.length >= 10) {
				formattedInputValue += '-' + inputNumbersValue.substring(9, 11);
			}
		} else {
			formattedInputValue = '+' + inputNumbersValue.substring(0, 16);
		}
		input.value = formattedInputValue;
	}
	var onPhoneKeyDown = function (e) {
		var inputValue = e.target.value.replace(/\D/g, '');
		if (e.keyCode == 8 && inputValue.length == 1) {
			e.target.value = "";
		}
	}
	for (var phoneInput of phoneInputs) {
		phoneInput.addEventListener('keydown', onPhoneKeyDown);
		phoneInput.addEventListener('input', onPhoneInput, false);
		phoneInput.addEventListener('paste', onPhonePaste, false);
	}
}

function inputValidate() {
	var masks = {
		'.passport-mask': $(".passport-mask").mask("9999 999999"),
		'.serial-mask': $(".serial-mask").mask("9999999999999999"),
		'license-num-mask': $(".license-num-mask").mask("999 999")
	};

	for (var m in masks) {
		var inputs = document.querySelectorAll(`input[class="${m}"`);

		for (var i = 0; i < inputs.length; i++) {
			var input = inputs[i];

			input.addEventListener('focus', function (e) {
				e.target.setSelectionRange(0, 0);
			});
		}
	}
}

function configureFileInput() {
	var fileInputs = document.querySelectorAll('input[type="file"]');
	for (var i = 0; i < fileInputs.length; i++) {
		var input = fileInputs[i];
		input.addEventListener('change', function (e) {
			var file = e.target.files[0];
			var text = document.getElementsByClassName("input-file-text")[0];
			text.innerHTML = file.name.substring(0, 30);
			if (file.name.length > 30) text.innerHTML += "...";
		});
	}
}

function normalizeDate(date) {
	var arr = date.split('-');
	return arr[2] + '.' + arr[1] + '.' + arr[0];
}

function normalizeCost(cost) {
	return new Intl.NumberFormat("ru").format(cost);
}

function numWord(value, words) {
	var num = value % 100;
	if (num > 19) {
		num = num % 10;
	}

	out = value + ' ';

	switch (num) {
		case 1: out += words[0]; break;
		case 2:
		case 3:
		case 4: out += words[1]; break;
		default: out += words[2]; break;
	}

	return out;
}

window.onload = async function () {
	var date = new Date();
	date.setDate(date.getDate() + 1);
	currentDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);

	if (window.location.href.endsWith('panel.html')) {
		var admin = await isAdmin();
		if (!admin) {
			window.location.replace('http://cr1stioj.rustdev.ru/avangard/');
			return;
		}
		setActiveNavLink();
	}
	else {
		showBoats();
	}

	getSession();
}

function formHandler(_url, _success, _id = '_form')
{
	$(umodal).ready(function () {
		$("#" + _id).submit(function () {
			var formID = _id;
			var formNm = $('#' + formID);

			var formData = new FormData();
			var serialized = formNm.serializeArray();
			for (var i = 0; i < serialized.length; i++) {
				if (serialized[i]['name'] != 'file'){
					formData.append(serialized[i]['name'], serialized[i]['value']);
				}
			}
			if ($("#js-file").length) formData.append('file', $("#js-file")[0].files[0]);

			$.ajax({
				type: "POST",
				url: _url,
				data: formData,
				contentType: false,
				processData: false,
				success: function(data) {
					_success(JSON.parse(data))
				}
			});

			return false;
		});
	});
}

function parseSession() {
	var navbar = document.getElementsByClassName('navbar')[0];
	if (session['user_id'] != null && !navbar.classList.contains('admin')) {
		var authContainer = document.getElementsByClassName('user-auth-container')[0];
		authContainer.innerHTML = `<div class='user-hello'>Привет, ${session['first_name']}</div>`;

		if (session['user_id'] == -1) {
			authContainer.onclick = function() {
				window.location.replace('http://cr1stioj.rustdev.ru/avangard/panel.html');
			}
		}
		
		else {
			authContainer.onclick = async function() {
				var userData = await getUserData();
				uModal("Личный кабинет", true, true, true, false);
				var body = umodal.ubody;
				var footer = umodal.ufooter;

				if (userData['rents'].length) {
					var list = Create('div', 'rents-list', body);
					var heads = Create('div', 'rents-list-heads', list);

					Create('div', 'rents-list-head boat', heads, 'Наименование судна');
					Create('div', 'rents-list-head date', heads, 'Дата взятия в аренду');
					Create('div', 'rents-list-head cost', heads, 'Стоимость');

					for (var r in userData['rents']) {
						var rent = userData['rents'][r];
						var row = Create('div', 'rents-list-row', list, null, {'data-rentid': rent['rent_id']});
						row.contextItems = contractContextMenu;
						Create('div', 'rents-list-cell boat', row, rent['boat']).contextItems = contractContextMenu;
						Create('div', 'rents-list-cell date', row, normalizeDate(rent['date'])).contextItems = contractContextMenu;
						Create('div', 'rents-list-cell cost', row, normalizeCost(rent['total_cost']) + ' ₽').contextItems = contractContextMenu;
					}
				}
				else {
					body.innerHTML = 'У Вас пока нет заказов :(';
				}

				var text = Create('div', 'user-text', body, null);
				if (userData['rents'].length) {
					Create('div', null, text, 'Для отмены заказа обратитесь в Telegram');
				}
				else {
					Create('div', null, text, '');
				}
				Create('div', null, text, 'Выйти из аккаунта', {
					'style': 'color: var(--primary-color); cursor: pointer'
				}).onclick = stopSession;

				var changeInfoButton = Create('div', null, footer, 'Изменить персональные данные', {
					'style': 'font-size: 19px; cursor: pointer; color: var(--primary-color)'
				})

				changeInfoButton.onclick = function() {
					footer.removeChild(changeInfoButton);
					var inputs = [
						{ 'title': 'Фамилия', 'attributes': { 'name': 'last_name', 'type': 'text', 'value': userData['last_name'], 'required': 1 }},
						{ 'title': 'Имя', 'attributes': { 'name': 'first_name', 'type': 'text', 'value': userData['first_name'], 'required': 1 } },
						{ 'title': 'Отчество', 'attributes': { 'name': 'middle_name', 'type': 'text', 'value': (userData['middle_name'] ? userData['middle_name'] : '') } },
						{ 'title': 'Серия и номер паспорта', 'attributes': { 'name': 'passport', 'class': "passport-mask", 'type': 'text', 'value': userData['passport'], 'required': 1 } },
						{ 'title': 'Место регистрации', 'attributes': { 'name': 'reg_place', 'type': 'text', 'value': userData['reg_place'], 'required': 1 } },
						{ 'title': 'Телефон', 'attributes': { 'name': 'telephone', 'type': 'tel', 'value': userData['telephone'], 'required': 1 } }
					];
			
					var form = Create('form', null, footer, null, {
						'method': 'POST',
						'action': './scripts/php/editClient.php',
						'id': '_form',
						'style': 'display: flow-root'
					})
	
					for (var i in inputs) {
						var inputInfo = Create('div', 'input-info', form, inputs[i]['title']);
						var input = Create('input', null, inputInfo);
						var attributes = inputs[i]['attributes'];
			
						for (var a in attributes) {
							input.setAttribute(a, attributes[a]);
						}
					}
					Create('input', null, form, null, {
						'type': 'submit',
						'value': 'Сохранить'
					})
	
					phoneInputValidate();
					inputValidate();

					formHandler('./scripts/php/editClient.php', function(data){
						if (data['status'] == 'ok') {
							closeUmodal();
						}
						notification('Информация', data['msg']);
					});
				}
			}
		}
	}
}

function getSession() {
	RdGetRequest('./api/getSession.php', function(data){
		session = data;
		parseSession();
	});
}

function ContextMenu(data, arr, x, y) {
	if(contextmenu != null && contextmenu.parentNode != null) {
		contextmenu.parentNode.removeChild(contextmenu);
	}
	contextmenu = Create("button", "context-menu", document.body);
	contextmenu.style.left = x;
	contextmenu.style.top = y;
	contextmenu.focus();
	contextmenu.onblur = function() {
		document.body.removeChild(contextmenu);
	}
	for(var i=0; i<arr.length; i++) {
		if(arr[i].action == null) {
				Create("hr", null, contextmenu);
		} else if(typeof(arr[i].action) == "function") {
			var lnk = Create("span", "context-item", contextmenu, arr[i].title);
			lnk.func = i;
			if(arr[i].icon != null) {
				lnk.style.backgroundImage = "url('/images/ui/"+arr[i].icon+".png')";
			}
			lnk.onclick = function(event) {
				arr[this.func].action(data);
				contextmenu.blur();
			}
		} else if(typeof(arr[i].action) == "string") {
			Create("span", arr[i].action, contextmenu, arr[i].title);
		}
	}
}

function ContextItem(title, action = null, icon = null) {
	return {title: title, icon: icon, action: action};
}

function configureContextMenu() {
	window.oncontextmenu = function(event) {
		if(event.target != null && event.target.contextItems != null) {
			ContextMenu(event, event.target.contextItems, event.clientX, event.clientY+document.body.scrollTop);
			return false;
		} else if(event.target != null && event.target.rightClick != null) {
			event.target.rightClick(event);
			return false;
		}
	}
}

window.oncontextmenu = function(event) {
	if(event.target != null && event.target.contextItems != null) {
		ContextMenu(event, event.target.contextItems, event.clientX, event.clientY+document.body.scrollTop);
		return false;
	} else if(event.target != null && event.target.rightClick != null) {
		event.target.rightClick(event);
		return false;
	}
}

async function isAdmin() {
	var response = await fetch('http://cr1stioj.rustdev.ru/avangard/api/isAdmin.php');
	if (response.ok){
		var json = await response.json();
		return json['is_admin'];
	}
}

async function getUserData() {
	var response = await fetch('http://cr1stioj.rustdev.ru/avangard/api/getUserData.php');
	if (response.ok) {
		var json = await response.json();
		return json;
	}
}