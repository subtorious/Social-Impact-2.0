var aPrimary_SEs= undefined, bPrimaryMetroArea,
	const_primary_state= 0, const_category_state= 1,
	const_metro_area= 0, const_countries= 1,
	primary_page_state= const_primary_state,
	primary_page_type= const_metro_area,
	aPrimaries, selected_primary_country,
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

					loadPrimaryCategoryList_forCountry();
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





function getSEs_forPrimaryMetroArea(metroArea)
{
	if(metroArea == null || metroArea == undefined)
	{
		si_log('primary_page.js:: getSEs_forMetroArea():: if(metroArea == null || metroArea == undefined)');
		return;
	}

	primary_page_state= const_category_state;
	selected_primaryArea= metroArea;

	$.ajax(
	{
	    type: 'GET',
	    url: urlForScript('php/getSEs_forMetroArea.php'),
	    data: {ma: metroArea},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200 && oXMLHttpRequest.responseText != -1)
		    {
		    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
				if(jsonResponse != null)
				{
					aPrimary_SEs= jsonResponse['SEs_forMetroArea'];
					if(aPrimary_SEs == null || aPrimary_SEs == undefined)
					{
						si_log('primary_page.js:: getSEs_forMetroArea():: if(aPrimary_SEs == null || aPrimary_SEs == undefined)')
					}
					loadPrimaryCategoryList();
				}
				else
				{
					si_log('primary_page.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	si_log('primary_page.js:: getSEs_forMetroArea():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
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
				getSEs_forPrimaryMetroArea(this.innerHTML.split('<')[0]);				
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
	var oCategoriesWithCounts= new Object();
	var se;
	var aCategories;
	for(var i=0; i < aPrimary_SEs.length; ++i)
	{
		se= aPrimary_SEs[i];
		if(se != undefined && se != null)
		{
			aCategories= se.Categories.split('","');
			var category;
			for(var k= 0; k < aCategories.length; ++k)
			{
				category= aCategories[k];
				category= category.replace(/"/g, '');
				if(category != null && category != undefined && category != '')
				{
					if(category in oCategoriesWithCounts)
    				{
    					oCategoriesWithCounts[category].count+= 1;
    					oCategoriesWithCounts[category].aSEs.push(se);
    				}
    				else
    				{
    					oCategoriesWithCounts[category]= {count: 1, aSEs: new Array()};
    					oCategoriesWithCounts[category].aSEs.push(se);
    				}
				}
			}
		}
	}

	var listHTML= '';
	for(category in oCategoriesWithCounts)
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
			+ '<span class="ui-li-count">' + oCategoriesWithCounts[category].count + '</span>'
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
		aSEs_Primary= aPrimary_SEs;
		$.mobile.changePage('#businessListPage');
	});

	for(category in oCategoriesWithCounts)
	{
		listID= category + '_primary';
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
			var categoryKey= SE_Category.split('_')[0].replace(/&amp;/g, '&');
			aSEs_Primary= oCategoriesWithCounts[categoryKey].aSEs;
			$.mobile.changePage('#businessListPage');
		});
	}
	$('#pp_metroAreasList').listview('refresh');
}







function loadPrimaryCategoryList_forCountry()
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
		getSEs_forPrimaryCountry_andCategory(SE_Category);		
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
			getSEs_forPrimaryCountry_andCategory(categoryKey);
		});
	}
	$('#pp_metroAreasList').listview('refresh');
}
















