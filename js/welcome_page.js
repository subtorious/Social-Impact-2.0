$(document).on("pageshow", "#welcome_page" , function(event) 
{			
	if(bBusinessPage_LoadedFromParam)
	{
		return;
	}

	$('#versionLabelWelcomePage').html(appVersion);

	$('#welome_icon').load(function() 
	{
		$('#welome_icon').css('animation', 'welome_icon 3s ease-out 0s');
		$('#welome_icon').css('-moz-animation', 'welome_icon 3s ease-out 0s');
		$('#welome_icon').css('-webkit-animation', 'welome_icon 3s ease-out 0s');
		$('#welome_icon').css('-o-animation', 'welome_icon 3s ease-out 0s');
		setTimeout(function(){$.mobile.changePage( "#home_page", { transition: "none"} );}, 3000);	
	});

	
	pageshowGoogleAnalytics();
});