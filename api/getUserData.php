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

$result = [];

if (isset($_SESSION['user_id']) && $_SESSION['user_id'] != -1)
{
    $user_id = $_SESSION['user_id'];
    $sql = "
        SELECT 
            last_name,
            first_name,
            middle_name,
            dob,
            passport,
            reg_place,
            orders,
            telephone,
            email
        FROM Clients
        WHERE id=$user_id
    ";

    $user_data = $db->Select($sql)[0];
    $discount = $db->Select("SELECT discount FROM Discounts WHERE orders=".$user_data['orders'])[0]['discount'];

    $sql = "
        SELECT
            Rents.id as rent_id,
            BoatsGeneral.name as boat,
            CONCAT(Captains.last_name, ' ', LEFT(Captains.first_name, 1), '.', IF(Captains.middle_name='', '', CONCAT(LEFT(Captains.middle_name, 1), '.'))) AS captain,
            Rents.date,
            Rents.days,
            Rents.total_cost
        FROM Rents
        INNER JOIN Boats
            ON Rents.boat = Boats.serial
        INNER JOIN BoatsGeneral
            ON Boats.id = BoatsGeneral.id
        INNER JOIN Captains
            ON Rents.captain = Captains.id
        WHERE 
            client = $user_id
            AND canceled = 0
        ORDER BY Rents.date
    ";

    $rents = $db->Select($sql);

    $result['status']       = 'ok';
    $result['first_name']   = $user_data['first_name'];
    $result['last_name']    = $user_data['last_name'];
    $result['middle_name']  = $user_data['middle_name'];
    $result['dob']          = $user_data['dob'];
    $result['passport']     = $user_data['passport'];
    $result['reg_place']    = $user_data['reg_place'];
    $result['orders']       = $user_data['orders'];  
    $result['telephone']    = $user_data['telephone'];   
    $result['email']        = $user_data['email'];
    $result['discount']     = $discount;
    $result['rents']        = $rents;    
}
else
{
    $result['status'] = 'error';
    $result['msg'] = 'Пользователь не авторизован';
}

echo json_encode($result);
?>