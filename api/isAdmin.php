<?php

$result;

session_start();

if ($_SESSION['user_id'] == -1)
{
    $result['is_admin'] = true;
}
else 
{
    $result['is_admin'] = false;
}

echo json_encode($result);
?>