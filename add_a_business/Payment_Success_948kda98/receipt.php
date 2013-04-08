<?php
	$to = $_POST['ContactEmail'];
	$subject = 'Social Impact App Receipt';
	$message = "Thank you for your payment and for listing your social enterprise on Social Impact App. 
				If you have any questions, please contact rolfe@socialimpactapp.com.\n\n"
				. ' Name: ' . $_POST['Name']
		    	."\n Categories: " . $_POST['Categories']
		    	."\n Details: " . $_POST['Details']
		    	."\n SocialImpact: " . $_POST['SocialImpact']
		    	."\n Location: " . $_POST['Location']
		    	."\n MetroArea: " . $_POST['MetroArea']
		    	."\n Hours: " . $_POST['Hours']
		    	."\n Phone: " . $_POST['Phone']
		    	."\n Website: " . $_POST['Website'];
	$from = "payments@socialimpactapp.com";
	$headers = "From:" . $from;
	if(mail($to,$subject,$message,$headers))
	{	
		echo 'Email Sent to ' . $_POST['ContactEmail']; 
	}
	else
	{
		echo 'Failed to send email.';
	};
?>