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

$data = json_decode(file_get_contents('php://input'), true);

$file = $data['file'];
$status = [];

$sql = "DELETE FROM Claims WHERE file='$file'";

$result = $db->Do($sql);

if ($result)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Файл был успешно удален';
    unlink('/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/avangard/claims/'.$file);
}
else 
{
    $status['status'] = 'error';
    $status['msg'] = 'При удалении файла произошла ошибка';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>