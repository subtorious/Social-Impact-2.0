<?php
    $allowedExts = array("gif", "jpeg", "jpg", "png");
    $aFileName= explode(".", $_FILES["file"]["name"]);
    $fileName= $aFileName[0];
    $extension = end($aFileName);

    if((($_FILES["file"]["type"] == "image/gif")
      ||($_FILES["file"]["type"] == "image/jpeg")
      ||($_FILES["file"]["type"] == "image/jpg")
      ||($_FILES["file"]["type"] == "image/png"))
      &&($_FILES["file"]["size"] < 20000)
      && in_array($extension, $allowedExts))
    {
        if ($_FILES["file"]["error"] > 0)
        {
            echo -1;
        }
        else
        {
            // echo "Upload: " . $_FILES["file"]["name"] . "\n";
            // echo "Type: " . $_FILES["file"]["type"] . "\n";
            // echo "Size: " . ($_FILES["file"]["size"] / 1024) . " kB\n";
            // echo "Temp file: " . $_FILES["file"]["tmp_name"] . "\n";
           
            $fileName= $fileName . "_" . date("Y-m-d_H-i-s") . '.' . $extension;
            $file_path= "http://www.socialimpactapp.com/se_images/" . $fileName; //"../../se_images/" . $fileName;           

            if(file_exists($file_path))
            {
                echo realpath($file_path);
            }
            else
            {                
                if(move_uploaded_file($_FILES["file"]["tmp_name"], $file_path))
                {
                    echo $file_path;//"http://www.socialimpactapp.com/se_images/" . $fileName;
                }
                else
                {
                    echo -1;
                }
            }
        }
    }
    else
    {
        echo "Invalid file";
    }
?>