<?php
require_once("/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/lib/MySQL.php");
require_once("/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/avangard/lib/tpdf/tfpdf.php");

function num2str($num) {
	$nul='ноль';
	$ten=array(
		array('','один','два','три','четыре','пять','шесть','семь', 'восемь','девять'),
		array('','одна','две','три','четыре','пять','шесть','семь', 'восемь','девять'),
	);
	$a20=array('десять','одиннадцать','двенадцать','тринадцать','четырнадцать' ,'пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать');
	$tens=array(2=>'двадцать','тридцать','сорок','пятьдесят','шестьдесят','семьдесят' ,'восемьдесят','девяносто');
	$hundred=array('','сто','двести','триста','четыреста','пятьсот','шестьсот', 'семьсот','восемьсот','девятьсот');
	$unit=array( // Units
		array('копейка' ,'копейки' ,'копеек',	 1),
		array('рубль'   ,'рубля'   ,'рублей'    ,0),
		array('тысяча'  ,'тысячи'  ,'тысяч'     ,1),
		array('миллион' ,'миллиона','миллионов' ,0),
		array('миллиард','милиарда','миллиардов',0),
	);
	//
	list($rub,$kop) = explode('.',sprintf("%015.2f", floatval($num)));
	$out = array();
	if (intval($rub)>0) {
		foreach(str_split($rub,3) as $uk=>$v) { // by 3 symbols
			if (!intval($v)) continue;
			$uk = sizeof($unit)-$uk-1; // unit key
			$gender = $unit[$uk][3];
			list($i1,$i2,$i3) = array_map('intval',str_split($v,1));
			// mega-logic
			$out[] = $hundred[$i1]; # 1xx-9xx
			if ($i2>1) $out[]= $tens[$i2].' '.$ten[$gender][$i3]; # 20-99
			else $out[]= $i2>0 ? $a20[$i3] : $ten[$gender][$i3]; # 10-19 | 1-9
			// units without rub & kop
			if ($uk>1) $out[]= morph($v,$unit[$uk][0],$unit[$uk][1],$unit[$uk][2]);
		} //foreach
	}
	else $out[] = $nul;
	$out[] = morph(intval($rub), $unit[1][0],$unit[1][1],$unit[1][2]); // rub
	$out[] = $kop.' '.morph($kop,$unit[0][0],$unit[0][1],$unit[0][2]); // kop
	return trim(preg_replace('/ {2,}/', ' ', join(' ',$out)));
}

function morph($n, $f1, $f2, $f5) {
	$n = abs(intval($n)) % 100;
	if ($n>10 && $n<20) return $f5;
	$n = $n % 10;
	if ($n>1 && $n<5) return $f2;
	if ($n==1) return $f1;
	return $f5;
}

function convertDateFormat($date) {
    $dateArr = explode("-", $date); // разбиваем дату на массив элементов
    $day = $dateArr[2];
    $month = $dateArr[1];
    $year = $dateArr[0];
    return "$day.$month.$year"; // возвращаем дату в нужном формате
}

function numberToString($number) {
    // Массив для хранения названий чисел
    $numberNames = array(
      0 => 'ноль', 1 => 'один', 2 => 'два', 3 => 'три', 4 => 'четыре', 5 => 'пять',
      6 => 'шесть', 7 => 'семь', 8 => 'восемь', 9 => 'девять', 10 => 'десять',
      11 => 'одиннадцать', 12 => 'двенадцать', 13 => 'тринадцать', 14 => 'четырнадцать', 15 => 'пятнадцать',
      16 => 'шестнадцать', 17 => 'семнадцать', 18 => 'восемнадцать', 19 => 'девятнадцать', 20 => 'двадцать',
      30 => 'тридцать', 40 => 'сорок', 50 => 'пятьдесят', 60 => 'шестьдесят',
      70 => 'семьдесят', 80 => 'восемьдесят', 90 => 'девяносто', 100 => 'сто',
      200 => 'двести', 300 => 'триста', 400 => 'четыреста', 500 => 'пятьсот',
      600 => 'шестьсот', 700 => 'семьсот', 800 => 'восемьсот', 900 => 'девятьсот'
    );
  
    // Если число равно 0, возвращаем "ноль"
    if ($number == 0) {
      return $numberNames[0];
    }
  
    // Разбиваем число на разряды
    $digits = str_split(strrev($number));
  
    // Переменная для хранения результата
    $result = '';
  
    // Склеиваем строку, перебирая разряды
    foreach ($digits as $i => $digit) {
      // Определяем разряд числа (единицы, десятки, сотни и т.д.)
      $power = pow(10, $i);
      // Получаем число для текущего разряда
      $currentNumber = $digit * $power;
      // Добавляем название числа для текущего разряда
      if ($currentNumber > 0) {
        $result = $numberNames[$currentNumber] . ' ' . $result;
      }
    }
  
    return trim($result); 

    if ($number >= 10 && $number <= 19) {
        $result = $numberNames[$number];
    }
    else {
    // Название десятков
    $tens = $numberNames[10 * floor($number / 10)];
    // Название единиц
    $ones = $numberNames[$number % 10];
    // Склеиваем названия десятков и единиц
    $result = $tens . ' ' . $ones;
    }
    
    return $result;
}  

$db = new MySQL();

$db->Connect(
    'localhost',
	'u154150_yachtrent',
	'mF8cE5dU7c',
    'u154150_yachtrent'
);

session_start();


$user_id = $_SESSION['user_id'];
$rent_id = $_GET['id'];
$status = [];

$sql = "
    SELECT 
        Rents.contract,
        Rents.date,
        Rents.days,
        Rents.total_cost,
        CONCAT(Captains.last_name, ' ', Captains.first_name, ' ', IF(Captains.middle_name != '', Captains.middle_name, '')) as captain_name,
        CONCAT(Clients.last_name, ' ', Clients.first_name, ' ', IF(Clients.middle_name != '', Clients.middle_name, '')) as client_name,
        Clients.passport as client_passport,
        Clients.dob as client_dob,
        Clients.reg_place as client_reg_place,
        Clients.telephone as client_telephone,
        Clients.email as client_email,
        Captains.passport as captain_passport,
        Captains.dob as captain_dob,
        Captains.reg_place as captain_reg_place,
        Captains.telephone as captain_telephone,
        Rents.boat as boat_serial,
        BoatsGeneral.name as boat_name
    FROM Rents
    INNER JOIN Captains
        ON Captains.id = Rents.captain
    INNER JOIN Clients
        ON Clients.id = Rents.client
    INNER JOIN Boats
        ON Boats.serial = Rents.boat
    INNER JOIN BoatsGeneral
        ON BoatsGeneral.id = Boats.id
    WHERE Rents.id = $rent_id AND (client = $user_id OR $user_id = -1)
";

$result = $db->Select($sql);

if (!$db->GetNumRows())
{
    $status['status'] = 'error';
    $status['msg'] = 'Возникла ошибка при скачивании файла';
    echo json_encode($status);
    return;
}

$result = $result[0];
$text_color = array(0, 0, 0);
$header_color = array(100, 100, 100);
$client_info = $result['client_name']." (".$result['client_passport'].");\nдата рождения ".convertDateFormat($result['client_dob']).";\nместо регистрации: ".$result['client_reg_place'].";\nтелефон: ".$result['client_telephone'].";\nэл. почта: ".$result['client_email'];
$captain_info = $result['captain_name']." (".$result['captain_passport'].").\n          Дата рождения ".convertDateFormat($result['captain_dob']).".\n          Место регистрации: ".$result['captain_reg_place'].".\n          Телефон: ".$result['captain_telephone'];

$pdf = new tFPDF('P', 'mm', 'A4');

$pdf->SetTextColor($text_color[0], $text_color[1], $text_color[2]);

$pdf->AddPage();

$pdf->AddFont('Times new Roman', '', 'timesnewromanpsmt.ttf', true);
$pdf->SetFont('Times new Roman', '', 18);

// $pdf->AddFont('DejaVu', '', 'DejaVuSansCondensed.ttf', true);
// $pdf->SetFont('DejaVu', '', 18);

$pdf->Cell(0, 0, 'ДОГОВОР', 0, 0, 'C');

$pdf->SetFontSize(14);
$pdf->Ln();
$pdf->Cell(0, 15, 'аренды транспортного средства №'.$rent_id, 0, 0, 'C');

$pdf->Ln();
$pdf->Cell(0, 15, "г. Москва, Пулковская 6");
$pdf->Cell(0, 15, convertDateFormat($result['contract']), 0, 0, 'R');

$pdf->Ln();
$pdf->Write(6, "ООО \"Водный авангард\" 1106188000490 (именуемое в дальнейшем \"Арендодатель\") с одной стороны, ");
$pdf->Ln(10);
$pdf->Write(6, "и ".$client_info);

$pdf->Ln(10);
$pdf->Write(6, "с другой стороны, в дальнейшем совместно именуемые Стороны, заключили настоящий договор аренды транспортного средства (далее - договор) о нижеследующем:");

$pdf->Ln(10);
$pdf->SetFontSize(16);
$pdf->Cell(0, 15, '1. Предмет Договора', 0, 0, 'C');

$pdf->SetFontSize(14);
$pdf->Ln();
$pdf->Write(6, "1.1. В порядке и на условиях, определенных настоящим Договором, Арендодатель обязуется передать Арендатору во временное владение и пользование транспортное средство, определенное в настоящем Договоре (далее - судно), а также обеспечить своими силами его управление и техничекую эксплуатацию, а Арендатор обязуется принять во временное владение и пользование судно под управлением экипажа Арендодателя и уплачивать Арендодателю арендную плату.");
$pdf->Ln();
$pdf->Write(6, "\n1.2. Под судном понимается:");
$pdf->Ln();
$pdf->Write(6, "1.2.1. Наименование судна: ".$result['boat_name']);
$pdf->Ln();
$pdf->Write(6, "1.2.2. Бортовой регистрационный номер: ".$result['boat_serial']);
$pdf->Ln(12);
$pdf->Write(6, "1.3. Дополнительные детали Договора:");
$pdf->Ln();
$pdf->Write(6, "1.3.1. Капитан судна: ".$captain_info);
$pdf->Ln();
$pdf->Write(6, "1.3.2. Дата начала аренды: ".convertDateFormat($result['date']));
$pdf->Ln();
$pdf->Write(6, "1.3.3. Количество полных дней аренды: ".$result['days']." (".numberToString($result['days']).")");
$pdf->Ln();
$pdf->Write(6, "1.3.4. Итоговая стоимость аренды: ".$result['total_cost']." руб. (".num2str($result['total_cost']).")");

$pdf->Ln(20);
$pdf->Cell(0, 15, "_______________________________", 0, 0, "L");
$pdf->Cell(0, 15, "_______________________________", 0, 0, "R");
$pdf->Ln();
$pdf->Cell(0, 0, "Подпись представителя компании", 0, 0, "L");
$pdf->Cell(0, 0, "Подпись клиента", 0, 0, "R");


$pdf->Output('Dogovor arendi ot '.$result['contract'].'.pdf', 'D');

//echo json_encode($status);
?>