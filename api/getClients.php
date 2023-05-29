<?php
require_once("/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/lib/MySQL.php");

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
    return;
}

$sql = "";
$id = $_GET['id'];

if ($id == "")
{
    $sql = "SELECT * FROM Clients";
    $clients = $db->Select($sql);
    echo json_encode($clients, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
else
{
    $sql = "SELECT * FROM Clients WHERE id=$id";
    $client_info = $db->Select($sql)[0];
    echo json_encode($client_info, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

?>