var userLatitude, userLongitude, 
oUserGeoPoint=
{
	latitude: 0,
	longitude: 0
},
parse_UserGeoPoint, google_UserGeoPoint= null,
bInUSorUK= true;


function setMapToGeoPoint(map_canvas, google_geoPoint, bSE_Map_Page)
{
	$(map_canvas).gmap('option', 'center', google_geoPoint);
	var zoom_level= 11;
	if(bSE_Map_Page)
	{
		zoom_level= 13;
	}
	else if(SE_Category === 'Washington DC/Baltimore')
	{
		zoom_level= 9;
	}
	else if(primary_page_type == const_countries)
	{
		zoom_level= selected_primary_country.ZoomLevel;
	}
	$(map_canvas).gmap('option', 'zoom', zoom_level);
	bMapLoaded= true;
}


function addMapLocationMarker(map_canvas, google_GeoPoint, bIsUserLocation, SE_forMapMarker, bOpenInfoWindow)
{
	if(bIsUserLocation)
	{
		$(map_canvas).gmap('addMarker', {'title': 'You', 'position': google_GeoPoint, 'bounds': false});
	}
	else
	{
		var shadow = new google.maps.MarkerImage('Images/shadow-SI_MapMarker.png',
										        new google.maps.Size(47.0, 43.0),
										        new google.maps.Point(0, 0),
										        new google.maps.Point(12.0, 21.0));
		var image = new google.maps.MarkerImage('Images/SI_MapMarker.png',
										        new google.maps.Size(25.0, 43.0),
										        new google.maps.Point(0, 0),
										        new google.maps.Point(12.0, 21.0));
		var seName= SE_forMapMarker.Name;
		var markerOptions=
		{
			'title': seName,
			'position': google_GeoPoint, 
			'bounds': false,
			'icon' : image,
			'shadow': shadow
		}
		var infoHTML=
		'<div id="mapInfoWindow_name" style="font-size:25px;">' + seName + '</div>'
		+'<div id="mapInfoWindow_content" style="color:#666;">' + SE_forMapMarker.Location + '<br/>';

		if(parse_UserGeoPoint != null && parse_UserGeoPoint != undefined)
		{  
			var seGeoLocation= new Parse.GeoPoint({latitude:SE_forMapMarker.Latitude, longitude:SE_forMapMarker.Longitude});

			if(bInUSorUK)
			{
				infoHTML+= 
				'<p>'  
					+ (Math.round(seGeoLocation.milesTo(parse_UserGeoPoint) * 10) / 10) 
				+' Miles</p>';
			}
			else
			{
				infoHTML+= 
				'<p>'  
					+ (Math.round(seGeoLocation.kilometersTo(parse_UserGeoPoint) * 10) / 10)
				+' Kilometers</p>';
			}
		}
		
		infoHTML+='</div>';

		if(map_canvas === '#bp_map_canvas')
		{
			infoHTML=
			'<table id="mapInfoWindow_table">'
				  + '<tr>' 
					  + '<td>' 
						  + infoHTML
					  + '</td>'
					  + '<td><img src="Images/rightArrowButton.png" width="40px" onclick="infoWindowArrowClicked()" style="cursor: pointer;" /></td>'
				  + '</tr>'
			+ '</table>';
		}

		var mapMarker= $(map_canvas).gmap('addMarker', markerOptions);
		mapMarker.click(function() 
		{
			SE_forBusinessPage= SE_forMapMarker;
	        $(map_canvas).gmap('openInfoWindow', {'content': infoHTML, 'maxWidth': '200px'}, this);
	    });
	    if(bOpenInfoWindow)
	    {
	    	SE_forBusinessPage= SE_forMapMarker;
	    	setTimeout(function()
			{
				$(map_canvas).gmap('openInfoWindow', {'content': infoHTML, 'maxWidth': '200px'}, mapMarker);
			}, 500);
	    }
	}	
}


function infoWindowArrowClicked(map_canvas)
{
	$.mobile.changePage( "#businessPage", { transition: "none"} );
}