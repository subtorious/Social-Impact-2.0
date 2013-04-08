$(document).on('pagecreate', '#SE_Login_Page', function(e)
{
	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
});

$(document).on('pageinit', '#SE_Login_Page', function(e)
{
	$('#SE_LoginPage_Logout').css('visibility', 'hidden');
});

$(document).on('pageshow', '#SE_Login_Page', function(e)
{
	if(Parse.User.current())
	{
		$.mobile.changePage('#SE_List_Page');
	}
});


function login()
{	
	Parse.User.logIn($('#username_input').attr('value'), $('#password_input').attr('value'), 
	{
		success: function(user) 
		{
			$.mobile.changePage('#SE_List_Page');
		},
		error: function(user, error) 
		{
			alert('Error with login. Please try again or contact Mark.');
		}
	});
}


function logout()
{
	Parse.User.logOut();
	window.location= 'http://socialimpactapp.com/se_validation/#SE_Login_Page';
}