//Parameters
var numOutputs = 2;
var numInputs = 2;
var api_endpoints = {};
api_endpoints["chanlist_input"] = "a/i/chanlist.json";// "spoof/chanlist_input.json";
api_endpoints["chanlist_output"] = "a/o/chanlist.json"; //"spoof/chanlist_output.json";  
var globalInputChannels = null;
var globalOutputChannels = null;
var labels_changed = [];


/*!
 * jQuery Double Tap Plugin.
 *
 * Copyright (c) 2010 Raul Sanchez (http://www.appcropolis.com)
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */


(function($){
	// Determine if we on iPhone or iPad
	var isiOS = false;
	var agent = navigator.userAgent.toLowerCase();
	if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
		   isiOS = true;
	}
 
	$.fn.doubletap = function(onDoubleTapCallback, onTapCallback, delay){
		var eventName, action;
		delay = delay == null? 500 : delay;
		eventName = isiOS == true? 'touchend' : 'click';
 
		$(this).bind(eventName, function(event){
			var now = new Date().getTime();
			var lastTouch = $(this).data('lastTouch') || now + 1 /** the first time this will make delta a negative number */;
			var delta = now - lastTouch;
			clearTimeout(action);
			if(delta<500 && delta>0){
				if(onDoubleTapCallback != null && typeof onDoubleTapCallback == 'function'){
					onDoubleTapCallback(event);
				}
			}else{
				$(this).data('lastTouch', now);
				action = setTimeout(function(evt){
					if(onTapCallback != null && typeof onTapCallback == 'function'){
						onTapCallback(evt);
					}
					clearTimeout(action);   // clear the timeout
				}, delay, [event]);
			}
			$(this).data('lastTouch', now);
		});
	};
})(jQuery);

$(function(){
	
	var colors = [
		'26e000','2fe300','37e700','45ea00','51ef00',
		'61f800','6bfb00','77ff02','80ff05','8cff09',
		'93ff0b','9eff09','a9ff07','c2ff03','d7ff07',
		'f2ff0a','fff30a','ffdc09','ffce0a','ffc30a',
		'ffb509','ffa808','ff9908','ff8607','ff7005',
		'ff5f04','ff4f03','f83a00','ee2b00','e52000'
	];
	
	var colorsGain = [
	'bf0000','c31212','c82424','cc3636','d14848','d65b5b',
	'da6d6d','df7f7f','e39191','e8a3a3','ecb6b6','f1c8c8',
	'f5dada','faecec','ffffff','ffffff','ececfa','dadaf5',
	'c8c8f1','b6b6ec','a3a3e8','9191e3','7f7fdf','6d6dda',
	'5b5bd6','4848d1','3636cc','2424c8','1212c3','0000bf',
	
	];
	
	var colorsFreq = [
	'3900c5','3f00bf','4500b9','4b00b3','5100ad',
	'5600a8','5c00a2','62009c','680096','6e0090',
	'73008b','790085','7f007f','850079','8b0073',
	'90006e','960068','9c0062','a2005c','a80056',
	'ad0051','b3004b','b90045','bf003f','c50039',
	'ad0051','b3004b','b90045','bf003f','c50039'
	];

	
	var rad2deg = 180/Math.PI;
	var deg = 0;
	var barsQ = $('#barsQ');
	var barsFreq = $('#barsFreq');
	var barsGain = $('#barsGain');
	var qDeg = 70;
	var gainDeg=180;
	var freqDeg=180.7;
	var setFreq=0;
	
	var bandSelected = 1;
	
	
	$('.abcd').click(function(e){
	//	console.log(e);
		var clicked = e.target.attributes['band'];
		//console.log(clicked.value);
		//alert("stop poking me! ");
		if (clicked.value== 2) {
			$('div[band=2]').addClass('bandSelected');
			$('div[band=1]').removeClass('bandSelected');
			bandSelected = 2;
		} else {
			$('div[band=1]').addClass('bandSelected');
			$('div[band=2]').removeClass('bandSelected');
			bandSelected = 1;
		}
		
	});
	
	
	
	for(var i=0;i<colors.length;i++){
		
		deg = i*12;
		
		// Create the colorbars
		
		$('<div class="colorBar">').css({
			backgroundColor: '#'+colors[i],
			transform:'rotate('+deg+'deg)',
			top: -Math.sin(deg/rad2deg)*80+100,
			left: Math.cos((180 - deg)/rad2deg)*80+100,
		}).appendTo(barsQ);
	}
	
	for(var i=0;i<colorsFreq.length;i++){
		
		deg = i*12;
		
		// Create the colorbars
		
		$('<div class="colorBar">').css({
			backgroundColor: '#'+colorsFreq[i],
			transform:'rotate('+deg+'deg)',
			top: -Math.sin(deg/rad2deg)*80+100,
			left: Math.cos((180 - deg)/rad2deg)*80+100,
		}).appendTo(barsFreq);
	}
	
	for(var i=0;i<colorsGain.length;i++){
		
		deg = i*12;
		
		// Create the colorbars
		
		$('<div class="colorBar">').css({
			backgroundColor: '#'+colorsGain[i],
			transform:'rotate('+deg+'deg)',
			top: -Math.sin(deg/rad2deg)*80+100,
			left: Math.cos((180 - deg)/rad2deg)*80+100,
		}).appendTo(barsGain);
	}



	var colorBarsQ = barsQ.find('.colorBar');
	var numBarsQ = 0, lastNumQ = -1;
	
	var colorBarsFreq = barsFreq.find('.colorBar');
	var numBarsFreq = 0, lastNumFreq = -1;
	
	var colorBarsGain = barsGain.find('.colorBar');
	var numBarsGain = 0, lastNumGain = -1;
	
	setQknob(qDeg);
	setGainknob(gainDeg);
	setFreqknob(freqDeg);
	
function setQknob(qDeg){	
	$('#controlQ').knobKnob({
		snap : 18,
		value: qDeg,
		turn : function(ratio){
			numBarsQ = Math.round(colorBarsQ.length*ratio);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBarsQ == lastNumQ){
				return false;
			}
			lastNumQ = numBarsQ;
			$('#qText').val(convertDegToQuality(ratio*359));
			
			colorBarsQ.removeClass('active').slice(0, numBarsQ).addClass('active');
			colorBarsQ.slice(0,1).addClass('active');
		}
	});
}

	
	$('#qText').change(this,function(){
		$('#controlQ').empty();
		//$('#barsQ').append('<div id="controlQ" field="q"></div>');
		
		var q=$('#qText').val();
		
		if(q<=.5){
			$('#qText').val(.5);
			qDeg=20;
		}
		if(q>10){
			$('#qText').val(10);
			qDeg=359;
		}
		else{
			qDeg = q*35.9;
		}
	
		setQknob(qDeg);
	});
	
	$('#controlQ').doubletap(
	    /** doubletap-dblclick callback */
	    function(event){
	    	$('#controlQ').empty();
				setQknob(35);
	    },
	    /** touch-click callback (touch) */
	    function(event){
	    },
	    /** doubletap-dblclick delay (default is 500 ms) */
	    400
	);
	
function setFreqknob(freqDeg){	
	$('#controlFreq').knobKnob({
		snap : 1,
		value: freqDeg,
		turn : function(ratio){
			numBarsFreq = Math.round(colorBarsFreq.length*ratio);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBarsFreq == lastNumFreq){
				return false;
			}
			lastNumFreq = numBarsFreq;
			if(setFreq==0){
				$('#freqText').val(convertDegToFreq(ratio*359)+ " Hz");
			}
			setFreq=0;
			colorBarsFreq.removeClass('active').slice(0, numBarsFreq).addClass('active');
		}
	});
}

	$('#freqText').change(this,function(){
		$('#controlFreq').empty();
		
		var freq=$('#freqText').val();
		
		setFreq=1;
		
		if(freq < 54){
			freq = 54;
		}
		if(freq>20000){
			freq=20000;
		}
		
		$('#freqText').val(freq+" Hz");
		
		//console.log("Got"+freq);
		
		freq = (Math.log(freq)/Math.log(10));
	
		//console.log("log check "+freq);
		//console.log(freq/.00725);
	
		freq=(freq-1.6989)/0.00725;
	
		//console.log("FreqDeg " + freq);
	
		setFreqknob(freq);
	});
	
		$('#controlFreq').doubletap(
		    /** doubletap-dblclick callback */
		    function(event){
		    	$('#controlFreq').empty();
					setFreqknob(180.7);
		    },
		    /** touch-click callback (touch) */
		    function(event){
		    },
		    /** doubletap-dblclick delay (default is 500 ms) */
		    400
		);
	


function setGainknob(gainDeg){
	$('#controlGain').knobKnob({
		snap : 1,
		value: gainDeg,
		turn : function(ratio){
			numBarsGain = Math.round(colorBarsGain.length*ratio);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBarsGain == lastNumGain){
				return false;
			}
			lastNumGain = numBarsGain;
			$('#gainText').val(convertDegToGain(ratio*359) + " dB");
			//console.log("turn" + convertDegToGain(ratio*359));
			
			if(numBarsGain > 15) {

				colorBarsGain.removeClass('active').slice(15, numBarsGain).addClass('active');
			} else {
				colorBarsGain.removeClass('active').slice(numBarsGain, 15).addClass('active');
			}
			colorBarsGain.slice(15,16).addClass('active');
		}
	});
}
	
	$('#gainText').change(this,function(){
		$('#controlGain').empty();
		//$('#barsQ').append('<div id="controlQ" field="q"></div>');
		
		var k=$('#gainText').val();
		
		if(k <= -15){
			k=-15;
			$('#gainText').val(-15);	
			gainDeg = 1;
		}
		if(k >= 15){
			k=15;
			$('#gainText').val(15);
			gainDeg = 359;
		}
		
		if(k < 0 && k > -15){
			gainDeg= k*11.9667 +15*11.9667;
		}
		if(k >= 0 && k < 15){
			gainDeg=k*11.9667+180;
		}

		setGainknob(gainDeg);
	});
	
	$('#controlGain').doubletap(
	    /** doubletap-dblclick callback */
	    function(event){
	    	$('#controlGain').empty();
				setGainknob(180);
	    },
	    /** touch-click callback (touch) */
	    function(event){
	    },
	    /** doubletap-dblclick delay (default is 500 ms) */
	    400
	);
});



function convertDegToQuality(degrees) {
	var q;
	degrees = degrees +1;
	
	//console.log("Q Deg "+degrees);
	if(degrees<20) {
			q=0.5;
			degrees=18;
		}
	
	q=degrees/35.9;
	
	q = Math.round(q*10)/10;
	
	return q;
}

function convertDegToFreq(degrees){
	var freq;
	
	freq = .0072*degrees+1.6989;
	 
	freq = (Math.pow(10,freq));
	
	freq = Math.round(freq);
	
	
	return freq;
}

function convertDegToGain(degrees) {
	var Gain;
	
	if(degrees < 180) {
		
		Gain = degrees/11.96667 - 15;
	
	}
	if(degrees >= 180){
		 
		Gain =  (degrees-180)/11.9997;
		
	}
	Gain = Math.round(Gain*5)/5;
	
	return Gain;
}





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
	} ///else $.mobile.changePage('index.htm', {reverse: true});
	
	////Put specs from API into page
	//fire off XHR request with callback for updateEQSettings
	var io = getCurrentIO() ? "o" : "i";
	var request = $.ajax({
		type: 'GET',
		url: "a/" + io + "/" + getCurrentChannel() + "/eqparams.json",
  	dataType: 'json',
		//cache: false,
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
		//cache: false,
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
	api_loadInputs(function(apiReturn) {
		//convert apiReturn to only active channel names
		var inputChannels = apiReturn;

		var counter = 0;
		//loop through all of the links that were created @ 'pagebeforecreate' runtime
		$('#labelInputsFill > div').each(function() {

			if(counter < inputChannels.length) {
				$('[for=label]', this).text(inputChannels[counter]['name']);
				$('label',this).attr('for', 'label' + inputChannels[counter]['num']);
				$('input',this).attr('id', 'label' + inputChannels[counter]['num']);
				$('input',this).attr('name', 'label' + inputChannels[counter]['num']);
				$('input',this).attr('value',inputChannels[counter]['name']);
				$('input',this).attr('channel',counter+1);
			}
			counter++;
		});
	
		if(numInputs > inputChannels.length) {
			$('label[for=label],input[id=label]').remove();
		}
		
		$('#fillInputButtons').show();
		
		$('input[type=text]').change( function(e) {
			api_renameChannel(0,$(this).attr('channel'), $(this).attr('value'));
		});
	});
	
	changeTopTitle('Label Inputs');
	var j = 1;
	for(j = 1; j <= numInputs; j++) {
		$('#labelInputsFill').append("<div data-role='fieldcontain'><label for='label' class='basic'></label><input type='text' name='label' id='label' value=''\></div>");
	}
});

//event listener for Apply button on labeli.htm
$('#labelInputsApply').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	
	
	return false;
});

/////////// Label Outputs Page -- labelo.htm ////////////////
$('#labelOutputsPage').live('pagebeforecreate', function(event,ui) {
	
	api_loadOutputs(function(apiReturn) {
		//convert apiReturn to only active channel names
		var outputChannels = apiReturn;

		var counter = 0;
		//loop through all of the links that were created @ 'pagebeforecreate' runtime
		$('#labelOutputFill > div').each(function() {

			if(counter < outputChannels.length) {
				$('[for=label]', this).text(outputChannels[counter]['name']);
				$('label',this).attr('for', 'label' + outputChannels[counter]['num']);
				$('input',this).attr('id', 'label' + outputChannels[counter]['num']);
				$('input',this).attr('name', 'label' + outputChannels[counter]['num']);
				$('input',this).attr('value',outputChannels[counter]['name']);
				$('input',this).attr('channel',counter+1);
			}
			counter++;
		});
	
		if(numOutputs > outputChannels.length) {
			$('label[for=label],input[id=label]').remove();
		}
		
		changeTopTitle('Label Outputs');
		$('#fillOutputButtons').show();
		
		$('input[type=text]').change( function(e) {
			api_renameChannel(1,$(this).attr('channel'), $(this).attr('value'));
		});
	});
	

	var j = 1;
	for(j = 1; j <= numOutputs; j++) {
		$('#labelOutputFill').append("<div data-role='fieldcontain'><label for='label' class='basic'></label><input type='text' name='label' id='label' value=''\></div>");
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
	
	if( $('#compApply').exists() ) {
		api_writeCompSettings();
	} else if ( $('#eqApply').exists() ) api_writeEQSettings();

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
function api_renameChannel(io,channelNumber, name) {
	var ioc = io ? 'o' : 'i';
	var api_url = "a/" + ioc + "/" + channelNumber + "/rename";
	
	data2 = {"name":name};
	
	$.ajax({
		url: api_url,
		data: data2,
		success: function() {
			console.log("channel renamed successfully");
		}
	});
}

//load the names of outputs
function api_loadOutputs(callback) {
	$.ajax({
		url:api_endpoints["chanlist_output"],
		dataType: 'json',
		//cache:false,
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
		//cache:false,
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

$.fn.exists = function () {
    return this.length !== 0;
}




