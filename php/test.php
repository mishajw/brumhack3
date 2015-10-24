<?php


   if(isset($_FILES['image'])){
    $errors= array();
    $file_name = $_FILES['image']['name'];
    $file_size =$_FILES['image']['size'];
    $file_tmp =$_FILES['image']['tmp_name'];
    $file_type=$_FILES['image']['type'];
    $file_ext=strtolower(end(explode('.',$_FILES['image']['name'])));
    
      
    move_uploaded_file($file_tmp,"images/".$file_name);
	
	echo $_SERVER['SERVER_NAME']."images/".$file_name;
   }
   else
   {
	   echo "No file supplied!";
   }
   
?>