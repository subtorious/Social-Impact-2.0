<?php
	include "../../php/connect.php";

	submitSE_Main();	

	//------------------------------------------------------

	function submitSE_Main()
	{
		$mysqli= connectTo_SocialImpact_Database();
		$success= submitSE($mysqli);
		$mysqli->close();
		echo $success;
	}


	function submitSE($mysqli)
	{
		$date= date("Y-m-d_H-i-s");
		$query_str= "INSERT INTO Pending_SE
					 (Categories, ContactEmail, ContactName, Details, Latitude, Longitude, Hours, 
					  Location, MetroArea, Name, Phone, Photo, ShopOnline, SocialImpact, Website, usersID, updatedAt)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

		$query_prepared = $mysqli->stmt_init();
		if($query_prepared && $query_prepared->prepare($query_str))
		{
			$query_prepared->bind_param("ssssddssssssissss", $_POST['Categories'], $_POST['ContactEmail'], $_POST['ContactName'], $_POST['Details'], $_POST['Latitude'], $_POST['Longitude'], $_POST['Hours'], $_POST['Location'], $_POST['MetroArea'], $_POST['Name'], $_POST['Phone'], $_POST['Photo'], $_POST['ShopOnline'], $_POST['SocialImpact'], $_POST['Website'], $_POST['usersID'], $date);
			if($query_prepared->execute())
			{
				$success= 0;
			}
			else 
			{
				$success= -1;
			}			
			$query_prepared->close();
			return $success;
		}
		return -1;
	}
?>



