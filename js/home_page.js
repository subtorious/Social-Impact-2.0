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
	si_log('home_page:: pagecreate');

	hideHomePage();
	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
	$('#home_page #versionLabel').html(appVersion);
});


$(document).on("pageinit", "#home_page" , function(event) 
{	
	si_log('home_page:: pageinit');

	setupSearch('#home_searchInput', '.searchInputContainer');
	if(bParse)
	{
		getAllMetroAreas_FromParse();
		getOnline_SEsFromParse();	
	}
	else
	{
		getMetroAreas();
		getShopOnline_Categories();
	}
});


$(document).on('pageshow', '#home_page', function(event, ui)
{
	si_log('home_page:: pageshow');

	if(!aSEs_Nearby)
	{
		$.mobile.loading('show',
		{
			text: 'Finding Your Location...',
			textVisible: true,
			theme: 'a'
		});

		getUsersGeoLocation();
		// getNearby_SEs(null);
	}
	$('#home_searchInput').attr('value', '');
	pageshowGoogleAnalytics();
});


function getUsersGeoLocation()
{
	si_log('home_page:: getUsersGeoLocation');
	if(navigator.geolocation)
    {
    	var bHomePage= false;
    	if(isThisCurrentPage('#home_page'))
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
	    				if(bParse)
	    				{
			    			getDefaultLocation();
			    		}
			    		else
			    		{
			    			getNearby_SEs(null);
			    		}
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
			if(bParse)
			{
		    	navigator.geolocation.getCurrentPosition(getNearby_SEsFromParse);
		    }
		    else
		    {
		    	navigator.geolocation.getCurrentPosition(getNearby_SEs, geolocationError);	
		    }
		}
		else
		{
			navigator.geolocation.getCurrentPosition(setUserGeoLocation);
		}
    }
	else
	{
		si_log('home_page.js:: getUsersGeoLocation():: No GeoLocation');
		if(bParse)
		{
			getDefaultLocation();
		}
		else
		{
			getNearby_SEs(null);
		}
    }
}


function geolocationError(error)
{
	si_log('geolocationError:: code= ' + error['code'] + ', message= ' + error['message']);
}


function setDefaultUserLocation()
{
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

	oUserGeoPoint.latitude= usersCurrentGeoPoint.coords.latitude;
	oUserGeoPoint.longitude= usersCurrentGeoPoint.coords.longitude;
	google_UserGeoPoint= new google.maps.LatLng(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
	parse_UserGeoPoint= new Parse.GeoPoint(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
	pointInUSorUK(oUserGeoPoint.latitude, oUserGeoPoint.longitude);
}



function getNearby_SEs(usersCurrentGeoPoint)
{
	si_log('home_page:: getNearby_SEs');

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
	    	si_log('home_page:: getNearby_SEs:: complete');

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
						$('#hp_MyLocationButton').remove();
						$('#NearbyLabel .ui-btn-text').html('Nearby');
					}
				}
				else
				{
					si_log('indexPage.js:: getSI_Initial_Load_FromParse:: !results');
				}
				return;
		    }
		}							   
	});
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
		            		si_log('home_page.js:: getMetroArea_SEsFromParse():: if(str_name == null || str_name == undefined)');
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


// -----------------Parse Functions-------------------
function getNearby_SEsFromParse(usersCurrentGeoPoint)
{
	$.mobile.loading( 'show',
	{
		text: 'Finding Nearby Social Enterprises...',
		textVisible: true,
		theme: 'a'
	});

	setUserGeoLocation(usersCurrentGeoPoint);
	Parse.Cloud.run('getNearby_SEsFromParse', {userGeoLocation: parse_UserGeoPoint, displayRadius: CONST_NEARBY_RADIUS}, 
	{
		success: function(results) 
		{
			if(results != undefined || results != null)
			{
				aSEs_Nearby= results.aNearby_SEs;	
			    aCategoriesIn_NearbySEs= new Array();
			    var category;
			    for(var i= 0; i < results.aCategoriesIn_NearbySEs.length; ++i)
			    {
			    	category= results.aCategoriesIn_NearbySEs[i].get('Category');
			    	if(category != null && category != undefined)
			    	{
			    		aCategoriesIn_NearbySEs.push(category);
			    	}
			    }
				loadNearbyCategoriesList_fromParse();
				showHomePage();
				if(bDefaultLocationShowing)
				{
					$('#hp_MyLocationButton').remove();
					$('#NearbyLabel .ui-btn-text').html('Nearby');
				}
			}
			else
			{
				si_log('home_page.js:: getSI_Initial_Load_FromParse:: !results');
			}
		},
		error: function(error) 
		{
			si_log("Error: " + error.code + " " + error.message);
			if(bGetNearbySEs_FirstTry)
			{
				bGetNearbySEs_FirstTry= false;
				getNearby_SEsFromParse(usersCurrentGeoPoint);
			}
			else
            {
            	showHomePage();
            	alert('Social Impact is having trouble accessing its database. Try Refreshing your Browser.')
            }
		}
	});
}


function getDefaultLocation()
{
	setDefaultUserLocation();

	var sanFranGeoPoint= parse_UserGeoPoint;
	if(sanFranGeoPoint == null || sanFranGeoPoint == undefined)
	{
		showHomePage();
		return;
	}
	$('#NearbyLabel .ui-btn-text').html('Nearby San Francisco');

	var SE_Class= Parse.Object.extend("SocialEnterprise");
    var query = new Parse.Query(SE_Class);
    query.startsWith('MetroArea', 'San Francisco Bay Area');
    query.withinMiles('GeoLocation', sanFranGeoPoint, 1000); 
    query.find(
    {
        success: function(results)
        {
        	aSEs_Nearby= results;
        	aCategoriesIn_NearbySEs= new Array();
        	var oCategoriesIn_NearbySEs= new Object(), aCategoriesFromResults;
        	for(var i= 0; i < results.length; ++i)
        	{
        		aCategoriesFromResults= results[i].get('Categories');
        		if(aCategoriesFromResults != null && aCategoriesFromResults != undefined)
        		{
        			var category;
        			for(var k= 0; k < aCategoriesFromResults.length; ++k)
        			{
        				category= aCategoriesFromResults[k];
        				if(category != null && category != undefined)
        				{
        					if((!(category in oCategoriesIn_NearbySEs)))
	        				{
	        					oCategoriesIn_NearbySEs[category]= 1;
	        					aCategoriesIn_NearbySEs.push(category);
	        				}
        				}
        			}
        		}
        	}
     		loadNearbyCategoriesList_fromParse();
			showHomePage();
			setTimeout(function()
			{
				alert('Showing categories for social enterprises near San Francisco because Social Impact doesn\'t know your current location.');
			}, 1000);
        },
        error: function(error)
        {
            si_log("Error: " + error.code + " " + error.message);
            if(bGetDefaultLocation_FirstTry)
            {
            	bGetDefaultLocation_FirstTry= false;
            	getDefaultLocation();
            }
            else
            {
            	showHomePage();
            	alert('Social Impact is having trouble accessing its database. Try Refreshing your Browser.')
            }
        }
    });
}


function loadNearbyCategoriesList_fromParse()
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
		aCategories= aSEs_Nearby[i].get('Categories');
		if(aCategories != null && aCategories != undefined)
		{
			var category;
			for(var k= 0; k < aCategories.length; ++k)
			{
				category= aCategories[k];
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



function getAllMetroAreas_FromParse()
{
	var MetroAreasClass = Parse.Object.extend("MetroAreas");
    var metroArea_query = new Parse.Query(MetroAreasClass); 
    metroArea_query.ascending('Name');
    metroArea_query.find(
    {
        success: function(results)
        {
        	oMetroAreas_GeoLocation= new Object();
        	var oMA_GeoLocation, result_GeoLocation;
        	var str_name, coords;
            for(var i= 0; i < results.length; ++i)
            {
            	str_name= results[i].get('Name');
            	if(str_name != null && str_name != undefined)
            	{
            		aMetroArea_list.push(str_name);
            		result_GeoLocation= results[i].get('GeoLocation');
            		if(result_GeoLocation != null && result_GeoLocation != undefined)
            		{
            			oMA_GeoLocation= 
	            		{
	            			latitude: result_GeoLocation.latitude,
	            			longitude: result_GeoLocation.longitude
	            		}
	            		if(oMA_GeoLocation != null && oMA_GeoLocation != undefined)
	            		{
	            			oMetroAreas_GeoLocation[str_name]= oMA_GeoLocation;
	            		}
            		}            		
            	}
            	else
            	{
            		si_log('home_page.js:: getMetroArea_SEsFromParse():: if(str_name == null || str_name == undefined)');
            	}
            }
            loadMetroAreaList_forParse();
        },
        error: function(error)
        {
            si_log("Error: " + error.code + " " + error.message);
            if(bGetMetroAreas_FirstTry)
            {
            	bGetMetroAreas_FirstTry= false;
            	getMetroArea_SEsFromParse();
            }
        }
    });
}



function getMetroArea_FromParse()
{
	var SE_Class= Parse.Object.extend("SocialEnterprise");
    var query = new Parse.Query(SE_Class);
    query.ascending('Name');
    query.startsWith('MetroArea', SE_Category) 
    query.find(
    {
        success: function(results)
        {
        	aSEs_MetroArea= results;
        	$.mobile.changePage('#businessListPage');
        },
        error: function(error)
        {
            si_log("Error: " + error.code + " " + error.message);
        }
    });
}

function loadMetroAreaList_forParse()
{
	if(aMetroArea_list.length <= 0)
	{
		si_log('index.js:: loadMetroAreaList():: if(aMetroArea_list.length <= 0)');
		return;
	}

	var listHTML= '', listID= '';
	for(var i=0; i < aMetroArea_list.length; i++)
	{
		listID= aMetroArea_list[i] + '_ListItem';
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listID= listID.replace('/', '_');
		listHTML+= '<li><a id="' + listID + '">' + aMetroArea_list[i] + "</a></li>";
	}	
	$('#metroAreasCategoryList' ).html(listHTML);

	for(var i=0; i < aMetroArea_list.length; i++)
	{
		listID= aMetroArea_list[i] + '_ListItem';
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
			SE_Category= this.innerHTML;
			getMetroArea_FromParse();				
		});
	}	
	$('#metroAreasCategoryList').listview('refresh');
}


function getOnline_SEsFromParse()
{
	var SE_Class = Parse.Object.extend("SocialEnterprise");
    var query = new Parse.Query(SE_Class);
    query.equalTo('ShopOnline', true);
    query.ascending('Name');
    query.limit(1000);
    query.find(
    {
        success: function(results)
        {
        	aAll_ShopOnlineSEs= results;
        	var aResult_Categories, oOnline_Categories= new Object();
        	aOnline_Categories= new Array();
	        var category;
	        for(var i= 0; i < results.length; ++i)
	        {
	            aResult_Categories= results[i].get('Categories');
	            if(!(aResult_Categories == undefined))
	            {
	                for(var k= 0; k < aResult_Categories.length; ++k)
	                {
	                    category= aResult_Categories[k];
	                    if(!(category in oOnline_Categories))
	                    {
	                        oOnline_Categories[category]= undefined;
	                        aOnline_Categories.push(category);
	                    }
	                }
	            }                    
	        } 
	        loadShopOnline_CategoryList_forParse();
        },
        error: function(error)
        {
            si_log("Error: " + error.code + " " + error.message);
            if(bGetOnlineSEs_FirstTry)
            {
            	bGetOnlineSEs_FirstTry= false;
            	getOnline_SEsFromParse();
            }
        }
    });
}

function loadShopOnline_CategoryList_forParse()
{
	if(aOnline_Categories.length <= 0)
	{
		si_log('index.js:: loadShopOnline_CategoryList():: if(aOnline_Categories.length <= 0)');
		return;
	}

	var listHTML= '', listID= '';
	for(var i=0; i < aOnline_Categories.length; i++)
	{
		listID= aOnline_Categories[i] + '_ListItem';
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listHTML+= '<li><a id="' + listID + '">' + aOnline_Categories[i] + "</a></li>";
	}	
	listHTML+= '<li><a id="Everything_ShopOnline">Everything</a></li>';
	$('#onlineCategoryList' ).html(listHTML);

	for(var i=0; i < aOnline_Categories.length; i++)
	{
		listID= aOnline_Categories[i] + '_ListItem';
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		$('#' + listID).on('click', function(event, ui) 
		{
			b_OnlineListings= true;
			b_NearbyListings= false;
			b_MetroAreaListings= false;
			b_SearchListings= false;
			SE_Category= this.innerHTML.replace(/&amp;/g, '&');
			aSEs_Online= new Array();
			var seCategories, category, se;
			for(var i= 0; i < aAll_ShopOnlineSEs.length; ++i)
			{
				se= aAll_ShopOnlineSEs[i];
				if(se != null && se != undefined)
				{
					seCategories= se.get('Categories');
					if(seCategories != null && seCategories != undefined && seCategories.length > 0)
					{
						for(var k= 0; k < seCategories.length; ++k)
						{
							category= seCategories[k];
							if(category != null && category != undefined)
							{
								if(category === SE_Category)
								{
									aSEs_Online.push(se);
									break;
								}
							}
						}
					}
				}
			}
			$.mobile.changePage('#businessListPage');
		});
	}	
	$('#Everything_ShopOnline').on('click', function(event, ui) 
	{
		b_OnlineListings= true;
		b_NearbyListings= false;
		b_MetroAreaListings= false;
		b_SearchListings= false;
		SE_Category= 'Everything';//this.innerHTML.replace(/&amp;/g, '&');
		aSEs_Online= aAll_ShopOnlineSEs;
		$.mobile.changePage('#businessListPage');
	});
	$('#onlineCategoryList').listview('refresh');
}
// ------------------------END Parse Functions------------------------


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
	$('#metroAreasCategoryList' ).html(listHTML);

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
			getSEs_forMetroArea(this.innerHTML.split('<')[0]);				
		});
	}	
	$('#metroAreasCategoryList').listview('refresh');
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


