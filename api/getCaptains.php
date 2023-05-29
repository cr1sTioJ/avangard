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
    $sql = "SELECT * FROM Captains ORDER BY active DESC";
    $captains = $db->Select($sql);
    echo json_encode($captains, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
else
{
    $sql = "SELECT * FROM Captains WHERE id=$id ORDER BY active DESC";
    $captain_info = $db->Select($sql)[0];
    echo json_encode($captain_info, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

?>