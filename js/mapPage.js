$(document).on('pageinit', '#mapPage', function(event, ui)
{
	setupSearch('#mp_searchInput', '#mp_searchInputHeader');
	
});

$(document).on("pageshow", "#mapPage", function(event, ui) 
{
	if(SE_forBusinessPage == null)
	{
		$.mobile.changePage('#home_page');
		return;
	}

	var SE_GoogleGeoLocation, SE_GeoLocation= new Parse.GeoPoint(SE_forBusinessPage.Latitude, SE_forBusinessPage.Longitude);

	if(SE_GeoLocation != undefined && SE_GeoLocation != null)
	{
		SE_GoogleGeoLocation= new google.maps.LatLng(SE_GeoLocation.latitude, SE_GeoLocation.longitude);
	}
	else
	{
		si_log('mapPage.js:: pageshow:: if(SE_GeoLocation != undefined || SE_GeoLocation != null)');
	}


	if(SE_GoogleGeoLocation != undefined && SE_GoogleGeoLocation != null)
	{
		setMapToGeoPoint('#mp_map_canvas', SE_GoogleGeoLocation, true);	
	}
	else
	{
		si_log('mapPage.js:: pagecreate:: !SE_GoogleGeoLocation');
		$.mobile.changePage('#home_page')
	}
	$('#mp_map_canvas').gmap('clear', 'markers');
	$('#mp_map_canvas').gmap('closeInfoWindow');
	resizeMapCanvas_mp();

	setTimeout(function() 
	{
		addMapLocationMarker('#mp_map_canvas', SE_GoogleGeoLocation, false, SE_forBusinessPage, true);	
	}, 1000);

	pageshowGoogleAnalytics();
});

$(document).on('pagebeforehide', '#mapPage', function(e)
{
	bCameFromMapPage= true;
});

function resizeMapCanvas_mp()
{
	var viewport_height= $(window).height(),
        header_height= $('#mp_header').height(),
		content_height= viewport_height - header_height;
	if(isiPhoneSafari()){content_height+= 60;}
	$('#mp_map_canvas').css("height", content_height);
	$('#mp_map_canvas').gmap('refresh');	
}