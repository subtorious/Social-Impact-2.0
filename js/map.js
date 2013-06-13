var userLatitude, userLongitude, 
oUserGeoPoint=
{
	latitude: 0,
	longitude: 0
},
parse_UserGeoPoint, google_UserGeoPoint= null,
bInUSorUK= true,
bAddedZoom_DragEvents= false,
bProgrammicMapZoom= false,
bMapBoundsChanged= false,
bRepopulatingMap= false,
pMapBounds= new MapBounds();

function MapBounds()
{
	var previousBounds= null;
	var currentBounds= null;
	var that= this;

	this.setBoundsForCanvas= function(map_canvas)
	{
		var pMap= $(map_canvas).gmap('get', 'map');
		if(pMap == null || pMap == undefined)
		{
			si_log('map.js:: MapBounds():: if(pMap == null || pMap == undefined)');
			return; 
		}
		var pBounds= pMap.getBounds();
		if(pBounds == null || pBounds == undefined)
		{
			si_log('map.js:: MapBounds():: if(pBounds == null || pBounds == undefined)');
			return; 
		}

		if(previousBounds == null)
		{
			previousBounds= pBounds;
		}
		else
		{
			previousBounds= currentBounds;
		}
		currentBounds= pBounds;
	}
	this.zoomedOut= function()
	{
		if(previousBounds == null || currentBounds == null)
		{
			si_log('map.js:: MapBound():: if(previousBounds == null || currentBounds == null)');
			return false;
		}

		var previousLatDiff= Math.abs(previousBounds.getNorthEast().lat() - previousBounds.getSouthWest().lat());
		var previousLongDiff= Math.abs(previousBounds.getNorthEast().lng() - previousBounds.getSouthWest().lng());
		var currentLatDiff= Math.abs(currentBounds.getNorthEast().lat() - currentBounds.getSouthWest().lat());
		var currentLongDiff= Math.abs(currentBounds.getNorthEast().lng() - currentBounds.getSouthWest().lng());
		
		if(((currentLatDiff - previousLatDiff) > 0) || ((currentLongDiff - previousLongDiff) > 0))
		{
			return true;
		}
		return false;
	}
	this.getCurrentBounds= function()
	{
		return currentBounds;
	}
}


function setMapToGeoPoint(map_canvas, google_geoPoint, bSE_Map_Page)
{
	$('#repopulateMapButton').css('visibility', 'hidden');

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
	else if(primary_page_type == const_countries && bCameFromPrimaryPage)
	{
		zoom_level= selected_primary_country.ZoomLevel;
	}
	$(map_canvas).gmap('option', 'zoom', zoom_level);
	bMapLoaded= true;

	if(!bAddedZoom_DragEvents)
	{
		bAddedZoom_DragEvents= true;
		bProgrammicMapZoom= false;
		google.maps.event.addListener($(map_canvas).gmap('get', 'map'), 'zoom_changed', function() 
		{
			if(bProgrammicMapZoom)
			{
				bProgrammicMapZoom= false;
		 		return;
		 	}
		 	if(b_NearbyListings)
		 	{
		 		pMapBounds.setBoundsForCanvas(map_canvas);
			 	if(pMapBounds.zoomedOut())
			 	{
			 		$('#repopulateMapButton').css('visibility', 'visible');
			 	}	
		 	}
		 	
		});

		google.maps.event.addListener($(map_canvas).gmap('get', 'map'), 'dragend', function() 
		{
		 	if(b_NearbyListings)
		 	{
		 		pMapBounds.setBoundsForCanvas(map_canvas);
			 	$('#repopulateMapButton').css('visibility', 'visible');
		 	}
		});

		setTimeout(function(){pMapBounds.setBoundsForCanvas(map_canvas)}, 1000);		
	}
}



function repopulateMapButtonPressed()
{
	bRepopulatingMap= true;
	$('#repopulateMapButton').css('visibility', 'hidden');
	hideBusinessListPage();
	$.mobile.loading('show',
	{
		text: '',
		textVisible: true,
		theme: 'a'
	});

	var currentBounds= pMapBounds.getCurrentBounds();
	var minLat= currentBounds.getSouthWest().lat();
	var maxLat= currentBounds.getNorthEast().lat();
	var minLong= currentBounds.getSouthWest().lng();
	var maxLong= currentBounds.getNorthEast().lng();

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getSEs_forBounds.php'),
	    data: 
	    { 
	    	minLat: minLat,
	    	maxLat: maxLat,
	    	minLong: minLong,
	    	maxLong: maxLong,
	    	category: SE_Category
		},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200)
		    {
		    	if(oXMLHttpRequest.responseText != -1)
		    	{
		    		var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
					if(jsonResponse != null)
					{
						aSEs_RepopMap= jsonResponse['SEs'];
						if(aSEs_RepopMap != null && aSEs_RepopMap != undefined)
						{
							var seGeoLocation, se, seLatitude, seLongitude;
							for(var i=0; i<aSEs_RepopMap.length; ++i)
							{
								se= aSEs_RepopMap[i];
								seLatitude= se.Latitude;
								seLongitude= se.Longitude;
								if(seLatitude != null && seLongitude != null && seLatitude != undefined && seLongitude != undefined)
								{
									seGeoLocation= new Parse.GeoPoint({latitude: seLatitude, longitude: seLongitude});
									aSEs_RepopMap[i].DistanceToUser= seGeoLocation.milesTo(parse_UserGeoPoint);	
								}							
							}
							aSEs_RepopMap.sort(compareKey('DistanceToUser'));
						}
						else
						{
							si_log('map.js:: repopulateMapButtonPressed():: if(aSEs_RepopMap != null && aSEs_RepopMap != undefined)');
						}
					}
					else
					{
						si_log('map.js:: repopulateMapButtonPressed:: !results');
					}
		    	}			    	
		    }

			setupMap_ListingsPage();
		    showBusinessListPage();
			bRepopulatingMap= false;
		}							   
	});

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