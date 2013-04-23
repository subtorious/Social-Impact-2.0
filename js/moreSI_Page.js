$(document).on('pageshow', '#moreSI_Page', function(e)
{
	var SE;
	if(bParse)
	{
		var aCategories= SE_forBusinessPage.get('Categories');
		var photo;
		if($.inArray('"B Corp"', aCategories))
		{
			bBCorp= true;
			photo= SE_forBusinessPage.get('PhotoURL');
		}
		else
		{
			bBCorp= false;
			photo= SE_forBusinessPage.get('Photo');
		}

		SE=
		{
			id: SE_forBusinessPage.id, 
			Name: SE_forBusinessPage.get('Name'),
			Details: SE_forBusinessPage.get('Details'),
			Photo: photo,
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



	var nameSectionHTML= '';
	if($.inArray('Social Enterprise Alliance', SE.Categories) >= 0)
	{
		nameSectionHTML+= '<img src="Images/sea.jpg" width="50px" style="float:right; cursor:hand; cursor: pointer;" title="Social Enterprise Alliance" onclick="openSEA_Website()"/>';
	}
	nameSectionHTML+= '<h3>' + SE.Name + '</h3>';
	$('#moreName_li').html(nameSectionHTML);




	var socialImpact= SE.SocialImpact;
	if(socialImpact == undefined || socialImpact == null)
	{
		socialImpact= '';
	}
	var HTML= '<li id="businessPage_socialImpact" class="businessPage_li businessInfo1_li" >' 
							 + socialImpact 
						 +'</li>';

	$('#moreSI_section1_ul').html(HTML);
	$('#moreSI_section1_ul').listview('refresh');
});