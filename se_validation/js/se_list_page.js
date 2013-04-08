var aPendingSEs= null,
	bPendingRow= true,
	bApprovedRow= true,
	bDeclinedRow= true,
	bLiveRow= true,
	oPendingType=
	{
		Pending: 0,
		Declined: 1,
		Approved: 2,
		Live:3
	},
	currentPendingType= oPendingType.Pending;

$(document).on('pagecreate', '#SE_List_Page', function(e)
{
	Parse.initialize("Pb8MFFgzdpyNeKUuRiekCDrDD9ele3wyU603Ik9s", "AgYzrVA0QXaqXcWYfmmxGgTMoDlt3PRPHamDQJR2");	

	$('#Pending_NavButton').on('click', function(e)
	{
		bPendingRow= true;
		currentPendingType= oPendingType.Pending;
		loadPendingSEs();
	});
	$('#Declined_NavButton').on('click', function(e)
	{
		bDeclinedRow= true;
		currentPendingType= oPendingType.Declined
		loadDeclinedSEs();
	});
	$('#Approved_NavButton').on('click', function(e)
	{
		bApprovedRow= true;
		currentPendingType= oPendingType.Approved;
		loadApprovedSEs();
	});

	$('#Live_NavButton').on('click', function(e)
	{
		bLiveRow= true;
		currentPendingType= oPendingType.Live;
		loadLiveOnAppSEs();
	});
});

$(document).on('pageshow', '#SE_List_Page', function(e)
{
	if(Parse.User.current())
	{
		bPendingRow= true;
		bApprovedRow= true;
		bDeclinedRow= true;
		bLiveRow= true;

		if(currentPendingType == oPendingType.Pending)
		{
			if(aPendingSEs == null || aPendingSEs == undefined)
			{
				loadPendingSEs();	
			}
			else
			{
				removeChangedSEs();
				loadSEs();
			}
		}
		else if(currentPendingType == oPendingType.Declined)
		{
			if(aPendingSEs == null || aPendingSEs == undefined)
			{
				loadDeclinedSEs();
			}
			else
			{
				removeChangedSEs();
				loadSEs();
			}
		}
		else if(currentPendingType == oPendingType.Approved)
		{
			if(aPendingSEs == null || aPendingSEs == undefined)
			{
				loadApprovedSEs();		
			}
			else
			{
				removeChangedSEs();
				loadSEs();
			}
		}
		else
		{
			if(aPendingSEs == null || aPendingSEs == undefined)
			{
				loadLiveOnAppSEs();		
			}
			else
			{
				loadSEs();
			}
		}
	}
	else
	{
		$.mobile.changePage('#SE_Login_Page');
		return;
	}
});


function removeChangedSEs()
{
	if(bParse)
	{
		removeChangedSEs_Parse();
		return;
	}

	var SE;
	for(var i=0; i<aPendingSEs.length; ++i)
	{
		SE= aPendingSEs[i];
		if(SE != null && SE != undefined)
		{
			if(currentPendingType == oPendingType.Pending)
			{
				if(SE.Approved || SE.Declined)
				{
					aPendingSEs.splice(i, 1);
				}
			}
			else if(currentPendingType == oPendingType.Declined)
			{
				if(!SE.Declined)
				{
					aPendingSEs.splice(i, 1);
				}
			}
			else if(currentPendingType == oPendingType.Approved)
			{
				if(!SE.Approved || SE.Declined)
				{
					aPendingSEs.splice(i, 1);
				}
			}
		}
	}
}



function loadPendingSEs()
{
	if(bParse)
	{
		loadPendingSEsFromParse();
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: 'php/getPendingSes.php',
	    success: function(data)
	    {
		    if(strcmp(data, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(data);
				if(jsonResponse != null)
				{
					aPendingSEs= jsonResponse['PendingSEs'];
					if(aPendingSEs == null || aPendingSEs == undefined)
					{
						console.log('se_list_page.js:: loadPendingSEs():: if(aPendingSEs == null || aPendingSEs == undefined)');
						return;
					}
					loadSEs();					
				}
				else
				{
					console.log('se_list_page.js:: loadPendingSEs:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	aPendingSEs= [];
		    	loadSEs();
		    }
		}							   
	});
}


function loadDeclinedSEs()
{
	if(bParse)
	{
		loadDeclinedSEsFromParse();
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: 'php/getDeclinedSEs.php',
	    success: function(data)
	    {
		    if(strcmp(data, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(data);
				if(jsonResponse != null)
				{
					aPendingSEs= jsonResponse['DeclinedSEs'];
					if(aPendingSEs == null || aPendingSEs == undefined)
					{
						console.log('se_list_page.js:: loadDeclinedSEs():: if(aPendingSEs == null || aPendingSEs == undefined)');
						return;
					}
					loadSEs();					
				}
				else
				{
					console.log('se_list_page.js:: loadDeclinedSEs:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	aPendingSEs= [];
		    	loadSEs();
		    }
		}							   
	});
}


function loadApprovedSEs()
{
	if(bParse)
	{
		loadApprovedSEsFromParse();
		return;
	}

	$.ajax(
	{
	    type: 'GET',
	    url: 'php/getApprovedSEs.php',
	    success: function(data)
	    {
		    if(strcmp(data, '-1') != const_StringsEqual)
		    {
		    	var jsonResponse= $.parseJSON(data);
				if(jsonResponse != null)
				{
					aPendingSEs= jsonResponse['ApprovedSEs'];
					if(aPendingSEs == null || aPendingSEs == undefined)
					{
						console.log('se_list_page.js:: loadApprovedSEs():: if(aPendingSEs == null || aPendingSEs == undefined)');
						return;
					}
					loadSEs();					
				}
				else
				{
					console.log('se_list_page.js:: loadApprovedSEs:: if(jsonResponse != null)');
				}
				
				return;
		    }
		    else
		    {
		    	aPendingSEs= [];
		    	loadSEs();
		    }
		}							   
	});
}



function loadLiveOnAppSEs()
{
	$.ajax(
	{
	    type: 'POST',
	    url: 'php/getLiveOnAppSEs.php',
	    success: function(data)
	    {
		    if(data != -1)
		    {		    	
				aPendingSEs= $.parseJSON(data);
				if(aPendingSEs == null || aPendingSEs == undefined)
				{
					console.log('se_list_page.js:: loadLiveOnAppSEs():: if(aPendingSEs == null || aPendingSEs == undefined)');
					return;
				}
				loadSEs();		
				return;
		    }
		    else
		    {
		    	console.log('se_list_page.js:: loadLiveOnAppSEs():: if(data != -1)');
		    	aPendingSEs= [];
		    	loadSEs();
		    }
		}							   
	});
}



// ------------Parse Functions--------------------
function removeChangedSEs_Parse()
{
	var SE;
	for(var i=0; i<aPendingSEs.length; ++i)
	{
		SE= aPendingSEs[i];
		if(SE != null && SE != undefined)
		{
			if(currentPendingType == oPendingType.Pending)
			{
				if(SE.get('Approved') || SE.get('Declined'))
				{
					aPendingSEs.splice(i, 1);
				}
			}
			else if(currentPendingType == oPendingType.Declined)
			{
				if(!SE.get('Declined'))
				{
					aPendingSEs.splice(i, 1);
				}
			}
			else if(currentPendingType == oPendingType.Approved)
			{
				if(!SE.get('Approved') || SE.get('Declined'))
				{
					aPendingSEs.splice(i, 1);
				}
			}
		}
	}
}

function loadPendingSEsFromParse()
{
	var Pending_SE_Class= Parse.Object.extend("Pending_SE");
    var query = new Parse.Query(Pending_SE_Class);
    query.equalTo('Approved', false);
    query.equalTo('Declined', false);
    query.descending('updatedAt');
    query.find(
    {
        success: function(results)
        {
        	aPendingSEs= results;
        	if(aPendingSEs == null || aPendingSEs == undefined)
			{
				console.log('se_validation.js:: loadPendingSEsFromParse():: if(aPendingSEs == null || aPendingSEs == undefined)');
				return;
			}

			loadSEs_Parse();			
        },
        error: function(error)
        {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}


function loadDeclinedSEsFromParse()
{
	var Pending_SE_Class= Parse.Object.extend("Pending_SE");
  

    var query= new Parse.Query(Pending_SE_Class);
    query.equalTo('Declined', true);
    query.descending('updatedAt');
    query.find(
    {
        success: function(results)
        {
			aPendingSEs= results;
        	if(aPendingSEs == null || aPendingSEs == undefined)
			{
				console.log('se_validation.js:: loadDeclinedFromParse():: if(aPendingSEs == null || aPendingSEs == undefined)');
				return;
			}
			
			loadSEs_Parse();
        },
        error: function(error)
        {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}


function loadApprovedSEsFromParse()
{
	var Pending_SE_Class= Parse.Object.extend("Pending_SE");
  

    var query= new Parse.Query(Pending_SE_Class);
    query.equalTo('Approved', true);
    query.descending('updatedAt');
    query.find(
    {
        success: function(results)
        {
			aPendingSEs= results;
        	if(aPendingSEs == null || aPendingSEs == undefined)
			{
				console.log('se_validation.js:: loadApprovedFromParse():: if(aPendingSEs == null || aPendingSEs == undefined)');
				return;
			}
			
			loadSEs_Parse();
        },
        error: function(error)
        {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
}


function loadSEs_Parse()
{
	var rowHTML, listHTML= '';
	if(aPendingSEs.length <= 0)
	{
		listHTML= '<li>No Pending Social Enterprises</li>';
	}

	for(var i=0; i < aPendingSEs.length; ++i)
	{
		rowHTML= '<li><a href="#SE_Page" id="' + i + '"';
		if(aPendingSEs[i].get('Paid'))
		{
			rowHTML+= ' style="background:#33cc33"';
		}
		rowHTML+= '>'
		
		if(aPendingSEs[i].get('Declined'))
		{
			if(bDeclinedRow)
			{
				bDeclinedRow= false;
				listHTML+= '<li style="background:#ccc">Declined SEs</li>';
			}
			rowHTML+= '<img src="img/X.png"/>';
		}
		else if(aPendingSEs[i].get('Approved'))
		{
			if(bApprovedRow)
			{
				bApprovedRow= false;
				listHTML+= '<li style="background:#ccc">Approved SEs</li>';
			}
			rowHTML+= '<img src="img/Checkmark.png"/>';
		}
		else
		{
			if(bPendingRow)
			{
				bPendingRow= false;
				listHTML+= '<li style="background:#ccc">Pending SEs</li>';
			}
		}
		 
		rowHTML+= '<h3>' + aPendingSEs[i].get('Name');
		if(aPendingSEs[i].get('Paid'))
		{
			rowHTML+= ' (PAID)';
		}

		rowHTML+= '</h3><p>'  + aPendingSEs[i].get('Location') + '</p>'
			+'<p>Modified: '  + aPendingSEs[i].updatedAt + '</p>' 
		+'</a></li>';

		listHTML+= rowHTML;
	}
	$('#SE_List_Page_list').html(listHTML);
	$('#SE_List_Page_list').listview('refresh');

	for(var i=0; i < aPendingSEs.length; ++i)
	{
		$('#' + i).on('click', function(e)
		{
			SE= aPendingSEs[parseInt(this.id)];
		});
	}	
}
// -------------------- END Parse Functions ------------------------



function loadSEs()
{
	var rowHTML, listHTML= '';
	if(aPendingSEs.length <= 0)
	{
		listHTML= '<li>No Pending Social Enterprises</li>';
	}

	for(var i=0; i < aPendingSEs.length; ++i)
	{
		rowHTML= '<li><a href="#SE_Page" id="' + i + '"';
		if(aPendingSEs[i].Paid)
		{
			rowHTML+= ' style="background:#33cc33"';
		}
		rowHTML+= '>'
		
		if(aPendingSEs[i].Declined)
		{
			// if(bDeclinedRow)
			// {
			// 	bDeclinedRow= false;
			// 	listHTML+= '<li style="background:#ccc">Declined SEs</li>';
			// }
			rowHTML+= '<img src="img/X.png"/>';
		}
		else if(aPendingSEs[i].Approved)
		{
			// if(bApprovedRow)
			// {
			// 	bApprovedRow= false;
			// 	listHTML+= '<li style="background:#ccc">Approved SEs</li>';
			// }
			rowHTML+= '<img src="img/Checkmark.png"/>';
		}
		// else if(currentPendingType == oPendingType.Pending)
		// {
		// 	if(bPendingRow)
		// 	{
		// 		bPendingRow= false;
		// 		listHTML+= '<li style="background:#ccc">Pending SEs</li>';
		// 	}
		// }
		// else
		// {
		//  	if(bLiveRow)
		// 	{
		// 		bLiveRow= false;
		// 		listHTML+= 
		// 		'<li style="background:#ccc">Live On App SEs</li>';
		// 	}
		// }
		 
		rowHTML+= '<h3>' + aPendingSEs[i].Name;
		if(aPendingSEs[i].Paid)
		{
			rowHTML+= ' (PAID)';
		}

		rowHTML+= '</h3><p>'  + aPendingSEs[i].Location + '</p>'
			+'<p>Modified: '  + aPendingSEs[i].updatedAt + '</p>' 
		+'</a></li>';

		listHTML+= rowHTML;
	}
	$('#SE_List_Page_list').html(listHTML);
	$('#SE_List_Page_list').listview('refresh');

	for(var i=0; i < aPendingSEs.length; ++i)
	{
		$('#' + i).on('click', function(e)
		{
			SE= aPendingSEs[parseInt(this.id)];
		});
	}	
} 