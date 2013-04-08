var businessListResults, resultsClickedIndex, SE_forBusinessPage= null, 
	SE_ID_fromHash= null, bBusinessPage_LoadedFromParam= false,
	bBusinessPageActive= false, bCameFromMapPage= false;
	// bMakeBackHome=false;

$(document).on('pageinit', '#businessPage', function(event, ui)
{
	setupSearch('#searchInput_businessPage', '#searchInputHeader_businessPage');
});


$(document).on("pageshow", "#businessPage", function(event, ui) 
{ 
	bBusinessPageActive= true;

	if(google_UserGeoPoint == null)
	{
		getUsersGeoLocation();
	}

	if(bBusinessPage_LoadedFromParam)//SE_forBusinessPage == null)
	{
		if(SE_ID_fromHash != null)
		{
			loadSEFromID();
			makeBackButtonHome(true);
		}
		else 
		{
			$.mobile.changePage('#home_page');
		}
		return;
	}
	else if(!bCameFromMapPage)
	{
		makeBackButtonHome(false);
	}

	initBusinessPage();
	bCameFromMapPage= false;
});


$(document).on('pagebeforehide', '#businessPage', function(e)
{
	bGoToLastScrollPos= true;
	bBusinessPageActive= false;
});



function initBusinessPage()
{
	var SE;
	if(bParse)
	{
		SE=
		{
			id: SE_forBusinessPage.id, 
			Name: SE_forBusinessPage.get('Name'),
			Details: SE_forBusinessPage.get('Details'),
			Photo: SE_forBusinessPage.get('Photo'),
			SocialImpact: SE_forBusinessPage.get('SocialImpact'),
			Hours: SE_forBusinessPage.get('Hours'),
			Location: SE_forBusinessPage.get('Location'),
			Website: SE_forBusinessPage.get('Website'),
			Categories: SE_forBusinessPage.get('Categories'),
			MetroArea: SE_forBusinessPage.get('MetroArea'),
			ShopOnline: SE_forBusinessPage.get('ShopOnline'),
			Latitude: SE_forBusinessPage.get('Latitude'),
			Longitude: SE_forBusinessPage.get('Longitude'),
			ContactEmail: SE_forBusinessPage.get('ContactEmail'),
			ContactName: SE_forBusinessPage.get('ContactName'),
			DistanceToUser: null
		};
	}
	else
	{
		SE= SE_forBusinessPage;
	}
	
	populateBusinessPage(SE);
    $.mobile.silentScroll(0);
    pageshowGoogleAnalytics();
    window.history.replaceState( null , null,  document.location.href + "?se=" + SE.id);
}


function populateBusinessPage(SE)
{
	var nameSectionHTML= '';
	if($.inArray('Social Enterprise Alliance', SE.Categories) >= 0)
	{
		nameSectionHTML+= '<img src="Images/sea.jpg" width="50px" style="float:right; cursor:hand; cursor: pointer;" title="Social Enterprise Alliance" onclick="openSEA_Website()"/>';
	}
	nameSectionHTML+= '<h3>' + SE.Name + '</h3>';
	$('#businessName_li').html(nameSectionHTML);
	populate_bp_section1(SE);
	populate_bp_section2(SE);
}



function populate_bp_section1(SE)
{
	var photo= SE.Photo;
	if(photo != undefined && photo != null)
	{
		if(bParse)
		{
			if(photo.url != null && photo.url != undefined)
			{
				photo= photo.url;
			}
			else
			{
				photo= 'Images/SocialImpact_ICON_Image1024.png';
			}
		}
	}
	else
	{
		photo= 'Images/SocialImpact_ICON_Image1024.png';
	}

	var details= SE.Details;
	if(details == undefined || details == null)
	{
		details= ''; 
	}

	var businessInfo1_HTML=
	  '<li class="businessPage_li businessInfo1_li" id="bp_details_image_li">'
		  +'<div id="bp_details_image">'
			  +'<img class="bussinessImage" id="bp_image" src="' + photo + '"/>'
			  + details
		  +'</div>'
	  +'</li>';
	
	var socialImpact= SE.SocialImpact;
	if(socialImpact == undefined || socialImpact == null)
	{
		socialImpact= '';
	}
	businessInfo1_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li" >' 
							 + socialImpact 
						 +'</li>';
	var bHasHours= false;
	if(SE.Hours != undefined)
	{
		bHasHours= true;
		businessInfo1_HTML+= '<li class="businessPage_li businessInfo1_li" id="businessPage_Hours">' 
							     + SE.Hours 
						     + '</li>';
	}
	$('#bp_section1_ul').html(businessInfo1_HTML);
	if(bHasHours)
	{
		$('#businessPage_Hours').css('border-bottom', 'none');
	}
	else
	{
		$('#businessPage_socialImpact').css('border-bottom', 'none');
	}

	$('#bp_image').load(function() 
	{
		var height= $('#bp_image').height() + 15;
		$('#bp_details_image').css('min-height', height);
	});
	$('#bp_section1_ul').listview('refresh');
}



function populate_bp_section2(SE)
{
	var bp_section2_html,
		str_Location= SE.Location,
		str_Phone= SE.Phone,
		str_Website= SE.Website,
		bHasWebsite= false;

	if(str_Location != undefined && str_Location != null && !(str_Location === ''))
	{
		bp_section2_html= '<a href="#mapPage" onclick="bp_location_clicked()" data-role="button" class="bp_section2_button" id="bp_section2_location" data-theme="d">'+str_Location+'</a>';
	}
	if(str_Phone != undefined && str_Phone != null && !(str_Phone === ''))
	{
		var formated_phone= str_Phone.replace(/\s/g, "");
		formated_phone= formated_phone.replace(/\(/g, "");
		formated_phone= formated_phone.replace(/\)/g, "-");

		bp_section2_html+= '<a ';
		if(isiPhone() || isAndroid())
		{
			bp_section2_html+= 'href="tel:'+formated_phone+'"';
		}
		bp_section2_html+= ' data-role="button" class="bp_section2_button" id="bp_section2_phone" data-theme="d">'+formated_phone+'</a>';
	}
	if(str_Website != undefined && str_Website != null && !(str_Website === ''))
	{
		bHasWebsite= true;
		bp_section2_html+= '<a data-role="button" class="bp_section2_button" id="bp_section2_website" target="_blank" data-theme="d">'+str_Website+'</a>';
	}
	$('#bp_section2').html(bp_section2_html);
	$('#bp_section2').trigger('create');

	if(bHasWebsite)
	{
		var bp_section2_website= $('#bp_section2_website');
		if(str_Website.indexOf("http://") < 0) 
		{
	       str_Website= 'http://' + str_Website;
	    }
	    bp_section2_website.attr('href', str_Website);
	}
}


function bp_location_clicked()
{
	if(bBusinessPage_LoadedFromParam)
	{	
		makeBackButtonHome(true);
	}
}


function loadSEFromID()
{
	// bMakeBackHome= true;
	makeBackButtonHome(true);
	if(bParse)
	{
		Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
		var SocialEnterprise = Parse.Object.extend('SocialEnterprise');
		var query = new Parse.Query(SocialEnterprise);
		query.get(SE_ID_fromHash, 
		{
			success: function(se) 
			{
				SE_forBusinessPage= se;
				initBusinessPage();
			},
			error: function(object, error) 
			{
				console.log('businessPage.js:: loadSEFromID():: error');
				$.mobile.changePage('#home_page');
			}
		});
	}
	else
	{
		$.ajax(
		{
		    type: 'GET',
		    url: 'php/getSE_forID.php',
		    data: {id: SE_ID_fromHash},
		    dataType: 'json',
		    complete: function(oXMLHttpRequest, textStatus)
		    {
			    if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, '-1') != const_StringsEqual)
			    {
			    	var jsonResponse= $.parseJSON(oXMLHttpRequest.responseText);
					if(jsonResponse != null)
					{
						SE_forBusinessPage= jsonResponse['SE_forID'];
						if(SE_forBusinessPage == null || SE_forBusinessPage == undefined)
						{
							console.log('businessPage.js:: loadSEFromID():: if(SE_forBusinessPage == null || SE_forBusinessPage == undefined)')
						}
						initBusinessPage();
					}
					else
					{
						console.log('businessPage.js:: loadSEFromID:: if(jsonResponse != null)');
					}
					
					return;
			    }
			    else
			    {
			    	console.log('businessPage.js:: loadSEFromID():: if(oXMLHttpRequest.status === 200 && strcmp(oXMLHttpRequest.responseText, -1) != const_StringsEqual)');
			    }
			}							   
		});
	}	
}




function makeBackButtonHome(bMakeHome)
{
	if(bMakeHome)//bMakeBackHome)
	{
		$('#businessPage_Back .ui-btn-text').html('Home');
		$('#businessPage_Back').attr('href', '#home_page');
		// bMakeBackHome= false;
	}
	else
	{
		$('#businessPage_Back .ui-btn-text').html('Back');
		$('#businessPage_Back').attr('href', '#businessListPage');
	}
}

