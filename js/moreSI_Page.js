$(document).on('pageshow', '#moreSI_Page', function(e)
{
	var SE= SE_forBusinessPage;
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