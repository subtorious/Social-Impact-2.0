
var const_StringsEqual= 0, const_StringAGreater= 1, const_StringBGreater= -1;
var A_isGreaterThan_B= 1, B_isGreaterThan_A= -1, A_Equals_B= 0;
var CONST_localRadius_miles= 30;

function strcmp(a, b)
{   
    return (a<b?-1:(a>b?1:0));  
}



function lastPathComponent(url)
{
	return url.split("/").pop();
}


function isiPhoneSafari()
{
	return navigator.userAgent.match(/((?=.*(iPhone|iPod))(?=.*Safari))/);
}

function isiPhone()
{
	return navigator.userAgent.match(/(iPhone|iPod)/);
}


function isAndroid()
{
	return navigator.userAgent.match(/Android/);
}

function parseCompareKey(key)
{
	return function parseCompareAB_withKey(a, b)
	{
		if (a.get(key) < b.get(key))
		{
			return B_isGreaterThan_A;
		}
		
		if (a.get(key) > b.get(key))
		{
			return A_isGreaterThan_B;
		}
		
		return A_Equals_B;
	}
}


function caseInsensitive_ParseCompareKey(key)
{
	return function compareAB_withKey(a, b)
	{
		var aValue= a.get(key), bValue= b.get(key);

		if(isUndefinedOrNull(aValue) && isUndefinedOrNull(bValue))
		{
			return A_Equals_B;
		}
		if(isUndefinedOrNull(aValue))
		{
			return B_isGreaterThan_A;
		}
		if(isUndefinedOrNull(bValue))
		{
			return A_isGreaterThan_B;
		}

		try
		{
			aValue= aValue.toLowerCase();
			bValue= bValue.toLowerCase();
		}
		catch(err)
		{

		}

		if (aValue < bValue)
		{
			return B_isGreaterThan_A;
		}
		
		if (aValue > bValue)
		{
			return A_isGreaterThan_B;
		}
		
		return A_Equals_B;
	}
}


function parseGeoPoint_compareDistanceFrom(parse_geoPoint)
{
	return function compareAB_withKey(a, b)
	{
		var aValue= a.get('GeoLocation'), 
			bValue= b.get('GeoLocation');

		if(isUndefinedOrNull(aValue) && isUndefinedOrNull(bValue))
		{
			return A_Equals_B;
		}
		if(isUndefinedOrNull(aValue))
		{
			if((!isUndefinedOrNull(bValue)) && (bValue.milesTo(parse_geoPoint) <= CONST_localRadius_miles))
			{
				return A_isGreaterThan_B;
			}
			return B_isGreaterThan_A;
		}
		if(isUndefinedOrNull(bValue))
		{
			if(aValue.milesTo(parse_geoPoint) <= CONST_localRadius_miles)
			{
				return B_isGreaterThan_A;
			}
			return A_isGreaterThan_B;
		}

		aValue= aValue.milesTo(parse_geoPoint);
		bValue= bValue.milesTo(parse_geoPoint);

		if (aValue < bValue)
		{
			return B_isGreaterThan_A;
		}
		
		if (aValue > bValue)
		{
			return A_isGreaterThan_B;
		}
		
		return A_Equals_B;
	}
}


function isUndefinedOrNull(a)
{
	if(typeof(a) == 'undefined' && a == null)
	{
		return true;
	}
	return false;
}

function isNumber(a)
{
	if(typeof(a) == 'number')
	{
		return true;
	}
	return false;
}


function isBoolean(a)
{
	if(typeof(a) == 'boolean')
	{
		return true;
	}
	return false;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var ie = ( function()
{
	var undef, v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
	while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]);
	return v > 4 ? v : undef;
}());

function pageshowGoogleAnalytics()
{
	try {
        _gaq.push(['_setAccount', 'UA-37879418-1']);

        hash = location.hash;

        if (hash) {
            _gaq.push(['_trackPageview', hash.substr(1)]);
        } else {
            _gaq.push(['_trackPageview']);
        }
    } catch(err) {

    }
}
