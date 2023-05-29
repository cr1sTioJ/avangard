<?php
require_once("/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/lib/MySQL.php");

session_start();

$result = [];

$result['user_id'] = $_SESSION['user_id'];
$result['first_name'] = $_SESSION['first_name'];

echo json_encode($result);
?>