//Parameters
var numOutputs = 14;
var numInputs = 14;
var api_endpoints = {};
api_endpoints["chanlist_input"] = "a/i/chanlist.json";//"spoof/chanlist_input.json";  
api_endpoints["chanlist_output"] = "a/o/chanlist.json"; //"spoof/chanlist_output.json";  
var globalInputChannels = null;
var globalOutputChannels = null;


//initialize a few vars
var currentIO = null;  // 0=input, 1=output
var currentChannel = 0;
var enable=null;

//Disable domCache & optionally disable AJAX
$(document).bind("mobileinit", function(){
    //$.mobile.ajaxLinksEnabled=false;
    //$.mobile.ajaxFormsEnabled=false;
    //$.mobile.ajaxEnabled=false;
$.mobile.page.prototype.options.domCache = false;
}); 

/////////////////////////////////////////////////////////
/////////////  PAGE SPECIFIC INITIALIZERS ///////////////

///// Process Inputs -- proci.htm ////////////
$('#processInputsPage').live('pagebeforecreate', function(e) {
	api_loadInputs(function(apiReturn) {
		//convert apiReturn to only active channel names
		var inputChannels = stripInactiveChannels(apiReturn);

		var counter = 0;
		//loop through all of the links that were created @ 'pagebeforecreate' runtime
		$('#fillInputButtons > a').each(function() {
			if(counter < inputChannels.length) {
				$('span.ui-btn-text', this).text(inputChannels[counter]['name']);
				$(this).attr('channel', inputChannels[counter]['num']);
			}
			counter++;
		});
	
		if(numInputs > inputChannels.length) {
			$('a[channel=0]').remove();
		}
		
		console.log('before the show');
		$('#fillInputButtons').show();
	}); //loadActiveInputNames();
	
	for(i=0; i < numInputs; i++) {
		$('#fillInputButtons').append("<a href='#' data-role='button' class='input' channel='0'></a>");
		$('#fillInputButtons').hide();
	}
	var i = 0;
	changeTopTitle('Process Inputs');
});

$('.input').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	setCurrentChannelAndIO($(this).attr('channel'), 0);
	$.mobile.changePage("input.htm");
	return false;
});

///// Process Outputs -- proco.htm ///////////
$('#processOutputsPage').live('pagebeforecreate', function(e) {
	
	api_loadOutputs(function(apiReturn) {
		//convert apiReturn to only active channel names
		console.log(apiReturn);
		var outputChannels = stripInactiveChannels(apiReturn);
		console.log(outputChannels);
		var counter = 0;
		//loop through all of the links that were created @ 'pagebeforecreate' runtime
		$('#fillOutputButtons > a').each(function() {
			if(counter < outputChannels.length) {
				$('span.ui-btn-text', this).text(outputChannels[counter]['name']);
				$(this).attr('channel', outputChannels[counter]['num']);
			}
			counter++;
		});
	
		if(numOutputs > outputChannels.length) {
			$('a[channel=0]').remove();
		}

		$('#fillOutputButtons').show();
	});
	
	for(i=0; i < numOutputs; i++) {
		$('#fillOutputButtons').append("<a href='#' data-role='button' class='output' channel='0'></a>");
		$('#fillOutputButtons').hide();
	}
	changeTopTitle('Process Outputs');
});

$('.output').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	setCurrentChannelAndIO($(this).attr('channel'), 1)
	$.mobile.changePage("output.htm");
	return false;
});

//////Input Processing Selection -- input.htm /////////////
$('#inputPage').live('pagebeforeshow', function (event, ui) {
	if(getCurrentChannel() > 0 && getCurrentChannel() < 99) {
		$('#inputTitle').text('Input ' + getActiveInputName(getCurrentChannel()));
	} else $.mobile.changePage('index.htm', {reverse: true});
});

////////Output Processing Selection -- output.htm ///////////////
$('#outputPage').live('pagebeforeshow', function (event, ui) {
	if(getCurrentChannel() > 0 && getCurrentChannel() < 99) {
		var outputName = getActiveOutputName(getCurrentChannel());
		
		if(outputName == null) $.mobile.changePage('index.htm', {reverse: true});
		
		$('#outputTitle').text('Output ' + outputName);
	} else $.mobile.changePage('index.htm', {reverse: true});
});

$('.procType').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();

	var procType = $(this).attr('function');
	var page = "";
	if (procType == "eq") {
		page="eq.htm";
	} else if (procType == "comp") {
		page="comp.htm";
	} else if (procType == "lim") {
		page="lim.htm";
	}

	$.mobile.changePage(page);
	return false;
});

//////  EQ Settings Page -- eq.htm ////////////
$("#eqPage").live('pagebeforeshow',function(event) {
	enable = null; // reset the enable/disable status
	setEnableDisableButton();

	if( getCurrentIO() == 1) {
		$('.eqTitle').text('EQ Output ' + getActiveOutputName(getCurrentChannel()));
	} else if (getCurrentIO() == 0){
		$('.eqTitle').text('EQ Input ' + getActiveInputName(getCurrentChannel()));
	} else $.mobile.changePage('index.htm', {reverse: true});
	
	////Put specs from API into page
	//fire off XHR request with callback for updateEQSettings
	var io = getCurrentIO() ? "o" : "i";
	var request = $.ajax({
		type: 'GET',
		url: "a/" + io + "/" + getCurrentChannel() + "/eqparams.json",
  	dataType: 'json',
		cache: false,
		success: function(data){ updateEQSettings(data); },
		error: function(data) {alert('error')},
	});
	
});

$('.backLinkFuncs').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	
	if(getCurrentIO() == 1) {
		$.mobile.changePage("output.htm", {reverse: true});		
	} else if (getCurrentIO() == 0){
		$.mobile.changePage("input.htm", {reverse: true});
	} else $.mobile.changePage('index.htm', {reverse: true});
	return false;
});

//event listener for Apply button on eq.htm
$('#eqApply').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	
	api_writeEQSettings();
	
	//run some function to update the values in the MCU
	return false;
});

///// Compressor Settings Page -- comp.htm ///////////
$("#compPage").live('pagebeforeshow',function(event) {
	enable = null; // reset the enable/disable status
	setEnableDisableButton();
	
	if( getCurrentIO() == 1 ) {
		$('.compTitle').text('Comp Output ' + getActiveOutputName(getCurrentChannel()));
	} else if (getCurrentIO() == 0) {
		$('.compTitle').text('Comp Input ' + getActiveInputName(getCurrentChannel()));
	} else $.mobile.changePage('input.htm');
	
	var io = getCurrentIO() ? "o" : "i";
	var request = $.ajax({
		type: 'GET',
		url: "a/" + io + "/" + getCurrentChannel() + "/compparams.json",
  		dataType: 'json',
		cache: false,
		success: function(data){ updateCompSettings(data); },
		error: function(data) {alert('error')},
	});
});

$('#compApply').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	
	api_writeCompSettings();
	
	//run some function to update the values in the MCU
	alert('updating...');
	return false;
});

/////// Matrix Routing Page -- matrix.htm /////////////
$('#matrixPage').live('pagebeforecreate', function(event,ui) {
	var matrixRoutes = loadMatrixRoutes();
	var selected = "";
	var i=1;
	var j=1;
	for(j=1; j<numOutputs+1; j++) {
		$('#matrixFillSelect').append("<div data-role='fieldcontain'><label for='out" + j + "route' class='select'>" + loadOutputNameArray()[j-1] + "</label><select name='out" + j + "route' id='out"+ j + "route' class=><option value='none'>None</option>");
		for(i=1; i<numInputs+1; i++) {
			selected = "";
			if(matrixRoutes[j-1] == i) selected = "SELECTED";
			$('#out' + j + 'route').append("<option value='" + i + "'" + selected + ">" + loadInputNameArray()[i-1] + "</option>");	
		}
		$('#matrixFillSelect').append("</select></div>");
	}
});

//An event listener for the Apply button on matrix.htm
$('#matrixApply').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	//run some function to update the values in the MCU
	alert('updating...');
	return false;
});

///////// Label Inputs Page -- labeli.htm ///////////////////
$('#labelInputsPage').live('pagebeforecreate', function(event,ui) {
	var names = loadInputNameArray();
	changeTopTitle('Label Inputs');
	var j = 1;
	for(j = 1; j <= names.length; j++) {
		$('#labelInputsFill').append("<div data-role='fieldcontain'><label for='label" + j + "' class='basic'>" + names[j-1] + "</label><input type='text' name='label" + j + "' id='label"+ j + "' value='" + names[j-1] + "'\></div>");
	}
});

/////////// Label Outputs Page -- labelo.htm ////////////////
$('#labelOutputsPage').live('pagebeforecreate', function(event,ui) {
	var names = loadOutputNameArray();
	changeTopTitle('Label Outputs');
	var j = 1;
	for(j = 1; j <= names.length; j++) {
		$('#labelOutputFill').append("<div data-role='fieldcontain'><label for='label" + j + "' class='basic'>" + names[j-1] + "</label><input type='text' name='label" + j + "' id='label"+ j + "' value='" + names[j-1] + "'\></div>");
	}
});

/////////// Label Breakout Box Page -- labelb.htm ///////////
$('#labelBoxPage').live('pagebeforecreate', function(event,ui) {
	var names = getBreakoutBoxNames();
	changeTopTitle('Label Boxes');
	var j = 1;
	for(j = 1; j <= names.length; j++) {
		$('#labelBoxFill').append("<div data-role='fieldcontain'><label for='label" + j + "' class='basic'>" + names[j-1] + "</label><input type='text' name='label" + j + "' id='label"+ j + "' value='" + names[j-1] + "'\></div>");
	}
});

/////////// Check Clip Status -- chkstat.htm ///////////////////
$('#checkStatusPage').live('pagebeforecreate', function(event,ui) {
	var activeInputStatus = loadActiveInputStatus();
	var activeInputNames = loadActiveInputNames();
	var outputStatus = loadOutputStatus();
	var outputNames = loadOutputNameArray();
	var textInputStatus="";
	var textOutputStatus="";
	var i=0;
	
	for(i=0; i < numOutputs; i++) {
		if( activeInputStatus[i] ) { //If the status is 1 make the star red (clip), if 0 make it green (OK)
			textInputStatus = "<div style='color:red;font-weight:bold'>*</div>";
			} else { textInputStatus = "<div style='color:green;font-weight:bold'>*</div>"; 
		}
		
		if( outputStatus[i] ) {  //If the status is 1 make the star red (clip), if 0 make it green (OK)
			textOutputStatus = "<div style='color:red;font-weight:bold'>*</div>";
			} else { textOutputStatus = "<div style='color:green;font-weight:bold'>*</div>"; 
	}
		
		$('#fillClipStatus').append("<div class='ui-block-a' style='text-align:center' id='inputname" + (i+1) + "'>" + activeInputNames[i]+ "</div>");
		$('#fillClipStatus').append("<div class='ui-block-b' style='text-align:center' id='inputstatus" + (i+1) + "'>" + textInputStatus+ "</div>");
		$('#fillClipStatus').append("<div class='ui-block-c' style='text-align:center' id='outputstatus" + (i+1) + "'>" + textOutputStatus+ "</div>");
		$('#fillClipStatus').append("<div class='ui-block-d' style='text-align:center' id='outputname" + (i+1) + "'>" + outputNames[i]+ "</div>");
	}
});

///////////  Check Breakout Box Status -- bobstat.htm //////////////////
$('#checkBOStatusPage').live('pagebeforecreate', function(event,ui) {
	breakoutBoxNames = getBreakoutBoxNames();
	channelNames = loadOutputNameArray();
	breakoutBoxStatus = getBreakoutBoxStatus();
	var textAmpStatus = "";
	var i=1;
	
	for(i=0; i < breakoutBoxNames.length; i++) {
		if(breakoutBoxStatus[i]) {
			textAmpStatus = "<div style='color:red;font-weight:bold'>*</div>";
		} else { textAmpStatus = "<div style='color:green;font-weight:bold'>*</div>"; }
				
		$('#fillBreakOutStatus').append("<div class='ui-block-a' style='text-align:center'>" + breakoutBoxNames[i]+ "</div>");
		$('#fillBreakOutStatus').append("<div class='ui-block-b' style='text-align:center'>" + textAmpStatus+ "</div>");
		$('#fillBreakOutStatus').append("<div class='ui-block-c' style='text-align:center'>" + channelNames[i]+ "</div>");
	}
});
////// GENERAL Event Listener for Enable/Disable on eq.htm & comp.htm
$('#enableDisable').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	setEnableDisableButton();
	console.log("enable");
	console.log(enable);
	
	if($('#compApply') != null) {
		api_writeCompSettings();
	} else if ($('#eqApply') != null) api_writeEQSettings();

	return false;
});


///////////////////////////////////////////////////////////////////////////
//////////////////   FUNCTIONS!! //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function stripInactiveChannels(apiData) {
	activeInputs = [];
	for (i=0; i<numInputs; i++) {
		if(apiData[i]["a"] == 1) activeInputs.push(apiData[i]);
	}
	return activeInputs;
}

//  Extract ALL input channel names (active AND inactive)
//   order is maintained
function loadInputNameArray() {
	var i=0;
	var inputNames = [];
	var inputInf = loadInputs();
	for (i=0; i< numInputs; i++) {
		inputNames.push(inputInf[i]['name']);
	}
	return inputNames;
}

//  sets the Enable/Disable button on a page
//    if enable is null then it places the value from the parameter
function setEnableDisableButton(data) {
	if (enable == null) {
		enable = data;
	}
	if(enable == 0) {
		enable=1;
		$('#enableDisable .ui-btn-text').text('Disable');
	}
	else {
		enable=0;
		$('#enableDisable .ui-btn-text').text('Enable');
	}
}

function loadActiveInputNames() {
	var i=0;
	var activeInputNames = [];
	var inputInf = globalInputChannels;//loadInputs();
	for (i=0; i< numInputs; i++) {
		if(inputInf[i]['a'] == 1) activeInputNames.push(inputInf[i]['name']);
	}
	return activeInputNames;
}

function loadActiveOutputNames() {
	var i=0;
	var activeOutputNames = [];
	if (globalOutputChannels != null) {
		var outputInf = globalOutputChannels;
		for (i=0; i< numOutputs; i++) {
			if(outputInf[i]['a'] == 1) activeOutputNames.push(outputInf[i]['name']);
		} 
	} else return null;
	return activeOutputNames;
}

function getActiveOutputName(o) {
	temp = loadActiveOutputNames();
	if(temp != null) {
		return loadActiveOutputNames()[o-1];
	} else {
		return null;
	}
	
}

function getActiveInputName(i) {
	return loadActiveInputNames()[i-1];
}

function changeTopTitle(text) {
	$('.topTitle').text(text);
	return false;
}

function getCurrentChannel() {
	if((currentChannel > 0) && (currentChannel != null)) {
		return currentChannel;
	} else if(($.cookie("channel") > 0) && ($.cookie("channel") != null)) {
		return $.cookie("channel");
	} else return 99;
}

function getCurrentIO() {
	if (currentIO != null) {
		return currentIO;
	} else if($.cookie("io") != null) {
		return $.cookie("io");
	} else return 99;
}

function setCurrentChannelAndIO(channel,io) {
	currentChannel= channel;
	currentIO = io;
	$.cookie("io",io);
	$.cookie("channel",channel);
	return true;
}

function updateEQSettings(eqSettings) {
	eqSettings = $.parseJSON(eqSettings['responseText']);
	for (i=0; i<4; i++) {
		if ((eqSettings[i]['bandNum'] == 1) || (eqSettings[i]['bandNum'] == 4)) {
			$('#type' + (i+1)).val(eqSettings[i]['type']);
		}
		$('[band="' + (i+1) + '"] .q').val(eqSettings[i]['q']);
		$('[band="' + (i+1) + '"] .freq').val(eqSettings[i]['freq']);
		$('[band="' + (i+1) + '"] .gain').val(eqSettings[i]['gain']);
	}
	setEnableDisableButton(eqSettings[0]['enable']);
}

function updateCompSettings(compSettings) {
	var values = compSettings;
	console.log(values);
	$('#compRatio').val(values['ratio']);
	$('#compThreshold').val(values['threshold']);
	$('#compAttack').val(values['attack']);
	$('#compRelease').val(values['release']);
	$('#compGain').val(values['gain']);
	setEnableDisableButton(values['enable']);
}


/////////////  Functions using or creating "SPOOFED" data ////////////////
function getBreakoutBoxStatus(){
	return [0, 1, 0, 0, 0];  // 0=OK, 1=UH OH. 
}

function getBreakoutBoxNames() {
	return ["B1", "B2", "B3", "B4", "B5"];
}

function loadOutputStatus() {
	return [1,0,0,0,0,0,0,1];  // 0=OK, 1=CLIP
}

function loadActiveInputStatus() {
	return [1,0,0,0,1,0,0,0]; // 0=OK, 1=CLIP
}

function loadEnableStatus() {
	status = 0; // 0=disable processing, 1=enabled
	
	return status; 
}

function loadInputs() {
	var inputInf = {};
	inputInf = [{"active":1, "name":"XLR L"}, {"active":1, "name":"XLR R"}, {"active":0, "name":"SPDIF L"}, {"active":0, "name":"SPDIF R"}, {"active":1, "name":"Dante 1"}, {"active":1, "name":"Dante 2"}, {"active":1, "name":"Dante 3"}, {"active":1, "name":"Dante 4"}, {"active":1, "name":"Dante 5"}, {"active":1, "name":"Dante 6"}];
	numInputs = inputInf.length;
	return inputInf;
}

function loadMatrixRoutes() {
	var routes = [];
	var i=1;
	for(i=1; i <= numOutputs; i++) {
		routes.push(i);
	}
	//routes = [3, 6, 4, 7, 2, 3, 4, 5]; // For testing...
	return routes;
}

function loadOutputNameArray() {
	var outputNames = [];
	var i = 1;
	for(i=1; i<= numOutputs; i++) {
		outputNames.push('Dante ' + i);
	}
	outputNames.push('XLR L');
	outputNames.push('XLR R');
	return outputNames;
}

function loadCompSettings() {
	var compSettings = {};
	compSettings = {"ratio":2.0, "threshold":10, "attack":20, "release":20, "gain":0.0}
	return compSettings;
}

function loadEQSettings() {
	var eqSettings = [];
	for(i=1; i<5; i++) {
		var num = new Number(4.0/i);
		eqSettings.push({"bandNum": i, "type":1, "q":num.toFixed(2), "freq": (100*Math.pow(i,2)), "gain":i*Math.pow(-1,i)});
	}
	
	
	return eqSettings;
}

function writeEQSettings() {
	var eqSettings = [];
	for (i=0; i<4; i++) {
		var temp = {};
		if ((i == 0) || (i == 3)) {
			temp['t'] = $('#type' + (i+1)).val();
		} else temp['t'] = 1;
		temp['q'] = $('[band="' + (i+1) + '"] .q').val();
		temp['f'] = $('[band="' + (i+1) + '"] .freq').val();
		temp['g'] = $('[band="' + (i+1) + '"] .gain').val();
		temp['e'] = enable;
		temp['b'] = i+1;
		eqSettings.push(temp);
	}	
	return eqSettings;
}

function writeCompSettings() {
	var compSettings = {"r": $('#compRatio').val(), "t": $('#compThreshold').val(), "a": $('#compAttack').val(), "rls": $('#compRelease').val(), "g": $('#compGain').val(), "e": enable};
	return compSettings;
}

/////////////////////API FUNCTIONS /////////////////////////////////


//write eq settings to Stellaris
function api_writeEQSettings() {
	var io = getCurrentIO() ? "o" : "i";
	var eqdata = writeEQSettings();
	var api_url = "a/" + io + "/" + getCurrentChannel() + "/modeq";

	var request = $.ajax({
		url: api_url,
		data: eqdata[0],
		success: function() {
			$.ajax({
				url: api_url,
				data: eqdata[1],
				success: function() {
					$.ajax({
						url: api_url,
						data: eqdata[2],
						success: function() {
							$.ajax({
								url: api_url,
								data: eqdata[3],
								success: function() {
									console.log("sent EQ settings successfully!");
								}
							});
						}
					});
				}
			});
		}
	});
}

//write compressor settings to Stellaris
function api_writeCompSettings() {
	var compdata = writeCompSettings();
	var io = getCurrentIO() ? "o" : "i";
	var api_url = "a/" + io + "/" + getCurrentChannel() + "/modcomp";
	
	$.ajax({
		url: api_url,
		data: compdata,
		success: function() {
			console.log("sent comp settings successfully!");
		}
	});
}

//rename a single channel
function api_renameChannel(channelNumber) {
	
}

//load the names of outputs
function api_loadOutputs(callback) {
	$.ajax({
		url:api_endpoints["chanlist_output"],
		dataType: 'json',
		cache:false,
		error: function () {
			alert('error loading outputs via api');
		},
		complete: function() {
		},
		success: function(data) {
			callback(data);
			globalOutputChannels = data;
		}
	});
}

//load the matrix routing
function api_loadMatrixRoutes() {
	
}

//load input hash of status and name
function api_loadInputs(callback) {
	$.ajax({
		url:api_endpoints["chanlist_input"],
		dataType: 'json',
		cache:false,
		error: function () {
			alert('error loading inputs via api');
		},
		complete: function() {
		},
		success: function(data) {
			callback(data);
			globalInputChannels = data;
		}
	});
}

//load breakout box status and name
function api_loadBreakoutBoxStatusInfo() {
	
}

//load Input/Output status and name
function api_loadIOStatusInfo() {
	
}


//////////////////////////////////////////////////////////////////////////////

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};
