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


// $(document).on('pageshow', '#primary_page', function(e)
// {
// 	getPrimaryMetroAreas();
// });


function getPrimaryCountries()
{
	si_log('getPrimaryCountries');

	$('#primary_name').html('Primary Countries');
	$('#pp_metroAreasList').html('');
}


function getPrimaryMetroAreas()
{
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
					aMetroAreas= jsonResponse['MetroAreas'];
					if(aMetroAreas == null || aMetroAreas == undefined)
					{
						si_log('primary_page.js:: getMetroAreas():: if(aMetroAreas == null || aMetroAreas == undefined)')
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
		            		si_log('primary_page.js:: getMetroArea:: if(str_name == null || str_name == undefined)');
		            	}
		            }

					loadPrimaryMetroAreaList();
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




function loadPrimaryMetroAreaList()
{
	if(aMetroAreas.length <= 0)
	{
		si_log('primary_page.js:: loadMetroAreaList():: if(aMetroArea_list.length <= 0)');
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
	$('#pp_metroAreasList').html(listHTML);

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
	$('#pp_metroAreasList').listview('refresh');
}



function getSEs_forMetroArea(metroArea)
{
	if(metroArea == null || metroArea == undefined)
	{
		si_log('primary_page.js:: getSEs_forMetroArea():: if(metroArea == null || metroArea == undefined)');
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
						si_log('primary_page.js:: getSEs_forMetroArea():: if(aSEs_MetroArea == null || aSEs_MetroArea == undefined)')
					}
					$.mobile.changePage('#businessListPage');
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