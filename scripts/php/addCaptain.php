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

$last_name      = $_POST['last_name'];
$first_name     = $_POST['first_name'];
$middle_name    = $_POST['middle_name'];
$dob            = $_POST['dob'];
$passport       = $_POST['passport'];
$reg_place      = $_POST['reg_place'];
$telephone      = $_POST['telephone'];
$email          = $_POST['email'];
$license_num    = $_POST['license_num'];
$license_date   = $_POST['license_date'];
$cost           = $_POST['cost'];
$reg_place      = $_POST['reg_place'];

$dob_unix = strtotime($dob);
$now_date_unix = strtotime(date('d.m.Y'));
$years = ($now_date_unix - $dob_unix) / YEAR;
$years = floor($years);

if ($years < 18)
{
    $status['status'] = 'error';
    $status['msg'] = "Возраст капитана должен быть не менее 18 лет";
    echo json_encode($status, JSON_UNESCAPED_UNICODE);
    return;
}

$sql = "
INSERT INTO `Captains`
    VALUES (
        null,
        '$last_name',
        '$first_name',
        '$middle_name',
        '$dob',
        '$passport',
        $cost,
        '$license_num',
        '$license_date',
        '$reg_place',
        '$telephone',
        '$email',
        1
    )
";

$insert_result = $db->Do($sql);

if ($insert_result)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Новый капитан успешно добавлен в список';
}
else
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось добавить капитана. Повторите попытку позже';
}


echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>