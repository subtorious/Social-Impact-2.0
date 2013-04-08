var CONST_RETURN_KEYCODE= 13;

$(document).on('pagecreate', '#SE_Signup_Page', function(e)
{
	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
});

$(document).on('pageinit', '#SE_Signup_Page', function(e)
{
	$('#password_signup_input').on('keyup', function(e) 
	{
	    if(e.which === CONST_RETURN_KEYCODE)
		{
			signup();
		}
	});	
});


$(document).on('pageshow', '#SE_Signup_Page', function(e)
{
	if(Parse.User.current())
	{
		$.mobile.changePage('#AddABusinessPage');
	}

	$('#signup_problem_text').css('visibility', 'hidden');
});


$(document).on('pageinit', '#SE_Login_Page', function(e)
{
	$('#password_login_input').on('keyup', function(e) 
	{
	    if(e.which === CONST_RETURN_KEYCODE)
		{
			login();
		}
	});	
});



function login()
{
	Parse.User.logIn($('#username_login_input').attr('value'), $('#password_login_input').attr('value'), 
	{
		success: function(user) 
		{
			$.mobile.changePage('#AddABusinessPage');
		},
		error: function(user, error) 
		{
			alert("Error: " + error.code + " " + error.message);
			$('#login_problem_text').css('visibility', 'visible');
		}
	});
}

function signup()
{
	var user = new Parse.User();
	user.set("username", $('#username_signup_input').attr('value'));
	user.set("password", $('#password_signup_input').attr('value'));
	user.set("email", $('#username_signup_input').attr('value'));	 
	user.signUp(null, 
	{
		success: function(user) 
		{
			$.mobile.changePage('#AddABusinessPage');
		},
		error: function(user, error) 
		{
			alert("Error: " + error.code + " " + error.message);
			$('#signup_problem_text').css('visibility', 'visible');
		}
	});
}


function logout()
{
	Parse.User.logOut();
	$.mobile.changePage('#SE_Signup_Page');
}



