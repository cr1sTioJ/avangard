var umodal;
var activeNavLink;
var currentDate;

function Create(type, cl, parent, html = null) {
	var elem = document.createElement(type);
	if(cl != null) {
		elem.className = cl;
	}
	if(html != null) {
		elem.innerHTML = html;
	}
	if(parent != null) {
		parent.appendChild(elem);
	}
	return elem;
}

function uModal(title, ubody = true, ufooter = true, uclose = true) {
	document.body.style.overflow = "hidden";
	
	if(umodal != null && umodal.parentNode != null) {
		umodal.parentNode.removeChild(umodal);
	}
	
	umodal = Create("div", "umodal", document.body);
	// umodal.onclick = function(event) {
	// 	if(event.target == this) {
	// 		document.body.style.overflow = "auto";
	// 		document.body.removeChild(umodal);
	// 	}
	// }
	umodal.uframe = Create("div", "umodal-frame box", umodal);
	if(title != null) {
		umodal.utop = Create("div", "header", umodal.uframe, title);
		if(uclose) {
			umodal.utop.uclose = Create("div", "uclose", umodal.utop, '<i class="fa fa-times" aria-hidden="true"></i>');
			umodal.utop.uclose.onclick = function() {
				document.body.style.overflow = "auto";
				document.body.removeChild(umodal);
			}
		}
	}
	if(ubody) { umodal.ubody = Create("div", "body", umodal.uframe); }
	if(ufooter) { umodal.ufooter = Create("div", "footer", umodal.uframe); }
	
	umodal.setIcon = function(icon) {
		if(umodal.utop != null) {
			umodal.utop.className = "header header-icon";
			umodal.utop.style.backgroundImage = "url('"+icon+"')";
		}
	}
}

function RdGetRequest(dataUrl, onLoad = null, onProgress = null, onError = null) {
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4) {
			if(onLoad != null && xmlHttp.status == 200) { onLoad(JSON.parse(xmlHttp.responseText)); } else if(onError != null && xmlHttp.status != 200) { onError(xmlHttp.status); }
		}
    }
	xmlHttp.onerror = function(event) { if(onError != null) { onError(xmlHttp.status); } }
	xmlHttp.onprogress = function(event) { if(onProgress != null) { onProgress(event.loaded, event.total); } }
    xmlHttp.open("GET", dataUrl, true);
    xmlHttp.send(null);
}

function openLoginWindow() {
	uModal("Авторизация", true, false, true);
	umodal.ubody.innerHTML = `
			<form method="post">
				<input type="email" name="email" placeholder="Эл. почта">
				<input type="password" name="password" placeholder="Пароль">
				<div class="buttons">
					<a onclick="openRegWindow()">Создать аккаунт</a>
					<input type="submit" value="Вход">
				</div>
			</form>
	`
}

function openRegWindow(){
	uModal("Регистрация", true, false, true);
	umodal.ubody.innerHTML = `
			<form method="post">
				<input type="text" name="last_name" placeholder="Фамилия">
				<input type="text" name="first_name" placeholder="Имя">
				<input type="text" name="middle_name" placeholder="Отчество">
				<input type="date" name="dob" placeholder="Дата рождения">
				<input type="text" name="passport" placeholder="Серия и номер паспорта">
				<input type="text" name="reg_place" placeholder="Место регистрации">
				<input type="tel"  name="telephone" placeholder="Телефон">
				<input type="email" name="email" placeholder="Эл. почта" autocomplete="off">
				<input type="password" name="password" placeholder="Пароль">
				<div class="buttons">
					<input type="submit" value="Зарегистрироваться">
				</div>
			</form>
	`;
}

function openAddingBoatWindow() {
	uModal("Новое судно", true, false, true);
	umodal.ubody.innerHTML = `
		<form method="post">
			<div class="input-info">
				Название
				<input type="text">
			</div>
			<div class="input-info">
				Стоимость
				<input type="number">
			</div>
			<div class="input-info">
				Скорость
				<input type="number">
			</div>
			<div class="input-info">
				Вместимость
				<input type="number">
			</div>
			<div class="input-info">
				Количество кают
				<input type="number">
			</div>
			<div class="input-info">
				Запас воды
				<input type="number">
			</div>
			<div class="input-info">
				Запас топлива
				<input type="number">
			</div>
			<div class="input-info">
				Длина
				<input type="number">
			</div>
			<div class="input-info">
				Осадка
				<input type="number">
			</div>
			<div class="input-info">
				Фотография
				<input type="file">
			</div>
			<input type="submit" value="Добавить">
		</form>
	`;
}

function parseBoatInfoEditWindow(boat) {
	uModal(boat.name, true, true, true);
	umodal.ubody.innerHTML = `
		<form method="post">
			<div class="input-info">
				Название
				<input type="text" value = "${boat.name}">
			</div>
			<div class="input-info">
				Стоимость
				<input type="number" value = "${boat.cost}">
			</div>
			<div class="input-info">
				Скорость
				<input type="number" value = "${boat.speed}">
			</div>
			<div class="input-info">
				Вместимость
				<input type="number" value = "${boat.capacity}">
			</div>
			<div class="input-info">
				Количество кают
				<input type="number" value = "${boat.cabins}">
			</div>
			<div class="input-info">
				Запас воды
				<input type="number" value = "${boat.water}">
			</div>
			<div class="input-info">
				Запас топлива
				<input type="number" value = "${boat.fuel}">
			</div>
			<div class="input-info">
				Длина
				<input type="number" value = "${boat.length}">
			</div>
			<div class="input-info">
				Осадка
				<input type="number" value = "${boat.draught}">
			</div>
			<div class="input-info">
				Фотография
				<input type="file">
			</div>
			<input type="submit" value="Сохранить">
		</form>
	`;

	var footer = "";
	for (var i = 0; i < boat.list.length; i++) {
		var id = boat.list[i];
		footer += `<div>${id}</div>`;
	}

	umodal.ufooter.innerHTML = footer;
}

function parseBoats(data){
	var container = document.getElementsByClassName("container")[0];
	if (container.classList.contains("admin")) return;
	var list = Create("div", "yachts-list", container);
	for (var b in data) {
		var boat = data[b];
		var item = Create("div", "yachts-item", list);
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
}

function parseBoatInfo(data){
	var container = document.getElementsByClassName("container")[0];
	if (container.classList.contains("admin")) return;
	var info = Create("div", "boat-info", container);
	Create("div", "boat-title-photo", info, "<img src = '"+data.img+"'>");
	var description = Create("div", "boat_description", info);
	var meta = Create("div", "boat_meta", description);
	Create("div", "boat_meta-name", meta, data.name);
	var formatCost = new Intl.NumberFormat("ru").format(data.cost);
	Create("div", "boat_meta-price", meta, formatCost + " ₽/сутки");
	var table = Create("div", "boat_table", description);

	var line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Вместимость");
	Create("div", "boat_table-value", line, data.capacity + " чел");

	line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Длина");
	Create("div", "boat_table-value", line, data.length + " м");

	line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Максимальная скорость");
	Create("div", "boat_table-value", line, data.speed + " км/ч");

	line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Запас воды");
	Create("div", "boat_table-value", line, data.water + " л");

	line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Запас топлива");
	Create("div", "boat_table-value", line, data.fuel + " л");

	line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Количество кают");
	Create("div", "boat_table-value", line, data.cabins);

	line = Create("div", "boat_table-line", table);
	Create("div", "boat_table-name", line, "Осадка");
	Create("div", "boat_table-value", line, data.draught + " м");

	var menu = Create("div", "rent_menu", description);
	Create("form", null, menu,
		`<input name="date_choose" type="date" required min="${currentDate}" value="${currentDate}">
		<input name="days_count" type="number" placeholder="Дни" min="1" required>
		<input name="submit" type="submit" value="Арендовать">`
	);
}

function parseBoatsAdmin(data) {
	var container = document.getElementsByClassName("container")[0];
	if (!container.classList.contains("admin")) return;
	var list = Create("div", "boats-list", container);
	
	for (var b in data) {
		var boat = data[b];
		var item = Create("div", "boats-list-item", list);
		//item.addEventListener("click", showBoatsAdmin);
		item.onclick = openBoatInfoEditWindow;
		Create("div", "boats-list-item-img", item, '<img src="'+ boat.img +'">');
		var text = Create("div", "boats-list-item-text", item);
		Create("div", "boats-list-item-text title", text, boat.name);
		Create("div", "boats-list-item-text amount", text, "Количество: "+ boat.amount + " шт.");
	}

	var add = Create("div", "boats-list-item add", list);
	add.onclick = openAddingBoatWindow;
	Create("div", "boats-list-item-img", add, '<img src="/img/png/boat.png">');
	var text = Create("div", "boats-list-item-text", add);
	Create("div", "boats-list-item-text title", text, "Добавить судно");
}

function showBoatsAdmin() {
	RdGetRequest("api/getBoats.json", parseBoatsAdmin);
}

function showBoats() {
	RdGetRequest("api/getBoats.json", parseBoats);
}

function showBoatInfo() {
	RdGetRequest("api/getBoatInfo.json", parseBoatInfo);
}

function openBoatInfoEditWindow() {
	RdGetRequest("api/getBoatInfo.json", parseBoatInfoEditWindow);
}

window.onload = function() {
	var date = new Date();
	currentDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
	showBoats();
	showBoatInfo();
	//showBoatsAdmin();
	setActiveNavLink();
}

function setActiveNavLink(){
	var navlinks = document.getElementsByClassName("nav-link");
	for (var i = 0; i < navlinks.length; i++) navlinks[i].classList.remove("active");
	this.classList.add("active");
}

function setActiveNavLink() {
	var navlinks = document.getElementsByClassName("nav-link");

	for (var i = 0; i < navlinks.length; i++){
		navlinks[i].onclick = function(){
			if (activeNavLink != null) activeNavLink.classList.remove("active");
			this.classList.add("active");
			activeNavLink = this;
		};
	}

	navlinks[0].click();
}

function notification(_title, _text){
	new Toast({
		title: _title,
		text: _text,
		theme: 'light',
		autohide: true,
		interval: 5000
	  });
}