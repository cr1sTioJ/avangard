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
$id = $_POST['id'];
$serial = $_POST['serial'];

$sql = "
    INSERT INTO `Boats` (`serial`, `id`, `active`) 
    VALUES (
        '$serial',
        $id,
        1
    )
";

$insert_result = $db->Do($sql);

if ($insert_result)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Серийный номер был внесен в базу данных';
    $status['serial'] = $serial;
}
else
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось внести серийный номер в базу данных';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>