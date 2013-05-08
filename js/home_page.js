var bGetMetroAreas_FirstTry= true, 
	bGetNearbySEs_FirstTry= true, 
	bGetOnlineSEs_FirstTry= true,
	bGetDefaultLocation_FirstTry= true,
	timer_userGeoLocation= null,
	bDefaultLocationShowing= false,
	oMetroAreas_GeoLocation= undefined,
	aMetroArea_list= new Array(),
	aMetroAreas,
	aAll_ShopOnlineSEs, oListID_toCategory;


$(document).on("pagecreate", "#home_page" , function(event) 
{
	hideHomePage();
	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
	$('#home_page #versionLabel').html(appVersion);
});


$(document).on("pageinit", "#home_page" , function(event) 
{	
	setupSearch('#home_searchInput', '.searchInputContainer');
	if(!bNewPrioritySection)
	{
		getMetroAreas();
	}
	getShopOnline_Categories();	
});


$(document).on('pageshow', '#home_page', function(event, ui)
{
	if(!aSEs_Nearby)
	{
		$.mobile.loading('show',
		{
			text: 'Finding Your Location...',
			textVisible: true,
			theme: 'a'
		});

		getUsersGeoLocation();
	}
	$('#home_searchInput').attr('value', '');
	pageshowGoogleAnalytics();
});


function getUsersGeoLocation()
{
	if(navigator.geolocation)
    {
    	var bHomePage= false;
    	if(isThisCurrentPage('#home_page') || bPhoneGap)
    	{
    		bHomePage= true;
    	}

    	if(!bDefaultLocationShowing)
    	{
    		timer_userGeoLocation= setTimeout(function()
	    	{
	    		if(timer_userGeoLocation != null)
	    		{
	    			if(bHomePage)
	    			{
	    				getNearby_SEs(null);			    		
			    	}
			    	else
			    	{
			    		setDefaultUserLocation();
			    	}
	    		}
	    	}, 15000); 
    	}
		else
		{
		    alert('Make sure to tell your browser to share your location. If you can\'t find your browser\'s location setting, check in its preferences, or try refreshing the page.')
		}		   	   	

		if(bHomePage)
		{
			navigator.geolocation.getCurrentPosition(getNearby_SEs, geolocationError);			    
		}
		else
		{
			navigator.geolocation.getCurrentPosition(setUserGeoLocation);
		}
    }
	else
	{
		si_log('home_page.js:: getUsersGeoLocation():: No GeoLocation');
		getNearby_SEs(null);		
    }
}


function geolocationError(error)
{
	si_log('geolocationError:: code= ' + error['code'] + ', message= ' + error['message']);
}


function setDefaultUserLocation()
{
	$('#hp_NearbyLabel .ui-btn-text').html('Nearby San Francisco');
	bDefaultLocationShowing= true;
	oUserGeoPoint.latitude= 37.799675;
	oUserGeoPoint.longitude= -122.265196;
	google_UserGeoPoint= new google.maps.LatLng(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
	parse_UserGeoPoint= new Parse.GeoPoint(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
	pointInUSorUK(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
}


function setUserGeoLocation(usersCurrentGeoPoint)
{
	clearTimeout(timer_userGeoLocation);
	timer_userGeoLocation= null;

	if(usersCurrentGeoPoint == null || usersCurrentGeoPoint == undefined)
	{
		si_log('home_page.js:: setUserGeoLocation():: if(usersCurrentGeoPoint == null || usersCurrentGeoPoint == undefined)');
		setDefaultUserLocation();
		return;
	}	

	$('#hp_NearbyLabel .ui-btn-text').html('Nearby');
	oUserGeoPoint.latitude= usersCurrentGeoPoint.coords.latitude;
	oUserGeoPoint.longitude= usersCurrentGeoPoint.coords.longitude;
	google_UserGeoPoint= new google.maps.LatLng(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
	parse_UserGeoPoint= new Parse.GeoPoint(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
	pointInUSorUK(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
}



function getNearby_SEs(usersCurrentGeoPoint)
{
	$.mobile.loading( 'show',
	{
		text: 'Finding Nearby Social Enterprises...',
		textVisible: true,
		theme: 'a'
	});	

	setUserGeoLocation(usersCurrentGeoPoint);

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getNearby_SEs.php'),
	    data: 
	    { 
	    	Lat: oUserGeoPoint.latitude,
	    	Long: oUserGeoPoint.longitude
		},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
	    	si_debug_log('home_page:: getNearby_SEs:: complete');

		    if(oXMLHttpRequest.status === 200)
		    {
		    	if(oXMLHttpRequest.responseText == -1)
		    	{
		    		if(usersCurrentGeoPoint != null)
		    		{
		    			getNearby_SEs(null);
		    		}
		    		return;
		    	}

		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aSEs_Nearby= jsonResponse['Nearby_SEs'];
					if(aSEs_Nearby != null && aSEs_Nearby != undefined)
					{
						var seGeoLocation, se, seLatitude, seLongitude;
						for(var i=0; i<aSEs_Nearby.length; ++i)
						{
							se= aSEs_Nearby[i];
							seLatitude= se.Latitude;
							seLongitude= se.Longitude;
							if(seLatitude != null && seLongitude != null && seLatitude != undefined && seLongitude != undefined)
							{
								seGeoLocation= new Parse.GeoPoint({latitude: seLatitude, longitude: seLongitude});
								aSEs_Nearby[i].DistanceToUser= seGeoLocation.milesTo(parse_UserGeoPoint);	
							}							
						}
						aSEs_Nearby.sort(compareKey('DistanceToUser'));
					}
					else
					{
						si_log('home_page.js:: getNearby_SEs():: if(aSEs_Nearby != null && aSEs_Nearby != undefined)');
						return;
					}

				    aCategoriesIn_NearbySEs= new Array();
				    var category, aCategoriesInResults= jsonResponse['CategoriesInNearbySEs'];
				    for(var i= 0; i < aCategoriesInResults.length; ++i)
				    {
				    	category= aCategoriesInResults[i].Category;
				    	if(category != null && category != undefined)
				    	{
				    		aCategoriesIn_NearbySEs.push(category);
				    	}
				    }
					loadNearbyCategoriesList();
					showHomePage();
					if(bDefaultLocationShowing)
					{
						alert('Showing Nearby San Francisco because we don\'t know your current location. Change your settings to allow Social Impact App to have access to your geolocation to fix this.');
					}
				}
				else
				{
					si_log('indexPage.js:: getNearby_SEs:: !results');
				}
				return;
		    }
		}							   
	});
}




function getShopOnline_Categories()
{
	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getCategories_forShopOnline.php'),
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aOnline_Categories= jsonResponse['ShopOnline_Categories'];
					if(aOnline_Categories == null || aOnline_Categories == undefined)
					{
						si_log('home_page.js:: getShopOnline_Categories():: if(aOnline_Categories == null || aOnline_Categories == undefined)')
					}
					loadShopOnline_CategoryList();
				}
				else
				{
					si_log('home_page.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		}							   
	});
}



function loadNearbyCategoriesList()
{
	if(aCategoriesIn_NearbySEs.length <= 0)
	{
		si_log('index.js:: loadNearbyCategoriesList():: if(aCategoriesIn_NearbySEs.length <= 0)');
		return;
	}
	var listHTML= '', listID= '';

	var oCategoriesWithCounts= new Object(), aCategories;
	for(var i=0; i < aSEs_Nearby.length; ++i)
	{
		aCategories= aSEs_Nearby[i].Categories.split('","');
		if(aCategories != null && aCategories != undefined)
		{
			var category;
			for(var k= 0; k < aCategories.length; ++k)
			{
				category= aCategories[k]
				category= category.replace(/"/g, '');
				if(category != null && category != undefined)
				{
					if(category in oCategoriesWithCounts)
    				{
    					oCategoriesWithCounts[category]+= 1;
    				}
    				else
    				{
    					oCategoriesWithCounts[category]= 1;
    				}
				}
			}
		}
	}

	oListID_toCategory= new Object();
	for (var i=0; i < aCategoriesIn_NearbySEs.length; i++)
	{
		listID= aCategoriesIn_NearbySEs[i];
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		oListID_toCategory[listID]= aCategoriesIn_NearbySEs[i];

		listHTML+=  '<li><a id="' + listID + '">' 
						+ aCategoriesIn_NearbySEs[i]
						+ '<span class="ui-li-count">' + oCategoriesWithCounts[aCategoriesIn_NearbySEs[i]] + '</span>'
					+'</a></li>';
	}	
	listHTML+= '<li><a id="Everything_ListItem">Everything'
					+ '<span class="ui-li-count">' + aSEs_Nearby.length + '</span>'
				+'</a></li>';
	$('#nearbyCategoryList' ).html(listHTML);

	for (var i=0; i < aCategoriesIn_NearbySEs.length; i++)
	{
		listID= aCategoriesIn_NearbySEs[i];
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');

		$( '#' + listID ).on('click', function(event, ui) 
		{
			b_NearbyListings= true;
			b_MetroAreaListings= false;
			b_SearchListings= false;
			b_OnlineListings= false;
			SE_Category= oListID_toCategory[this.id];	
			$.mobile.changePage('#businessListPage');		
		});
	}	
	$('#Everything_ListItem').on('click', function(event, ui) 
	{
		b_NearbyListings= true;
		b_MetroAreaListings= false;
		b_SearchListings= false;
		b_OnlineListings= false;
		SE_Category= 'Everything';
		$.mobile.changePage('#businessListPage');				
	});
	$('#nearbyCategoryList').listview('refresh');
}



function getMetroAreas()
{
	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getMetroAreas.php'),
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aMetroAreas= jsonResponse['MetroAreas'];
					if(aMetroAreas == null || aMetroAreas == undefined)
					{
						si_log('home_page.js:: getMetroAreas():: if(aMetroAreas == null || aMetroAreas == undefined)')
					}

					oMetroAreas_GeoLocation= new Object();
		        	var oMA_GeoLocation, result_GeoLocation;
		        	var str_name, coords;
		            for(var i= 0; i < aMetroAreas.length; ++i)
		            {
		            	str_name= aMetroAreas[i].Name;
		            	if(str_name != null && str_name != undefined)
		            	{
		            		oMA_GeoLocation= 
		            		{
		            			latitude: aMetroAreas[i].Latitude,
		            			longitude: aMetroAreas[i].Longitude
		            		}
		            		if(oMA_GeoLocation != null && oMA_GeoLocation != undefined)
		            		{
		            			oMetroAreas_GeoLocation[str_name]= oMA_GeoLocation;
		            		}            		
		            	}
		            	else
		            	{
		            		si_log('home_page.js:: getMetroArea:: if(str_name == null || str_name == undefined)');
		            	}
		            }

					loadMetroAreaList();
				}
				else
				{
					si_log('home_page.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		}							   
	});
}




function loadMetroAreaList()
{
	if(aMetroAreas.length <= 0)
	{
		si_log('home_page.js:: loadMetroAreaList():: if(aMetroArea_list.length <= 0)');
		return;
	}

	var listHTML= '', listID= '';
	for(var i=0; i < aMetroAreas.length; i++)
	{
		listID= aMetroAreas[i].Name;
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listID= listID.replace('/', '_');
		listHTML+= 
		'<li><a id="' + listID + '">' 
			+ aMetroAreas[i].Name 
			+ '<span class="ui-li-count">' + aMetroAreas[i].Count + '</span>'
		+ "</a></li>";
	}	
	$('#hp_metroAreasList').html(listHTML);

	for(var i=0; i < aMetroAreas.length; i++)
	{
		listID= aMetroAreas[i].Name;
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listID= listID.replace('/', '_');
		$('#' + listID).on('click', function(event, ui) 
		{
			b_MetroAreaListings= true;
			b_NearbyListings= false;
			b_SearchListings= false;
			b_OnlineListings= false;
			SE_Category= this.innerHTML.split('<')[0];
			selected_metroArea= SE_Category;
			getSEs_forMetroArea(this.innerHTML.split('<')[0]);				
		});
	}	
	$('#hp_metroAreasList').listview('refresh');
}



function getSEs_forMetroArea(metroArea)
{
	if(metroArea == null || metroArea == undefined)
	{
		si_log('home_page.js:: getSEs_forMetroArea():: if(metroArea == null || metroArea == undefined)');
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getSEs_forMetroArea.php'),
	    data: {ma: metroArea},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aSEs_MetroArea= jsonResponse['SEs_forMetroArea'];
					if(aSEs_MetroArea == null || aSEs_MetroArea == undefined)
					{
						si_log('home_page.js:: getSEs_forMetroArea():: if(aSEs_MetroArea == null || aSEs_MetroArea == undefined)')
					}
					$.mobile.changePage('#businessListPage');
				}
				else
				{
					si_log('home_page.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('home_page.js:: getSEs_forMetroArea():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
		    }
		}							   
	});
}





function loadShopOnline_CategoryList()
{
	if(aOnline_Categories.length <= 0)
	{
		si_log('home_page.js:: loadShopOnline_CategoryList():: if(aOnline_Categories.length <= 0)');
		return;
	}

	var listHTML= '', listID= '', totalCount= 0, count;
	for(var i=0; i < aOnline_Categories.length; i++)
	{
		count= aOnline_Categories[i].Count;
		if(count > 0 || strcmp(aOnline_Categories[i].Category, 'Everything') == const_StringsEqual)
		{
			totalCount+= count;
			listID= aOnline_Categories[i].Category + '_shopOnline';
			listID= listID.replace(/\s/g, "");
			listID= listID.replace(/&/g, '_');
			listID= listID.replace(/,/g, '_');
			listHTML+= 
			'<li><a id="' + listID + '">' 
				+ aOnline_Categories[i].Category 
				+ '<span class="ui-li-count">';
			if(strcmp(aOnline_Categories[i].Category, 'Everything') == const_StringsEqual)
			{
				listHTML+= totalCount;
			}
			else
			{
				listHTML+= aOnline_Categories[i].Count 
			}
			listHTML+= '</span>'+ "</a></li>";
		}		
	}	
	$('#onlineCategoryList' ).html(listHTML);

	for(var i=0; i < aOnline_Categories.length; i++)
	{
		listID= aOnline_Categories[i].Category + '_shopOnline';
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		$('#' + listID).on('click', function(event, ui) 
		{
			b_OnlineListings= true;
			b_NearbyListings= false;
			b_MetroAreaListings= false;
			b_SearchListings= false;
			SE_Category= this.innerHTML.split('<')[0].replace(/&amp;/g, '&');
			getSEs_forShopOnlineCategory(SE_Category);
		});
	}	
	$('#onlineCategoryList').listview('refresh');
}



function getSEs_forShopOnlineCategory(category)
{
	if(category == null || category == undefined)
	{
		si_log('home_page.js:: getSEs_forShopOnlineCategory():: if(category == null || category == undefined)');
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getSEs_forOnlineCategory.php'),
	    data: {cat: category},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aSEs_Online= jsonResponse['SEs_forMetroArea'];
					if(aSEs_Online == null || aSEs_Online == undefined)
					{
						si_log('home_page.js:: getSEs_forMetroArea():: if(aSEs_MetroArea == null || aSEs_MetroArea == undefined)')
					}
					$.mobile.changePage('#businessListPage');
				}
				else
				{
					si_log('home_page.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('home_page.js:: getSEs_forMetroArea():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
		    }
		}							   
	});
}



function hideHomePage()
{
	$('#home_content').css('visibility', 'hidden');
}



function showHomePage()
{
	$.mobile.loading( 'hide' );
	$('#home_content').css('visibility', 'visible');
}


