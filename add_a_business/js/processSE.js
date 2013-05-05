var bReadyToSubmit= true,
	ContactName,
	ContactEmail,
	Name,
	Address,
	Latitude,
	Longitude,
	parse_UserGeoPoint,
	City,
	State,
	Provice,
	Zip,
	Country,
	strLocation,
	Hours,
	Phone,
	Website,
	Details,
	SocialImpact,
	Categories= new Array(), strCategories,
	nShopOnline= 0,
	MetroArea,
	imageFileResponse= null,
	bSE_SuccessfullySubmitted= false,
	bPhotoAssociated= false,
	submittedObjectID= null,
	bGetMetroAreas_FirstTry= true,
	aMetroAreas= null, oMetroAreas= new Object(),
	photoURL;



$(document).on('pagecreate', '#AddABusinessPage', function(e)
{	
	$('#fileselect').bind("change", function(e) 
	{
		if(!bSE_SuccessfullySubmitted)
		{
			var files = e.target.files || e.dataTransfer.files;
			if(bParse)
			{
				uploadImageFileToParse(files[0]);
			}
			else
			{
				uploadImageFile(files[0]);		
			}
		}
	});

	$('#add_a_business_version').html(appVersion);
	setupOtherInputs();
});

$(document).on('pageshow', '#AddABusinessPage', function(e)
{
	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");
	if(Parse.User.current())
	{
		if(bParse)
		{
			getMetroAreasFromParse();
		}
		else
		{
			getMetroAreas();
		}
		$('#ContactEmail').attr('value', Parse.User.current().get('email'));
	}
	else
	{
		$.mobile.changePage('#SE_Signup_Page');
	}	
});



function getMetroAreasFromParse()
{
	if(aMetroAreas != null)
	{
		return;
	}

	var MetroAreasClass = Parse.Object.extend("MetroAreas");
    var metroArea_query = new Parse.Query(MetroAreasClass); 
    metroArea_query.ascending('Name');
    metroArea_query.find(
    {
        success: function(results)
        {
        	aMetroAreas= results;
            loadMetroAreaList();
        },
        error: function(error)
        {
            console.log("Error: " + error.code + " " + error.message);
            if(bGetMetroAreas_FirstTry)
            {
            	bGetMetroAreas_FirstTry= false;
            	getMetroAreasFromParse();
            }
        }
    });
}

function getMetroAreas()
{
	if(aMetroAreas != null)
	{
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: 'php/getMetroAreas.php',
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
						console.log('processSE.js:: getMetroAreas():: if(aMetroAreas == null || aMetroAreas == undefined)');
						return;
					}
					loadMetroAreaList();					
				}
				else
				{
					console.log('processSE.js:: getMetroAreas:: if(jsonResponse != null)');
				}
				
				return;
		    }
		}							   
	});
}

function loadMetroAreaList()
{
	if(aMetroAreas == null || aMetroAreas == undefined || aMetroAreas.length <= 0)
	{
		console.log('process.js;: loadMetroAreaList():: if(aMetroAreas == null || aMetroAreas == undefined || aMetroAreas.length)');
		return;
	}

	var metroAreaHTML= '';
	var MA_ID, ma_name, choice_number= 1;
	for(var i=0; i<aMetroAreas.length; ++i)
	{
		if(bParse)
		{
			ma_name= aMetroAreas[i].get('Name');
		}
		else
		{
			ma_name= aMetroAreas[i];
		}
		MA_ID= 'MA_' + ma_name.replace("/", "").replace(/\s+/g, '');
		metroAreaHTML+=
			'<input type="radio" name="radio-choice" id="'+MA_ID+'" value="choice-'+choice_number+'" />'
			+'<label for="'+MA_ID+'">'+ma_name+'</label>';
		++choice_number;

		oMetroAreas[MA_ID]= ma_name;
	}

	$('#MetroAreas_List').append(metroAreaHTML);
	$('#MetroArea_fieldcontain').trigger('create');

	// for(a in oMetroAreas)
	// {
	// 	console.log(a + ' : ' + oMetroAreas[a]);
	// }
}


function setupOtherInputs()
{
	$('#Other1_input').css('visibility', 'hidden');
	$('#Other1_label').on('click', function(e)
	{
		if($('#Other1').is(":checked"))
		{
			$('#Other1_input').css('visibility', 'hidden');
		}
		else
		{
			$('#Other1_input').css('visibility', 'visible');			
		}
	});

	$('#Other2_input').css('visibility', 'hidden');
	$('#Other2_label').on('click', function(e)
	{
		if($('#Other2').is(":checked"))
		{
			$('#Other2_input').css('visibility', 'hidden');
		}
		else
		{
			$('#Other2_input').css('visibility', 'visible');			
		}
	});
}


function uploadImageFileToParse(imageFile)
{
	if(imageFile == null || imageFile == undefined)
	{
		$('#ImageUploadLabel').css('color', '#f00');
		bReadyToSubmit= false;
		alert('Please upload an image for your Social Enterprise.');
		return;
	}
	else
	{
		$('#ImageUploadLabel').css('color', '#fff');
	}

	var serverUrl = 'https://api.parse.com/1/files/' + imageFile.name;
	$.ajax(
	{
		type: "POST",
		beforeSend: function(request) 
		{
			request.setRequestHeader("X-Parse-Application-Id", 'Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s');
			request.setRequestHeader("X-Parse-REST-API-Key", 'aWfnnVMRjVdnesTiN8pWhRpioRwKS99wcIlMb9zS');
			request.setRequestHeader("Content-Type", imageFile.type);
		},
		url: serverUrl,
		data: imageFile,
		processData: false,
		contentType: false,
		success: function(data) 
		{
			if(data)
			{
				if(data.name)
				{
					imageFileResponse= data;
				}
				else
				{
					imageFileResponse= $.parseJSON(data);
				}
			}

			if(imageFileResponse == null || imageFileResponse == undefined)
			{
				console.log('uploadImageFileToParse(imageFile):: if(imageFileResponse == null || imageFileResponse == undefined)');
			}
			else
			{
				$('#ImageUploadLabel').css('color', '#0b0');
			}
		},
		error: function(data) 
		{
			var obj = $.parseJSON(data);
			alert(obj.error);
		}
	});
}


function uploadImageFile(imageFile)
{
	if(imageFile == null || imageFile == undefined)
	{
		$('#ImageUploadLabel').css('color', '#f00');
		bReadyToSubmit= false;
		alert('Please upload an image for your Social Enterprise.');
		return;
	}
	else
	{
		$('#ImageUploadLabel').css('color', '#fff');
	}

	var oFormData = new FormData();
	oFormData.append('file', imageFile);
	oFormData.append('name', imageFile.name);

	$.ajax(
	{
		url: 'php/upload_image.php',
		type: 'POST',
		xhr: function() 
		{
			myXhr = $.ajaxSettings.xhr();
			myXhr.upload;			
			return myXhr;
		},
		success: function(data)
		{
			console.log("SUCCESS file path= " + data);
			photoURL= data;
			if(photoURL != null && photoURL != undefined && strcmp(photoURL, '') != const_StringsEqual && photoURL != -1) 
			{
				$('#ImageUploadLabel').css('color', '#0b0');
			}
			else
			{
				console.log("ERROR");
				alert('Trouble uploading image to server. Please try again or contact Rolfe@socialimpactapp.com.');
				$('#ImageUploadLabel').css('color', '#f00');
			}
		},
		error: function(data)
		{
			console.log("ERROR");
			alert('Trouble uploading image to server. Please try again or contact Rolfe@socialimpactapp.com.');
			$('#ImageUploadLabel').css('color', '#f00');
		},
		data: oFormData,
		cache: false,
		contentType: false,
		processData: false
	});
}



function submitButtonClicked()
{
	bReadyToSubmit= true;
	checkAndStoreRequiredFields();
	setSelectedMetroArea();
	fillArrayOfSelectedCategories();
	if(!bReadyToSubmit)
	{
		alert('Please fill in all required fields.')
		return;
	}

	var geocoder = new google.maps.Geocoder();
	if(geocoder) 
	{
		geocoder.geocode({ 'address': strLocation }, function (results, status) 
		{
			if (status == google.maps.GeocoderStatus.OK)
			{
				console.log(results[0].geometry.location);

				Latitude= results[0].geometry.location.lat();
				Longitude= results[0].geometry.location.lng();
				if(bParse)
				{
					parse_UserGeoPoint= new Parse.GeoPoint(parseFloat(Latitude), parseFloat(Longitude));
				}
			}
			else 
			{
				console.log("Geocoding failed: " + status);
			}

			if(bParse)
			{
				submitSEToParse();
			}
			else
			{
				submitSE();
			}
		});
	}
}



function checkAndStoreRequiredFields()
{
	if($('#ContactName').attr('value') == '')
	{
		$('#ContactNameLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#ContactNameLabel').css('color', '#fff');
		ContactName= $('#ContactName').attr('value'); 
	}

	if($('#ContactEmail').attr('value') == '')
	{
		$('#ContactEmailLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#ContactEmailLabel').css('color', '#fff');
		ContactEmail= $('#ContactEmail').attr('value'); 
	}

	if($('#Name').attr('value') == '')
	{
		$('#NameLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#NameLabel').css('color', '#fff');
		Name= $('#Name').attr('value'); 
	}

	if($('#Address').attr('value') == '')
	{
		$('#AddressLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#AddressLabel').css('color', '#fff');
		Address= $('#Address').attr('value');
	}

	if($('#City').attr('value') == '')
	{
		$('#CityLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#CityLabel').css('color', '#fff');
		City= $('#City').attr('value');
	}

	if($('#State').attr('value') == '')
	{
		$('#StateLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#StateLabel').css('color', '#fff');
		State= $('#State').attr('value');
	}

	if($('#Zip').attr('value') == '')
	{
		$('#ZipLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#ZipLabel').css('color', '#fff');
		Zip= $('#Zip').attr('value');
	}

	if($('#Country').attr('value') == '')
	{
		$('#CountryLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#CountryLabel').css('color', '#fff');
		Country= $('#Country').attr('value');
	}


	strLocation= Address + ', ' + City + ' ' + State + ', ' + Zip + ', ' + Country;


	Details= $('#Details').attr('value');
	if(Details == '' || Details.length > 130)
	{
		$('#DetailsLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#DetailsLabel').css('color', '#fff');
	}

	SocialImpact= $('#SocialImpact').attr('value');
	if(SocialImpact == '')
	{
		$('#SocialImpactLabel').css('color', '#f00');
		bReadyToSubmit= false;
	}
	else
	{
		$('#SocialImpactLabel').css('color', '#fff');
	}
}


function setSelectedMetroArea()
{
	$("input[name*=radio-choice]:checked").each(function() 
	{
        // alert($(this).attr('id'));
        MetroArea= oMetroAreas[$(this).attr('id')];
    });

	// return;

	// var MA_ID, ma_name, choice_number= 2;
	// for(var i=0; i<aMetroAreas.length; ++i)
	// {
	// 	if(bParse)
	// 	{
	// 		ma_name= aMetroAreas[i].get('Name');
	// 	}
	// 	else
	// 	{
	// 		ma_name= aMetroAreas[i];
	// 	}
	// 	MA_ID= '#MA_' + ma_name.replace('/', '').replace(/\s+/g, '');

	// 	if($(MA_ID).is(":checked"))
	// 	{
	// 		console.log(MA_ID + ' CHECKED');

	// 		MetroArea= ma_name;
	// 		break;
	// 	}
	// }
}



function fillArrayOfSelectedCategories()
{
	Categories= new Array();
	if($("#Restaurant").is(":checked"))
	{
		Categories.push('Food & Coffee');
	}
	if($("#Catering").is(":checked"))
	{
		if($.inArray('Food & Coffee', Categories) < 0)
		{
			Categories.push('Food & Coffee');
		}
	}
	if($("#Arts_Crafts").is(":checked"))
	{
		Categories.push('Arts, Crafts, & Clothing');
	}
	if($("#Retail").is(":checked"))
	{
		Categories.push('Other Retail');
	}
	if($("#b2b").is(":checked"))
	{
		Categories.push('Business to Business');
	}
	if($("#ProServices").is(":checked"))
	{
		Categories.push('Professional Services');
	}
	if($('#Other1').is(':checked'))
	{
		Categories.push($('#Other1_input').attr('value'));	
	}

	if(Categories.length == 0)
	{
		bReadyToSubmit= false;
		$('#categories_legend').css('color', '#f00').trigger('refresh');
		return;
	}


	if($("#Bcorp").is(":checked"))
	{
		Categories.push('B Corp');
	}
	if($("#Benefit").is(":checked"))
	{
		Categories.push('Benefit Corp');
	}
	if($("#Flex").is(":checked"))
	{
		Categories.push('Flexible Purpose Corp');
	}
	if($("#L3C").is(":checked"))
	{
		Categories.push('L3C');
	}
	if($("#Worker").is(":checked"))
	{
		Categories.push('Worker Owned Company');
	}
	if($("#GreenR").is(":checked"))
	{
		Categories.push('Green Restaurant Association');
	}
	if($("#GreenA").is(":checked"))
	{
		Categories.push('Green America Approved');
	}
	if($("#FairTrade").is(":checked"))
	{
		Categories.push('Fair Trade');
	}
	if($("#Double").is(":checked"))
	{
		Categories.push('Double or Triple Bottom Line');
	}	
	if($("#SEA").is(":checked"))
	{
		Categories.push('Social Enterprise Alliance');
	}
	if($('#Other2').is(':checked'))
	{
		Categories.push($('#Other2_input').attr('value'));	
	}

	if(!bParse)
	{
		strCategories= '';
		if(Categories.length > 0)
		{
			strCategories+= '"';
		}
		for(var i=0; i<Categories.length; ++i)
		{
			strCategories+= Categories[i];
			if(i + 1 < Categories.length)
			{
				strCategories+= '","'
			}
			else
			{
				strCategories+= '"';
			}
		}
	}

	if($("#ShopOnline_Yes").is(":checked"))
	{
		nShopOnline= 1;
	}
	else
	{
		nShopOnline= 0;
	}
}





function submitSEToParse()
{
	if(bReadyToSubmit)
	{
		var Pending_SE = Parse.Object.extend("Pending_SE");
		var pending_SE = new Pending_SE();

		pending_SE.set("Approved", false);
		pending_SE.set("Declined", false);
		pending_SE.set("Categories", Categories);
		pending_SE.set("ContactEmail", ContactEmail);
		pending_SE.set("ContactName", ContactName);
		pending_SE.set("Details", Details);
		pending_SE.set("Hours", $('#Hours').attr('value'));
		pending_SE.set("Location", strLocation);
		pending_SE.set("Name", Name);
		pending_SE.set("Phone", $('#Phone').attr('value'));
		pending_SE.set("ShopOnline", nShopOnline);
		pending_SE.set("SocialImpact", SocialImpact);
		pending_SE.set("Website", $('#Website').attr('value'));
		pending_SE.set('MetroArea', MetroArea);
		pending_SE.set('usersID', Parse.User.current().id);
		pending_SE.set('Paid', false);
		if(parse_UserGeoPoint != undefined && parse_UserGeoPoint != null)
		{
			pending_SE.set("GeoLocation", parse_UserGeoPoint);
		}

		pending_SE.save(null, 
		{
			success: function(pending_SE) 
			{
				bSE_SuccessfullySubmitted= true;
				associateFileWithParseObject(pending_SE.id);
			},
			error: function(pending_SE, error) 
			{
				alert('Failed to Submit your Social Enterprise. Please check all the fields and try again.');
			}
		});
	}	
}


function submitSE()
{
	$.ajax(
	{
	    type: 'POST',
	    url: 'php/submitSE.php',
	    data: 
	    { 
	    	Approved: false,
			Declined: false,
			Categories: strCategories,
			ContactEmail: ContactEmail,
			ContactName: ContactName,
			Details: Details,
			Hours: $('#Hours').attr('value'),
			Location: strLocation,
			Name: Name,
			Phone: $('#Phone').attr('value'),
			ShopOnline: nShopOnline,
			SocialImpact: SocialImpact,
			Website: $('#Website').attr('value'),
			MetroArea: MetroArea,
			usersID: Parse.User.current().id,
			Paid: false,
			Latitude: Latitude,
			Longitude: Longitude,
			Photo: photoURL
		},
	    dataType: 'json',
	    complete: function(oXMLHttpRequest, textStatus)
	    {
		    if(oXMLHttpRequest.status === 200)
		    {
		    	if(oXMLHttpRequest.responseText != -1)
		    	{
		    		bSE_SuccessfullySubmitted= true;
		    		$.mobile.changePage('#Payment_Page');
		    	}
		    	else
		    	{
		    		console.log('processSE.js:: submitSE():: Failed to submitSE');
		    	}
		    }
		    else
		    {
		    	console.log('processSE.js:: submitSE():: if(oXMLHttpRequest.status === 200)');
		    }
		}							   
	});
}



function associateFileWithParseObject(objectID)
{
	if(objectID == null || objectID == undefined)
	{
		console.log('associateFileWithParseObject(objectID):: if(objectID == null || objectID == undefined)');
		return;
	}

	if(submittedObjectID == null)
	{
		submittedObjectID= objectID;
	}

	var serverUrl = 'https://api.parse.com/1/classes/Pending_SE/' + objectID;
	$.ajax(
	{
		type: "PUT",
		beforeSend: function(request) 
		{
			request.setRequestHeader("X-Parse-Application-Id", 'Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s');
			request.setRequestHeader("X-Parse-REST-API-Key", 'aWfnnVMRjVdnesTiN8pWhRpioRwKS99wcIlMb9zS');
			request.setRequestHeader("Content-Type", 'application/json');
		},
		url: serverUrl,
		data: '{"Photo": {"name": "' + imageFileResponse['name'] + '","__type": "File"}}',
		processData: false,
		success: function(data) 
		{
			console.log(data);
			bPhotoAssociated= true;
			$.mobile.changePage('#Payment_Page');
		},
		error: function(data) 
		{
			$.mobile.changePage('#Payment_Page');
		}
	});
}



function goToSI()
{
	window.location= 'http://socialimpactapp.com'
}


