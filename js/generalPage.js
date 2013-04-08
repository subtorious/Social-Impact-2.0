// $(document).on('pageinit','[data-role=page]', function()
// {
//     $('[data-position=fixed]').fixedtoolbar({ tapToggle:false});
// });

$(window).resize(function() 
{
	if(timeout_ResizePage)
	{
		clearTimeout(timeout_ResizePage);
	}
	timeout_ResizePage= setTimeout(function() 
	{
		timeout_ResizePage= undefined;
		if($.mobile.activePage[0].id === 'businessListPage'){resizeMapCanvas_bp();}
		else if($.mobile.activePage[0].id === 'mapPage'){resizeMapCanvas_mp();}
	}, 1000);
});



// Changes to #home_page when upon reload or arriving on non-home/welcome page. 
function needHomePageRedirect()
{
	if(window.location != undefined)
	{
		var pageID= getCurrentPageID();
		if( window.firstload === undefined 
			&& (strcmp(pageID, '#home_page') != const_StringsEqual)
			&& (strcmp(pageID, '') != const_StringsEqual))
		{
			console.log('needHomePageRedirect');
			$.mobile.changePage('#home_page');
			return true;
		}
	}	
	return false;
}

// Google Analtyics 
var _gaq = _gaq || [];
(function() 
{
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


$(document).on('pagebeforecreate', function(e)
{
	if(getBaseLocationHash() === '#businessPage' && $.urlParam('se') != -1 && !bBusinessPageActive)
	{
		if(bBusinessPage_LoadedFromParam)
		{
			return;
		}

		bBusinessPage_LoadedFromParam= true;
		SE_ID_fromHash= $.urlParam('se');
		$.mobile.changePage('#businessPage');
	}
	else
	{
		bBusinessPage_LoadedFromParam= false;
	}
});





