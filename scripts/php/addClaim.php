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

$id = $_POST['rent'];
$status = [];

//Saving claim file
$name_parts = pathinfo($_FILES['file']['name']);
$extension = $name_parts['extension'];
$tmp_path = $_FILES['file']['tmp_name'];
$file_name = $id.'_'.date('d-m-Y H-i-s').'.'.$extension;
$main_path = '/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/avangard/claims/'.$file_name;
$copy_result = copy($tmp_path, $main_path);

if (!$copy_result)
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось сохранить файл с претензией';
    echo json_encode($status);
    return;
}

$sql = "INSERT INTO `Claims` (rent, file) VALUES ($id, '$file_name')";

$result = $db->Do($sql);

if ($result)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Файл был успешно сохранен';
}
else
{
    $status['status'] = 'error';
    $status['msg'] = 'Произошла ошибка при внесении данных в БД';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);

?>