<?php
	include "../../php/connect.php";

	metroAreas_Main();	

	//------------------------------------------------------

	function metroAreas_Main()
	{

		$mysqli= connectTo_SocialImpact_Database();
		$aMetroAreas= getMetroAreas($mysqli);
		if(!$aMetroAreas)
		{
			echo -1;
			$mysqli->close();
			exit();
		}

		$mysqli->close();
		echo json_encode(array('MetroAreas' => $aMetroAreas));
	}



	function getMetroAreas($mysqli)
	{
		$query_str= "SELECT Name
					 FROM MetroAreas
					 ORDER BY Name";

		$query_prepared = $mysqli->stmt_init();
		if($query_prepared && $query_prepared->prepare($query_str))
		{
			$query_prepared->execute();
			$query_prepared->bind_result($name);

			$aMetroAreas = array();
			while($query_prepared->fetch())
			{
				array_push($aMetroAreas, $name);
			}
			$query_prepared->close();
		}
		return $aMetroAreas;
	}
?>



