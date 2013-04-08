var const_StringsEqual= 0, const_StringAGreater= 1, const_StringBGreater= -1;
var A_isGreaterThan_B= 1, B_isGreaterThan_A= -1, A_Equals_B= 0;

function strcmp(a, b)
{   
    return (a<b?-1:(a>b?1:0));  
}


function todaysDate()
{
	var today = new Date();
	var d = today.getDate();
	var m = today.getMonth()+1; //January is 0!
	var y = today.getFullYear();
	var h= today.getHours();
	var min= today.getMinutes();
	var s= today.getSeconds();
	return y + '-' + m +'-'+d + '_' + h +'-' + min + '-' +s; 
}