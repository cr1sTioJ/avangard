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

$id = $data['id'];
$status = [];

if (empty($db->Select("SELECT Rents.id FROM Rents WHERE Rents.id=$id AND Rents.date >= CURRENT_DATE()")))
{
    $status['status'] = 'error';
    $status['msg'] = 'Вы не можете отменить данный заказ';
    echo json_encode($status, JSON_UNESCAPED_UNICODE);
    return;
}

$sql = "
    UPDATE Rents
    SET
        canceled=1,
        cancel_time=CURRENT_TIMESTAMP()
    WHERE 
        Rents.id = $id
";

$result = $db->Do($sql);

if ($result)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Заказ успешно отменен';
}
else
{
    $status['status'] = 'error';
    $status['msg'] = 'При отмене заказа произошла ошибка';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>