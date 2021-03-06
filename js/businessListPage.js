var SE_Category, lastSE_Category,
	CONST_CONTENT_HEIGHT_TRIM= 25,
    b_ListingButtonToggleOn= true,
    b_NearbyListings= false,
    b_MetroAreaListings= false,
    b_SearchListings= false,
    b_OnlineListings= false,
	CONST_LISTINGS_BUTTON_PADDING_TOP= 8,
	CONST_LISTINGS_BUTTON_PADDING_BOTTOM= 4,
	cstr_LISTING= 'Listings',
	timeout_ResizePage,
	CONST_NEARBY_RADIUS= 30,
	aSEs_Nearby= undefined,
	aSEs_RepopMap= undefined,
    aCategoriesIn_NearbySEs= undefined,
    aSEs_MetroArea= undefined, selected_primaryArea, aSEs_Primary= undefined,
    aSEs_Online= undefined,
	aOnline_Categories= undefined,
	lastScrollPos= 0, bGoToLastScrollPos= false,
	bCameFromPrimaryPage= false;


$(document).on("pagecreate", "#businessListPage", function(event, ui) 
{	
	if(google_UserGeoPoint == null || google_UserGeoPoint == undefined)
	{
		$.mobile.changePage('#home_page');
	}

	$('#businessList_ListingsButton_li').on('click', function(event, ui) 
	{
		if(b_ListingButtonToggleOn)
		{
			b_ListingButtonToggleOn= false;
			setListingsButtonTo_DownPos();
		}		
		else
		{
			b_ListingButtonToggleOn= true;
			setListingsButtonTo_UpPos();
		}
	});
});


$(document).on('pageinit', '#businessListPage', function(event, ui)
{
	setupSearch('#searchInput_businessListPage', '#blp_searchInputHeader');
});



$(document).on('pagebeforeshow', '#businessListPage', function(event, ui)
{
  	hideBusinessListPage();
	bCameFromPrimaryPage= false;
});


$(document).on("pageshow", "#businessListPage", function(event, ui) 
{
	if(bSearching)
	{
		$('#searchInput_businessListPage').attr('value', searchString);	
		showSearching();
		searchSI_Database();		
	}
	else
	{
		$.mobile.loading('show',
		{
			text: '',
			textVisible: true,
			theme: 'a'
		});
	}

	setupMap_ListingsPage();
	pageshowGoogleAnalytics();

	if(bGoToLastScrollPos)
	{
		bGoToLastScrollPos= false;
		$.mobile.silentScroll(lastScrollPos);
	}
	setTimeout(function(){showBusinessListPage()},1000);
});


$(document).on('pagebeforehide', '#businessListPage', function(e)
{
	hideBusinessListPage();
	lastScrollPos= $(window).scrollTop();
});


function businessListPage_BackPressed()
{
	if(bCameFromPrimaryPage)
	{
		$.mobile.changePage('#primary_page');
	}
	else
	{
		$.mobile.changePage('#home_page');
	}
}


function setupMap_ListingsPage()
{
	resizeMapCanvas_bp();
	removeBusinessListings();
	if(b_SearchListings && aSEs_fromSearch == null && !bSearching)
	{
		show_NoListingsForSearch_Row();
	}
	setListingsBarTitle();
	if((b_OnlineListings || b_SearchListings) && !bGoToLastScrollPos)
	{
		setListingsButtonTo_UpPos();
	}
	if(!bSearching)
	{
		if(b_NearbyListings && !bRepopulatingMap)
		{
			bProgrammicMapZoom= true;
			setMapToGeoPoint('#bp_map_canvas', google_UserGeoPoint, false);
			addMapLocationMarker('#bp_map_canvas', google_UserGeoPoint, true, null);
		}
		else if(b_MetroAreaListings)
		{
			var metroArea_geoLocation=oPrimary_GeoLocation[selected_primaryArea];
			var google_MetroArea_geolocation= new google.maps.LatLng(metroArea_geoLocation.latitude, metroArea_geoLocation.longitude);
			bProgrammicMapZoom= true;
			setMapToGeoPoint('#bp_map_canvas', google_MetroArea_geolocation, false);
		}
		var aSEs_toDisplay= getTheSEsToDisplay();
		displaySE_Listings(aSEs_toDisplay, true);
	}
}


function resizeMapCanvas_bp()
{
	var header_height= $('#businessListPageHeader').height(),
	    listingsButton_height= $('#businessList_ListingsButton_li').innerHeight(),
		map_height= $(window).height();

	if(isiPhoneSafari() && (window.innerHeight > window.innerWidth))
	{
		map_height= map_height - listingsButton_height - 5;
	}
	else
	{
		map_height= map_height - (header_height*2) - listingsButton_height;
	}  
	
	$('#bp_map_canvas').css("height", map_height);
	$('#bp_map_canvas').gmap('refresh');

	var content= $('#businessListPage_content');
	$(content).css('padding-bottom', CONST_CONTENT_HEIGHT_TRIM);

	$('#repopulateMapButton').css('top', $('#businessListPageHeader').height());
	$('#repopulateMapButton').css('left', ($('#bp_map_canvas').width() * 0.5) - ($('#repopulateMapButton').width() * 0.5));
}


function setListingsBarTitle()
{
	$('#blp_ListingsButton_Title').html(SE_Category + ' Listings');
}


function getTheSEsToDisplay() 
{
	if(b_SearchListings)
	{
		return aSEs_fromSearch;
	}
	if(bRepopulatingMap)
	{
		return aSEs_RepopMap;
	}
	if(b_NearbyListings)
	{
		return aSEs_Nearby;
	}
	if(b_MetroAreaListings)
	{
		return aSEs_Primary	
	}
	if(b_OnlineListings)
	{
		return aSEs_Online;
	}
}	



function displaySE_Listings(aSEs_toDisplay, bOpenInfoWindow)
{	
	if(!aSEs_toDisplay)
	{
		return;
	}
	
	var bDisplayEverthing= false; 
	if(SE_Category === 'Everything')
	{
		bDisplayEverthing= true;
	}
	
	var aSE_Categories, listingsHTML= '';
	var bFirstSEinList= true;
	for(var i= 0; i < aSEs_toDisplay.length; ++i)
	{
		if(b_NearbyListings)
		{
			aSE_Categories= aSEs_toDisplay[i].Categories.split('"');
			
			if(aSE_Categories != undefined && aSE_Categories != null)
			{
				if(bDisplayEverthing || ($.inArray(SE_Category, aSE_Categories) > -1))
				{
					listingsHTML+= getListingHTMLForSE(aSEs_toDisplay[i], i, false, false);
				}
			}
		}
		else if(b_MetroAreaListings)
		{
			listingsHTML+= getListingHTMLForSE(aSEs_toDisplay[i], i, false, false);
		}
		else if(b_SearchListings)
		{
			listingsHTML+= getListingHTMLForSE(aSEs_toDisplay[i], i, false, bFirstSEinList);
			if(bFirstSEinList)
			{
				var seLat, seLong;
				seLat= aSEs_toDisplay[i].Latitude;
				seLong= aSEs_toDisplay[i].Longitude;				

				if(seLat != null && seLat != undefined && seLong != null && seLong != undefined)
				{
					bFirstSEinList= false;	
				}					
			}			
		}
		else if(b_OnlineListings)
		{
			listingsHTML+= getListingHTMLForSE(aSEs_toDisplay[i], i, false, bFirstSEinList);
			var bHasGeoLocation= false;
			var seLat= aSEs_toDisplay[i].Latitude, seLong= aSEs_toDisplay[i].Longitude;
			if(seLat != null && seLat != undefined && seLong != null && seLong != undefined)
			{
				bFirstSEinList= false;
			}				
		}
	}

	$('#businessList').append(listingsHTML);
	$('#businessList').listview('refresh');
	$('#bp_map_canvas').gmap('refresh');

	for(var i= 0; i < aSEs_toDisplay.length; ++i)
	{
		$( '#' + i ).on('click', function(event, ui) 
		{
			SE_forBusinessPage= aSEs_toDisplay[parseInt(this.id)];
		});
	}
}



function getListingHTMLForSE(SE, listingsID, bOpenInfoWindow_forMapMarker, bMoveToThisLocationOnMap)
{
	var bHasGeoLocation= false, SE_GeoLocation;
	var latitude= SE.Latitude, longitude= SE.Longitude;
	if(latitude != null && latitude != undefined &&  longitude != null &&  longitude != undefined)
	{
		SE_GeoLocation= new Parse.GeoPoint({latitude: latitude, longitude: longitude});
	}			

	if(SE_GeoLocation != undefined && SE_GeoLocation != null)
	{
		SE_google_GeoPoint= new google.maps.LatLng(SE_GeoLocation.latitude, SE_GeoLocation.longitude);
		if(SE_google_GeoPoint != null && SE_google_GeoPoint != undefined)
		{
			addMapLocationMarker('#bp_map_canvas', SE_google_GeoPoint, false, SE, bOpenInfoWindow_forMapMarker);
			if(bMoveToThisLocationOnMap)
			{
				bProgrammicMapZoom= true;
				setMapToGeoPoint('#bp_map_canvas', SE_google_GeoPoint, false);
			}
		}		
	}

	var listingsHTML= '<li class="businessPageListing"';
	var seaIconHTML='';
	var seCategories= SE.Categories;
	var bSEA= false;

	if(seCategories.indexOf('Social Enterprise Alliance') > -1)
	{
		bSEA= true;
	}	

	if(bSEA)
	{
		listingsHTML+= 'style="background:#7DC9DB"';
		seaIconHTML= '<img src="Images/sea.jpg" title="Social Enterprise Alliance" onclick="openSEA_Website()"/>';
	}

	listingsHTML+=
	'><a href="#businessPage" data-transition="none" id="' + listingsID + '">'
	+ seaIconHTML
	+ '<h3>' + SE.Name + '</h3><p>' + SE.Location + '</p>';

	if(SE_GeoLocation != undefined && SE_GeoLocation != null && parse_UserGeoPoint != null && parse_UserGeoPoint != undefined)
	{
		if(bInUSorUK)
		{
			listingsHTML+= 
			'<p>'  
				+ (Math.round(SE_GeoLocation.milesTo(parse_UserGeoPoint) * 10) / 10) 
			+' Miles</p>';
		}
		else
		{
			listingsHTML+= 
			'<p>'  
				+ (Math.round(SE_GeoLocation.kilometersTo(parse_UserGeoPoint) * 10) / 10)
			+' Kilometers</p>';
		}
	}
	
	listingsHTML+= '</a></li>';
	return listingsHTML;
}


function openSEA_Website()
{
	window.open("https://www.se-alliance.org/");
}



function show_NoListingsWithinRadius_Row()
{
	var rowHTML= 
	'<li class="businessPageListing">'
		+ '<h3>No ' + SE_Category + ' social enterprises listed within ' + CONST_NEARBY_RADIUS + ' miles.</h3>'
	+'</li>';
	$('#businessList').append(rowHTML);
	$('#businessList').listview('refresh');	
}



function show_NoListingsForSearch_Row()
{
	var rowHTML= 
	'<li class="businessPageListing">'
		+'<div>'
			+ 'No social enterprises found for "' + searchString + '".'
		+'</div>'
	+'</li>';
	$('#businessList').append(rowHTML);
	$('#businessList').listview('refresh');	
}


function show_troubleReachingDatabase_Row()
{
	var rowHTML= 
	'<li class="businessPageListing">'
		+'<div>'
			+ '<h3>Social Impact is having trouble reaching its database. Please try again.</h3>'
		+'</div>'
	+'</li>';
	$('#businessList').append(rowHTML);
	$('#businessList').listview('refresh');	
}


function removeBusinessListings()
{
	$('.businessPageListing').remove();
	$('#bp_map_canvas').gmap('clear', 'markers');
	$('#bp_map_canvas').gmap('closeInfoWindow');
}


function showBusinessListPage()
{
	$.mobile.loading('hide');
	$('#businessListPage_content').css('visibility', 'visible');
}

function blp_searchComplete()
{
	showBusinessListPage();
	setListingsButtonTo_UpPos();
}

function hideBusinessListPage()
{
	$('#businessListPage_content').css('visibility', 'hidden');
}

function showSearching()
{
	if(bSearching)
	{
		hideBusinessListPage();
		$.mobile.loading( 'show',
		{
			text: 'Searching...',
			textVisible: true,
			theme: 'a',
			html: ""
		});
	}
}

function setListingsButtonTo_UpPos()
{
	var yPos= $("#businessList_ListingsButton_li").offset().top
				- $("#businessList_ListingsButton_li").height()
				- $('#businessListPageHeader').height();
	$.mobile.silentScroll( yPos );
}

function setListingsButtonTo_DownPos()
{
	$.mobile.silentScroll(0);
}