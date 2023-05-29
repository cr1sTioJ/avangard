<?php
require_once("/var/www/u154150/data/www/cr1stioj.rustdev.ru/html/lib/MySQL.php");

$db = new MySQL();

$db->Connect(
    'localhost',
	'u154150_yachtrent',
	'mF8cE5dU7c',
    'u154150_yachtrent'
);

$name = $_GET['name'];
$result = [];

$sql = "SELECT * FROM BoatsGeneral ";

if ($name)
{
    $sql .= "WHERE name='$name'";
}

$sql .= " ORDER BY cost";

$boats = $db->Select($sql);

for ($i = 0; $i < count($boats); $i++)
{
    $serials = $db->Select("SELECT serial, active FROM Boats WHERE id = ".$boats[$i]['id']." ORDER BY active");
    $boats[$i]['serials'] = $serials;
}

if ($name) 
{
    echo json_encode($boats[0]);
}
else 
{
    echo json_encode($boats);
}
?>