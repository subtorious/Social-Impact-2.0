var SE, businessListResults, resultsClickedIndex, 
	bApproving_InProcess= false, bDeclining_InProcess= false;

$(document).on('pageinit', '#SE_Page', function(e)
{
	$('#SE_Page_Logout').css('visibility', 'hidden');	
});


$(document).on("pageshow", "#SE_Page", function(event, ui) 
{
	if(!SE)
	{
		$.mobile.changePage('#SE_List_Page');
		return;
	}

	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
	if(Parse.User.current())
	{
		$('#SE_Page_Logout').css('visibility', 'visible');
	}
	else
	{
		$.mobile.changePage('#SE_Login_Page');
		return;
	}

	var bApproved, bDeclined;
	if(bParse)
	{
		bApproved= SE.get('Approved');
		bDeclined= SE.get('Declined');
	}
	else
	{
		bApproved= SE.Approved;
		bDeclined= SE.Declined;
	}

	if(bApproved)
	{
		setApproveButton(true);	
	}
	else
	{
		setApproveButton(false);
	}
	if(bDeclined)
	{
		setDeclineButton(true);	
	}
	else
	{
		setDeclineButton(false);
	}	

	resizeBusinessPage();
	populateBusinessPage();
    $.mobile.silentScroll(0);
});


$(document).on('pagebeforehide', '#SE_Page', function(e)
{
	bGoToLastScrollPos= true;
});


function populateBusinessPage()
{
	if(bParse)
	{
		populateBusinessPage_Parse();
		return;
	}

	var nameSectionHTML= '';
	if($.inArray('Social Enterprise Alliance', SE.Categories) >= 0)
	{
		nameSectionHTML+= '<img src="img/sea.jpg" width="50px" style="float:right; cursor:hand; cursor: pointer;" title="Social Enterprise Alliance" onclick="openSEA_Website()"/>';
	}
	nameSectionHTML+= '<h3>' + SE.Name + '</h3>';
	$('#businessName_li').html(nameSectionHTML);
	populate_bp_section1();
	populate_bp_section2();
	populate_bp_section3();
}



function populate_bp_section1()
{
	if(bParse)
	{
		populate_bp_section1_Parse();
		return;
	}

	var photo= SE.Photo;
	if(photo == undefined || photo == null)
	{
		photo= '';
	}
	console.log(photo);

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



function populate_bp_section2()
{
	if(bParse)
	{
		populate_bp_section2_Parse();
		return;
	}

	var bp_section2_html,
		str_Location= SE.Location,
		str_Phone= SE.Phone,
		str_Website= SE.Website,
		bHasWebsite= false;

	if(str_Location != undefined && str_Location != null && !(str_Location === ''))
	{
		bp_section2_html= '<a onclick="bp_section2_location_clicked()" data-role="button" class="bp_section2_button" id="bp_section2_location" data-theme="d">'+str_Location+'</a>';
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


function populate_bp_section3()
{
	if(bParse)
	{
		populate_bp_section3_Parse();
		return;
	}

	var businessInfo3_HTML= '';

	categories= SE.Categories;
	if(categories == undefined || categories == null)
	{
		categories= new Array();
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Categories: ';
	var aCategories= categories.split('","');
	for(var i=0; i<aCategories.length; ++i)
	{
		businessInfo3_HTML+= aCategories[i].replace(/"/g, '') +', ';
	}
	businessInfo3_HTML+= '</li>';

	contactName= SE.ContactName;
	if(contactName == undefined || contactName == null)
	{
		contactName= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Contact Name: '+contactName+'</li>';

	contactEmail= SE.ContactEmail;
	if(contactEmail == undefined || contactEmail == null)
	{
		contactEmail= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Contact Email: '+contactEmail+'</li>';

	metroArea= SE.MetroArea;
	if(metroArea == undefined || metroArea == null)
	{
		metroArea= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Metro Area: '+metroArea+'</li>';

	shopOnline= SE.ShopOnline;
	if(shopOnline == undefined || shopOnline == null)
	{
		shopOnline= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Shop Online: '+shopOnline+'</li>';

	$('#bp_section3_ul').html(businessInfo3_HTML);
	$('#bp_section3_ul').listview('refresh');

}


function approve_se()
{
	if(bParse)
	{
		approve_se_Parse();
		return;
	}

	if(bApproving_InProcess)
	{
		return;
	}
	bApproving_InProcess= true;
	showLoading();

	$.ajax(
	{
	    type: 'POST',
	    url: 'php/approve_se.php',
	    data:{ SE: SE },
	    dataType: 'json',
	    success: function(data)
	    {
		    if(strcmp(data, '-1') != const_StringsEqual)
		    {
		    	SE= data;
		    	console.log("Approved= "+ SE.Name);
		    	setApproveButton(true);
		    	setDeclineButton(false);
		    	bApproving_InProcess= false;
		    	stopLoading();
		    }
		}							   
	});
}


function unapprove_se()
{
	if(bParse)
	{
		unapprove_se_Parse();
		return;
	}

	if(bApproving_InProcess)
	{
		return;
	}
	bApproving_InProcess= true;
	showLoading();

	$.ajax(
	{
	    type: 'POST',
	    url: 'php/unapprove_se.php',
	    data:{ SE: SE },
	    dataType: 'json',
	    success: function(data)
	    {
		    if(strcmp(data, '-1') != const_StringsEqual)
		    {
		    	SE= data;
		    	console.log("Unapproved= "+ SE.Name);
				setApproveButton(false)
				bApproving_InProcess= false;
				stopLoading();
		    }
		}							   
	});
}


function decline_se(bDecline)
{
	if(bApproving_InProcess)
	{
		return;
	}
	bApproving_InProcess= true;
	showLoading();

	var nDecline;
	if(bDecline)
	{	
		nDecline= 1;
	}
	else
	{
		nDecline= 0;
	}

	$.ajax(
	{
	    type: 'POST',
	    url: 'php/decline_se.php',
	    data:{ SE: SE, Decline: nDecline },
	    dataType: 'json',
	    success: function(data)
	    {
		    if(strcmp(data, '-1') != const_StringsEqual)
		    {
		    	SE= data;
		    	console.log("Declined= "+ SE.Name);
		    	bApproving_InProcess= false;
		    	stopLoading();
		    	if(SE.Approved)
		    	{
		    		unapprove_se();
		    	}
		    }
		}							   
	});
}

function resizeBusinessPage()
{
	var header_height= $('#SE_PageHeader').height();
	$('#SE_PageContent').css('padding-top', header_height);
}

function bp_section2_location_clicked()
{
	SE_GeoLocation= SE.get('GeoLocation')
	if(SE_GeoLocation != undefined || SE_GeoLocation != null)
	{
		SE_GoogleGeoLocation= new google.maps.LatLng(SE_GeoLocation.latitude, SE_GeoLocation.longitude);
		$.mobile.changePage( "#mapPage", { transition: "none"} );
	}
}



function approve_btn_press()
{
	var bseApproved;
	if(bParse)
	{
		bseApproved= SE.get('Approved');
	}
	else
	{
		bseApproved= SE.Approved;
	}

	if(bseApproved)
	{
		unapprove_se();
	}
	else
	{
		approve_se();
	}
}


function decline_btn_press()
{
	if(bParse)
	{
		decline_btn_press_parse();
		return;
	}

	if(SE.Declined)
	{
		setDeclineButton(false)
		decline_se(false);
	}
	else
	{
		setDeclineButton(true)
		decline_se(true);
	}
}





function setApproveButton(bApproved)
{
	if(bApproved)
	{
		$('#approve_button').css('background', '#aaa');
		$('#approve_button').css('color', '#0a0');
		$('#approve_button_check').css('visibility', 'visible');
	}
	else
	{
		$('#approve_button').css('background', '#0a0');
		$('#approve_button').css('color', '#fff');
		$('#approve_button_check').css('visibility', 'hidden');
	}	
}

function setDeclineButton(bApproved)
{
	if(bApproved)
	{
		$('#decline_button').css('background', '#aaa');
		$('#decline_button').css('color', '#a00');
		$('#decline_button_x').css('visibility', 'visible');
	}
	else
	{
		$('#decline_button').css('background', '#a00');
		$('#decline_button').css('color', '#fff');
		$('#decline_button_x').css('visibility', 'hidden');
	}	
}



function showLoading(strMessage)
{
	$.mobile.loading('show',
	{
		text: strMessage,
		textVisible: true,
		theme: 'a',
		html: ""
	});
}

function stopLoading()
{
	$.mobile.loading('hide')
}


// -------------------Parse Functions---------------------
function populateBusinessPage_Parse()
{
	var nameSectionHTML= '';
	if($.inArray('Social Enterprise Alliance', SE.get('Categories')) >= 0)
	{
		nameSectionHTML+= '<img src="img/sea.jpg" width="50px" style="float:right; cursor:hand; cursor: pointer;" title="Social Enterprise Alliance" onclick="openSEA_Website()"/>';
	}
	nameSectionHTML+= '<h3>' + SE.get('Name') + '</h3>';
	$('#businessName_li').html(nameSectionHTML);
	populate_bp_section1();
	populate_bp_section2();
	populate_bp_section3();
}



function populate_bp_section1_Parse()
{
	var photo= SE.get('Photo'), photoURL= '';
	if(photo != undefined || photo != null)
	{
		if(photo.url != null || photo.url != undefined)
		{
			photoURL= photo.url;
		}
		
	}

	var details= SE.get('Details');
	if(details == undefined || details == null)
	{
		details= ''; 
	}

	var businessInfo1_HTML=
	  '<li class="businessPage_li businessInfo1_li" id="bp_details_image_li">'
		  +'<div id="bp_details_image">'
			  +'<img class="bussinessImage" id="bp_image" src="' + photoURL + '"/>'
			  + details
		  +'</div>'
	  +'</li>';
	
	var socialImpact= SE.get('SocialImpact');
	if(socialImpact == undefined || socialImpact == null)
	{
		socialImpact= '';
	}
	businessInfo1_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li" >' 
							 + socialImpact 
						 +'</li>';
	var bHasHours= false;
	if(SE.get('Hours') != undefined)
	{
		bHasHours= true;
		businessInfo1_HTML+= '<li class="businessPage_li businessInfo1_li" id="businessPage_Hours">' 
							     + SE.get('Hours') 
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



function populate_bp_section2_Parse()
{
	var bp_section2_html,
		str_Location= SE.get('Location'),
		str_Phone= SE.get('Phone'),
		str_Website= SE.get('Website'),
		bHasWebsite= false;

	if(str_Location != undefined && str_Location != null && !(str_Location === ''))
	{
		bp_section2_html= '<a onclick="bp_section2_location_clicked()" data-role="button" class="bp_section2_button" id="bp_section2_location" data-theme="d">'+str_Location+'</a>';
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


function populate_bp_section3_Parse()
{
	var businessInfo3_HTML= '';

	categories= SE.get('Categories');
	if(categories == undefined || categories == null)
	{
		categories= new Array();
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Categories: ';
	for(var i=0; i<categories.length; ++i)
	{
		businessInfo3_HTML+= categories[i] +', ';
	}
	businessInfo3_HTML+= '</li>';

	contactName= SE.get('ContactName');
	if(contactName == undefined || contactName == null)
	{
		contactName= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Contact Name: '+contactName+'</li>';

	contactEmail= SE.get('ContactEmail');
	if(contactEmail == undefined || contactEmail == null)
	{
		contactEmail= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Contact Email: '+contactEmail+'</li>';

	metroArea= SE.get('MetroArea');
	if(metroArea == undefined || metroArea == null)
	{
		metroArea= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Metro Area: '+metroArea+'</li>';

	shopOnline= SE.get('ShopOnline');
	if(shopOnline == undefined || shopOnline == null)
	{
		shopOnline= '';
	}
	businessInfo3_HTML+= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li">Shop Online: '+shopOnline+'</li>';

	$('#bp_section3_ul').html(businessInfo3_HTML);
	$('#bp_section3_ul').listview('refresh');

}


function approve_se_Parse()
{
	if(bApproving_InProcess)
	{
		return;
	}
	bApproving_InProcess= true;
	showLoading();

	var SocialEnterprise = Parse.Object.extend("SocialEnterprise");
	var socialenterprise = new SocialEnterprise();

	socialenterprise.set('Photo', SE.get('Photo'));
	socialenterprise.set("Categories", SE.get('Categories'));
	socialenterprise.set("ContactEmail", SE.get('ContactEmail'));
	socialenterprise.set("ContactName", SE.get('ContactName'));
	socialenterprise.set("Details", SE.get('Details'));
	socialenterprise.set("Hours", SE.get('Hours'));
	socialenterprise.set("Location", SE.get('Location'));
	socialenterprise.set("Name", SE.get('Name'));
	socialenterprise.set("Phone", SE.get('Phone'));
	socialenterprise.set("ShopOnline", SE.get('ShopOnline'));
	socialenterprise.set("SocialImpact", SE.get('SocialImpact'));
	socialenterprise.set("Website", SE.get('Website'));
	socialenterprise.set('MetroArea', SE.get('MetroArea'));
	socialenterprise.set("GeoLocation", SE.get('GeoLocation'));

	socialenterprise.save(null, 
	{
		success: function(new_socialenterprise) 
		{
			SE.set('Approved_ID', new_socialenterprise.id);
			setApproveButton(true)
			SE.set('Approved', true);
			setDeclineButton(false);
			SE.set('Declined', false);
			SE.save();
			bApproving_InProcess= false;
			stopLoading();
		},
		error: function(pending_SE, error) 
		{
			console.log('se_page.js:: approve_se():: error()');
			bApproving_InProcess= false;
			stopLoading();
		}
	});
}


function unapprove_se_Parse()
{
	if(bApproving_InProcess)
	{
		return;
	}
	bApproving_InProcess= true;
	showLoading();

	var SocialEnterprise = Parse.Object.extend("SocialEnterprise");
	var query = new Parse.Query(SocialEnterprise);
	query.get(SE.get('Approved_ID'), 
	{
		success: function(se_approved) 
		{
			se_approved.destroy(
			{
				success: function(myObject) 
				{
					console.log('Successfully deleted SE.');
					SE.set('Approved_ID', '');
					setApproveButton(false)
					SE.set('Approved', false);
					SE.save();
					bApproving_InProcess= false;
					stopLoading();
				},
				error: function(myObject, error) 
				{
					console.log('SE Failed to Delete.');
					bApproving_InProcess= false;
					stopLoading();
				}
			});
		},
		error: function(object, error) 
		{
			console.log('se_page.js:: unapprove_se():: error()');
			bApproving_InProcess= false;
			stopLoading();
		}
	});
}


function decline_btn_press_parse()
{
	if(SE.get('Declined'))
	{
		setDeclineButton(false)
		SE.set('Declined', false);
	}
	else
	{
		setDeclineButton(true)
		SE.set('Declined', true);
		unapprove_se();
	}
	SE.save();
}
// -------------------END Parse Functions---------------------








