<?php
require_once("/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/lib/MySQL.php");

if (!isset($_REQUEST)) return;

$db = new MySQL();

$db->Connect(
    'localhost',
	'u154150_yachtrent',
	'mF8cE5dU7c',
    'u154150_yachtrent'
);

session_start();
if ($_SESSION['user_id'] != -1)
{
    $status['status'] = 'error';
    $status['msg'] = 'Доступ запрещен';
    echo json_encode($status, JSON_UNESCAPED_UNICODE);
    return;
}

$status = [];

$name       = $_POST['name'];
$cost       = $_POST['cost'];
$speed      = $_POST['speed'];
$capacity   = $_POST['capacity'];
$cabins     = $_POST['cabins'];
$water      = $_POST['water'];
$fuel       = $_POST['fuel'];
$draught    = $_POST['draught'];
$length     = $_POST['length'];

// Saving boat's image
$name_parts = pathinfo($_FILES['file']['name']);
$extension = $name_parts['extension'];
$photo_tmp_path = $_FILES['file']['tmp_name'];
$photo_main_path = '/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/avangard/img/boats/'.$_POST['name'].'.'.$extension;
$copy_result = copy($photo_tmp_path, $photo_main_path);

if (!$copy_result)
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось сохранить изображение судна';
    echo json_encode($status);
    return;
}

$img_pos = strpos($photo_main_path, 'img');
$img = './'.substr($photo_main_path, $img_pos);

$sql = "
    INSERT INTO BoatsGeneral
    VALUES(
        null,
        '$name',
        0,
        $cost,
        $speed,
        $capacity,
        $cabins,
        $water,
        $fuel,
        $length,
        $draught,
       '$img',
       1
    )
";

$insert_result = $db->Do($sql);

if (!$insert_result)
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось внести информацию о судне в базу данных. Проверьте, нет ли судов с таким же названием';
}
else
{
    $status['status'] = 'ok';
    $status['msg'] = 'Новое судно успешно добавлено в базу данных';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>