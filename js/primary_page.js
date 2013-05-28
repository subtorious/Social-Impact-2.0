var aPrimary_SEs= undefined, bPrimaryMetroArea,
	const_primary_state= 0, const_category_state= 1,
	const_metro_area= 0, const_countries= 1,
	primary_page_state= const_primary_state,
	primary_page_type= const_metro_area,
	aPrimaries, selected_primary_country, selected_primary_metroarea,
	aPrimaryCategories_withCount;

$(document).on('pagecreate', '#primary_page', function(e)
{
	if(google_UserGeoPoint == null || google_UserGeoPoint == undefined)
	{
		$.mobile.changePage('#home_page');
	}
});

$(document).on('pageinit', '#primary_page', function(event, ui)
{
	setupSearch('#searchInput_primary_page', '#searchInputHeader_primary_page');
});


$(document).on('pagehide', '#primary_page', function(event, ui)
{
	bCameFromPrimaryPage= true;
});


function primary_backButton_pressed()
{
	if(primary_page_state == const_primary_state)
	{
		$.mobile.changePage('#home_page');
	}
	else if(primary_page_state == const_category_state)
	{
		loadPrimaryList();
	}
}



function getPrimaryCountries()
{
	si_debug_log('getPrimaryCountries');

	bPrimaryMetroArea= false;
	primary_page_type= const_countries;

	$('#primary_name').html('Primary Countries');

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getPrimaryCountries.php'),
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aPrimaries= jsonResponse['Countries'];
					if(aPrimaries == null || aPrimaries == undefined)
					{
						si_log('primary_page.js:: getPrimaryCountries():: if(aPrimaries == null || aPrimaries == undefined)')
						$.mobile.changePage('#home_page');
						return;
					}

					setPrimaryGeolocations();
					loadPrimaryList();
				}
				else
				{
					si_log('primary_page.js:: getPrimaryCountries:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('primary_page.js:: getPrimaryCountries:: oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1');
		    }
		}							   
	});
}


function getCategories_Count_forPrimaryCountry(country)
{
	if(country == null || country == undefined)
	{
		si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(country == null || country == undefined)');
		return;
	}

	primary_page_state= const_category_state;
	selected_primaryArea= country;

	for(var i= 0; i < aPrimaries.length; ++i)
	{
		if(strcmp(aPrimaries[i].Name, country) == const_StringsEqual)
		{
			selected_primary_country= aPrimaries[i];
			break;
		}
	}

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getCategoriesForCountry.php'),
	    data: {country: selected_primary_country},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aPrimaryCategories_withCount= jsonResponse['categories_forCountry'];
					if(aPrimaryCategories_withCount == null || aPrimaryCategories_withCount == undefined)
					{
						si_log('primary_page.js:: getCategories_Count_forPrimaryCountry():: if(aPrimaryCategories_withCount == null || aPrimaryCategories_withCount == undefined)')
					}

					loadPrimaryCategoryList();
				}
				else
				{
					si_log('primary_page.js:: getSEs_forPrimaryCountry:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
		    }
		}							   
	});
}



function getSEs_forPrimaryCountry_andCategory(category)
{
	if(category == null || category == undefined)
	{
		si_log('primary_page.js:: getSEs_forPrimaryCountry_andCategory():: if(category == null || category == undefined)');
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getSEs_forCountry.php'),
	    data: 
	    {
	    	country: selected_primary_country,
	    	category: category
	    },
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aSEs_Primary= jsonResponse['SEs_forCountry'];
					if(aSEs_Primary == null || aSEs_Primary == undefined)
					{
						si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(aSEs_Primary == null || aSEs_Primary == undefined)')
					}
					$.mobile.changePage('#businessListPage');
				}
				else
				{
					si_log('primary_page.js:: getSEs_forPrimaryCountry:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
		    }
		}							   
	});
}


function getPrimaryMetroAreas()
{
	bPrimaryMetroArea= true;
	primary_page_type= const_metro_area;
	$('#primary_name').html('Primary Metro Areas');

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getMetroAreas.php'),
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aPrimaries= jsonResponse['MetroAreas'];
					if(aPrimaries == null || aPrimaries == undefined)
					{
						si_log('primary_page.js:: getMetroAreas():: if(aPrimaries == null || aPrimaries == undefined)')
					}

					setPrimaryGeolocations();
					loadPrimaryList();
				}
				else
				{
					si_log('primary_page.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		}							   
	});
}



function getCategories_Count_forPrimaryMetroArea(metroArea)
{
	if(metroArea == null || metroArea == undefined)
	{
		si_log('primary_page.js:: getCategories_Count_forPrimaryMetroArea():: if(metroArea == null || metroArea == undefined)');
		return;
	}

	primary_page_state= const_category_state;
	selected_primaryArea= metroArea;

	for(var i= 0; i < aPrimaries.length; ++i)
	{
		if(strcmp(aPrimaries[i].Name, metroArea) == const_StringsEqual)
		{
			selected_primary_metroarea= aPrimaries[i];
			break;
		}
	}

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getCategoriesForMetroArea.php'),
	    data: {metroArea: selected_primary_metroarea},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aPrimaryCategories_withCount= jsonResponse['categories_forCountry'];
					if(aPrimaryCategories_withCount == null || aPrimaryCategories_withCount == undefined)
					{
						si_log('primary_page.js:: getCategories_Count_forPrimaryCountry():: if(aPrimaryCategories_withCount == null || aPrimaryCategories_withCount == undefined)')
					}

					loadPrimaryCategoryList();
				}
				else
				{
					si_log('primary_page.js:: getSEs_forPrimaryCountry:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
		    }
		}							   
	});
}



function getSEs_forPrimaryMetroArea_andCategory(category)
{
	if(category == null || category == undefined)
	{
		si_log('primary_page.js:: getSEs_forPrimaryMetroArea_andCategory():: if(category == null || category == undefined)');
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getSEs_forMetroArea.php'),
	    data: 
	    {
	    	metroArea: selected_primary_metroarea,
	    	category: category
	    },
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aSEs_Primary= jsonResponse['SEs_forCountry'];
					if(aSEs_Primary == null || aSEs_Primary == undefined)
					{
						si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(aSEs_Primary == null || aSEs_Primary == undefined)')
					}
					$.mobile.changePage('#businessListPage');
				}
				else
				{
					si_log('primary_page.js:: getSEs_forPrimaryCountry:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('primary_page.js:: getSEs_forPrimaryCountry():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
		    }
		}							   
	});
}




function setPrimaryGeolocations()
{
	oPrimary_GeoLocation= new Object();
	var oMA_GeoLocation;
	var str_name;
    for(var i= 0; i < aPrimaries.length; ++i)
    {
    	str_name= aPrimaries[i].Name;
    	if(str_name != null && str_name != undefined)
    	{
    		oMA_GeoLocation= 
    		{
    			latitude: aPrimaries[i].Latitude,
    			longitude: aPrimaries[i].Longitude
    		}
    		if(oMA_GeoLocation != null && oMA_GeoLocation != undefined)
    		{
    			oPrimary_GeoLocation[str_name]= oMA_GeoLocation;
    		}            		
    	}
    	else
    	{
    		si_log('primary_page.js:: getMetroArea:: if(str_name == null || str_name == undefined)');
    	}
    }
}



function loadPrimaryList()
{
	if(aPrimaries.length <= 0)
	{
		si_log('primary_page.js:: loadMetroAreaList():: if(aMetroArea_list.length <= 0)');
		return;
	}

	$('#primary_category').html('');

	primary_page_state= const_primary_state;

	var listHTML= '', listID= '';
	for(var i=0; i < aPrimaries.length; i++)
	{
		listID= aPrimaries[i].Name;
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listID= listID.replace('/', '_');
		listHTML+= 
		'<li><a id="' + listID + '">' 
			+ aPrimaries[i].Name 
			+ '<span class="ui-li-count">' + aPrimaries[i].Count + '</span>'
		+ "</a></li>";
	}	
	$('#pp_metroAreasList').html(listHTML);

	for(var i=0; i < aPrimaries.length; i++)
	{
		listID= aPrimaries[i].Name;
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listID= listID.replace('/', '_');
		$('#' + listID).on('click', function(event, ui) 
		{
			$('#primary_category').html('- ' + this.innerHTML.split('<')[0] + ' -');
			if(primary_page_type == const_metro_area)
			{
				getCategories_Count_forPrimaryMetroArea(this.innerHTML.split('<')[0]);
			}
			else if(primary_page_type == const_countries)
			{
				getCategories_Count_forPrimaryCountry(this.innerHTML.split('<')[0]);
			}
		});
	}	
	$('#pp_metroAreasList').listview('refresh');
}




function loadPrimaryCategoryList()
{
	var listHTML= '';
	for(category in aPrimaryCategories_withCount)
	{
		listID= category + '_primary';
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/%/g, "");
		listID= listID.replace(/&/g, '_');
		listID= listID.replace(/,/g, '_');
		listID= listID.replace('/', '_');
		listHTML+= 
		'<li><a id="' + listID + '">' 
			+ category
			+ '<span class="ui-li-count">' + aPrimaryCategories_withCount[category] + '</span>'
		+ "</a></li>";
	}
	listHTML+= '<li><a id="Everything_Primary">Everything</a></li>';
	$('#pp_metroAreasList').html(listHTML);

	$('#Everything_Primary').on('click', function(e)
	{
		b_MetroAreaListings= true;
		b_NearbyListings= false;
		b_SearchListings= false;
		b_OnlineListings= false;
		SE_Category= 'Everything';
		if(primary_page_type == const_metro_area)
		{
			getSEs_forPrimaryMetroArea_andCategory(SE_Category);
		}
		else if(primary_page_type == const_countries)
		{
			getSEs_forPrimaryCountry_andCategory(SE_Category);
		}
	});

	for(category in aPrimaryCategories_withCount)
	{
		listID= category + '_primary';
		listID= listID.replace(/\s/g, "");
		listID= listID.replace(/%/g, "");
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
			var categoryKey= SE_Category.split('_')[0].replace(/&amp;/g, '&');
			if(primary_page_type == const_metro_area)
			{
				getSEs_forPrimaryMetroArea_andCategory(categoryKey);
			}
			else if(primary_page_type == const_countries)
			{
				getSEs_forPrimaryCountry_andCategory(categoryKey);
			}
		});
	}
	$('#pp_metroAreasList').listview('refresh');
}


