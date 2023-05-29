<?php

class MySQL
{
    private $link;
    private $last_select;

    public function Connect($host, $user, $password, $name)
    {
        $this->link = mysqli_connect($host, $user, $password, $name);
        if ($this->link)
        {
            mysqli_set_charset($this->link, "utf8");
        }
        else echo "Can't connect the database<br>".mysqli_connect_error();

        return $this->link;
    }

    public function GetNumRows()
    {
        if (isset($this->last_select)) return $this->last_select->num_rows;
        else return 0;
    }

    public function Select($sql)
    {
        $result = mysqli_query($this->link, $sql);
        $this->last_select = $result;
        $result = mysqli_fetch_all($result, MYSQLI_ASSOC);
        return $result;
    }

    public function Do($sql)
    {
        $result = mysqli_query($this->link, $sql);
        return $result;
    }

    public function DoMany($sqls){
        $query = '';

        foreach ($sqls as $sql)
        {
            $query .= $sql.';';
        }
        $result = mysqli_multi_query($this->link, $query);
        return $result;
    }
}
?>