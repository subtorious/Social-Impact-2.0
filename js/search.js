var CONST_RETURN_KEYCODE= 13,
	CONST_Search_Category= 'Search',
	CONST_Search_Social_Impact= 'Search Social Impact',
	CONST_Search_Location= 'Search Address, City, State, or Postal Code',
	CONST_Search_SI_Database= 'Search SI Database',
	aSEs_fromSearch= null,
	searchString= null, last_searchString= null,
	bSearching= false,
	bShow_Search_Options_When_Clicked= true, bClear_Button_Clicked= false,
	bSearchLocation_Selected= false, bSearchSI_Database_Selected= false,
	lowercase_SearchString, titlecase_SearchString,
	search_firstTry= true;



function setupSearch(searchInput, searchContainer)
{
	$(searchInput).on('keyup', function(e) 
	{
	    if(e.which === CONST_RETURN_KEYCODE)
		{
			this.blur();
		}
	});	

	$(searchInput).blur(function(e)
	{
		if($(searchInput).attr('value') != '')
		{
			performSearch(this);
		}
	});

	$(searchContainer).on('click', function(event, ui)
	{
		if(bSearching)
		{
			return;
		}

		if($(searchInput).attr('value') === '')
		{
			$(searchInput).attr('placeholder', '');
		}
	});
}



function searchLocationSelected()
{
	last_searchString= null;
	bSearchLocation_Selected= true;
	bSearchSI_Database_Selected= false;
	readySearchForInput(CONST_Search_Location);
}


function searchSI_DatabaseSelected()
{
	last_searchString= null;
	bSearchSI_Database_Selected= true;
	bSearchLocation_Selected= false;
	readySearchForInput(CONST_Search_SI_Database);
}

function readySearchForInput(placeholderText)
{
	var currentPageID= $.mobile.activePage.attr('id'),
		searchPopup, searchInput;
	if(currentPageID === 'home_page')
	{
		searchInput= '#home_searchInput';
	}
	else if(currentPageID === 'businessListPage')
	{
		searchInput= '#searchInput_businessListPage';
	}
	else if(currentPageID === 'businessPage')
	{
		searchInput= '#searchInput_businessPage';
	}
	else if(currentPageID === 'mapPage')
	{
		searchInput= '#mp_searchInput';
	}

	$(searchInput).attr('placeholder', placeholderText);
	$(searchInput).focus();
}



function performSearch(searchInput)
{
	if(bSearching)
	{
		return;
	}

	searchString= $(searchInput).attr('value');
	bSearching= true;
	last_searchString= searchString;
	if(bParse)
	{
		lowercase_SearchString= searchString.toLowerCase();
		titlecase_SearchString= toTitleCase(searchString);	
		search_firstTry= true;
	}	
	aSEs_fromSearch= null;	
	b_SearchListings= true;
	b_NearbyListings= false;
	b_MetroAreaListings= false;
	b_OnlineListings= false;	
	SE_Category= CONST_Search_Category;

	if($.mobile.activePage.attr('id') === 'businessListPage')
	{
		showSearching();
		setupMap_ListingsPage();
		if(bParse)
		{
			searchSI_Database_Parse();
		}
		else
		{
			searchSI_Database();
		}
	}
	else
	{
		$.mobile.changePage('#businessListPage'); 
	}

	console.log('Searching for ' + searchString);
}


function searchSI_Database()
{
	$.ajax(
	{
	    type: 'GET',
	    url: 'php/searchSI_Database.php',
	    data: {s: searchString},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
	    	bSearching= false;
		    if(oXMLHttpRequest.status === 200)
		    {
		    	if(strcmp(oXMLHttpRequest.responseText, '-1') === const_StringsEqual)
		    	{
		    		console.log('No results');
		    		noResultsForSearch();
		    		return;
		    	}

		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aSEs_fromSearch= jsonResponse;
					if(aSEs_fromSearch != null && aSEs_fromSearch != undefined)
					{
						if(aSEs_fromSearch.length <= 0)
						{
							noResultsForSearch();
							return;
						}

						var seGeoLocation, se, seLatitude, seLongitude;
						for(var i=0; i<aSEs_fromSearch.length; ++i)
						{
							se= aSEs_fromSearch[i];
							seLatitude= se.Latitude;
							seLongitude= se.Longitude;
							if(seLatitude != null && seLongitude != null && seLatitude != undefined && seLongitude != undefined)
							{
								seGeoLocation= new Parse.GeoPoint({latitude: seLatitude, longitude: seLongitude});
								aSEs_fromSearch[i].DistanceToUser= seGeoLocation.milesTo(parse_UserGeoPoint);	
							}							
						}
						aSEs_fromSearch.sort(searchCompare());

						displaySE_Listings(aSEs_fromSearch, true);
						showBusinessListPage();	
					}
					else
					{
						console.log('search.js:: searchSI_Database():: if(aSEs_fromSearch != null && aSEs_fromSearch != undefined)');
						return;
					}
				}
				else
				{
					console.log('search.js:: searchSI_Database:: jsonResponse == null');
				}
				return;
		    }
		}							   
	});
}



// ----------------------Parse Search--------------------------
function searchLocation()
{
	var SocialEnterpriseClass = Parse.Object.extend("SocialEnterprise");
	var lowercase_query= new Parse.Query(SocialEnterpriseClass);
	lowercase_query.contains('Location', lowercase_SearchString);
	var titlecase_query= new Parse.Query(SocialEnterpriseClass);
	titlecase_query.contains('Location', titlecase_SearchString);
	var query= Parse.Query.or(lowercase_query, titlecase_query);
	query.find(
	{
		success: function(results) 
		{
			console.log("search.js:: searchLocation:: Successfully retrieved " + results.length + " objects.");

			bSearching= false;
			if(results.length <= 0)
			{
				noResultsForSearch();
				return;
			}

			aSEs_fromSearch= results;
			displaySE_Listings(aSEs_fromSearch, true);
			showBusinessListPage();
			return;
		},
		error: function(error) 
		{
			console.log("search.js:: searchLocation:: Error: " + error.code + " " + error.message);
			if(search_firstTry)
			{
				searchInput= false;
				searchLocation();
			}
			else
			{
				troubleReachingDatabase();
			}
		}
	});
}



function searchSI_Database_Parse()
{
	var SocialEnterpriseClass = Parse.Object.extend("SocialEnterprise");

	// var asWritten_query_Name_equals= new Parse.Query(SocialEnterpriseClass);
	// asWritten_query_Name_equals.equalTo('Name', searchString);
	// var lowercase_query_Name_equals= new Parse.Query(SocialEnterpriseClass);
	// lowercase_query_Name_equals.equalTo('Name', lowercase_SearchString);
	// var titlecase_query_Name_equals= new Parse.Query(SocialEnterpriseClass);
	// titlecase_query_Name_equals.equalTo('Name', titlecase_SearchString);

	var asWritten_query_Name= new Parse.Query(SocialEnterpriseClass);
	asWritten_query_Name.contains('Name', searchString);
	var lowercase_query_Name= new Parse.Query(SocialEnterpriseClass);
	lowercase_query_Name.contains('Name', lowercase_SearchString);
	var titlecase_query_Name= new Parse.Query(SocialEnterpriseClass);
	titlecase_query_Name.contains('Name', titlecase_SearchString);

	var asWritten_query_Details= new Parse.Query(SocialEnterpriseClass);
	asWritten_query_Details.contains('Details', searchString);
	var lowercase_query_Details= new Parse.Query(SocialEnterpriseClass);
	lowercase_query_Details.contains('Details', lowercase_SearchString);
	var titlecase_query_Details= new Parse.Query(SocialEnterpriseClass);
	titlecase_query_Details.contains('Details', titlecase_SearchString);

	var asWritten_query_SI= new Parse.Query(SocialEnterpriseClass);
	asWritten_query_SI.contains('SocialImpact', searchString);
	var lowercase_query_SI= new Parse.Query(SocialEnterpriseClass);
	lowercase_query_SI.contains('SocialImpact', lowercase_SearchString);
	var titlecase_query_SI= new Parse.Query(SocialEnterpriseClass);
	titlecase_query_SI.contains('SocialImpact', titlecase_SearchString);

	var query= Parse.Query.or(  
								// asWritten_query_Name_equals,
								// lowercase_query_Name_equals,
								// titlecase_query_Name_equals);

								// asWritten_query_Name,
								lowercase_query_Name, 
								titlecase_query_Name,
								// asWritten_query_Details, 
								lowercase_query_Details, 
								titlecase_query_Details, 
								// asWritten_query_SI,
								lowercase_query_SI, 
								titlecase_query_SI);
	query.limit(50);
	query.find(
	{
		success: function(results) 
		{
			console.log("search.js:: searchSI_Database:: Successfully retrieved " + results.length + " objects.");

			bSearching= false;
			if(results.length <= 0)
			{
				noResultsForSearch();
				return;
			}

			if(results.length)
			{
				results.sort(parseGeoPoint_compareDistanceFrom(parse_UserGeoPoint));
			}
			aSEs_fromSearch= results;
			displaySE_Listings(aSEs_fromSearch, true);
			showBusinessListPage();			
		},
		error: function(error) 
		{
			console.log("search.js:: searchSI_Database:: Error: " + error.code + " " + error.message);
			if(search_firstTry)
			{
				searchInput= false;
				searchSI_Database();
			}
			else
			{
				troubleReachingDatabase();
			}
		}
	});
}


function noResultsForSearch()
{
	aSEs_fromSearch= null;
	show_NoListingsForSearch_Row();
	setMapToGeoPoint('#bp_map_canvas', google_UserGeoPoint);
	showBusinessListPage();
}


function troubleReachingDatabase()
{
	aSEs_fromSearch= null;
	show_NoListingsForSearch_Row();
	showBusinessListPage();
}


