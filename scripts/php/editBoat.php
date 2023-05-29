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

$id         = $_POST['id'];
$name       = $_POST['name'];
$cost       = $_POST['cost'];
$speed      = $_POST['speed'];
$capacity   = $_POST['capacity'];
$cabins     = $_POST['cabins'];
$water      = $_POST['water'];
$fuel       = $_POST['fuel'];
$draught    = $_POST['draught'];
$length     = $_POST['length'];
$img        = $_POST['img'];

// Saving boat's image
if ($_FILES['file']['name'])
{
    $name_parts = pathinfo($_FILES['file']['name']);
    $extension = $name_parts['extension'];
    $photo_tmp_path = $_FILES['file']['tmp_name'];
    $photo_main_path = '/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/avangard/img/boats/'.$_POST['name'].'.'.$extension;
    $copy_result = copy($photo_tmp_path, $photo_main_path);

    $img_pos = strpos($photo_main_path, 'img');
    $img = './'.substr($photo_main_path, $img_pos);
}

$sql = "
    UPDATE `BoatsGeneral`
    SET `name`='$name',
        `cost`=$cost,
        `speed`=$speed,
        `capacity`=$capacity,
        `cabins`=$cabins,
        `water`=$water,
        `fuel`=$fuel,
        `length`=$length,
        `draught`=$draught,
        `img`='$img'
    WHERE `id`=$id
";

$update_result = $db->Do($sql);

if ($update_result)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Данные о судне успешно обновлены!';
}
else
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось обновить информацию о судне. Проверьте, не указано ли существующее имя судна';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>