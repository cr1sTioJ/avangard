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
$id = $_GET['id'];

$sql = '
    SELECT
        Rents.id,
        Rents.client AS client_id,
        Rents.captain AS captain_id,
        Rents.boat,
        BoatsGeneral.name,
        CONCAT(Clients.last_name, " ", LEFT(Clients.first_name, 1), ".",  IF(Clients.middle_name != "", CONCAT(LEFT(Clients.middle_name, 1), "."), "")) AS client,
        CONCAT(Captains.last_name, " ", LEFT(Captains.first_name, 1), ".", IF(Captains.middle_name != "", CONCAT(LEFT(Captains.middle_name, 1), "."), "")) AS captain,
        Rents.contract,
        Rents.date,
        Rents.days,
        Rents.total_cost,
        Rents.canceled,
        Rents.cancel_time,
        Rents.has_problem
    FROM BoatsGeneral
    INNER JOIN Boats
        ON BoatsGeneral.id = Boats.id
    INNER JOIN Rents
        ON Rents.boat = Boats.serial
    INNER JOIN Captains
        ON Captains.id = Rents.captain
    INNER JOIN Clients
        ON Clients.id = Rents.client
';


if ($id != "")
{
    $sql .= "\nWHERE Rents.id=$id";
}

$sql .= "\nORDER BY Rents.canceled, Rents.date";

$result = $db->Select($sql);

for ($i = 0; $i < count($result); $i++)
{
    $claims = $db->Select("SELECT * FROM Claims WHERE rent=".$result[$i]['id']);
    $list = [];
    for ($j = 0; $j < count($claims); $j++)
    {
        $list[]['file'] = $claims[$j]['file'];
    }
    $result[$i]['claims'] = $list;
}



if ($id != '') echo json_encode($result[0], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
else echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

?>