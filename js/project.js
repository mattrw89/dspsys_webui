//Parameters
var numOutputs = 8;
var numInputs = 8;

//initialize a few vars
var inum=0;
var onum=0;
var enable=null;

//Disable domCache & optionally disable AJAX
$(document).bind("mobileinit", function(){
    //$.mobile.ajaxLinksEnabled=false;
    //$.mobile.ajaxFormsEnabled=false;
    //$.mobile.ajaxEnabled=false;
$.mobile.page.prototype.options.domCache = false;
}); 

//create a function to grab query parameters from the URL
$.urlParam = function(name){
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (!results) { 
    return 0; 
  }
  return results[1] || 0;
}

/////////////////////////////////////////////////////////
/////////////  PAGE SPECIFIC INITIALIZERS ///////////////

///// Process Inputs -- proci.htm ////////////
$('#processInputsPage').live('pagebeforecreate', function(e) {
	var inputNames = loadActiveInputNames();
	var i = 0;
	
	for(i=0; i < inputNames.length; i++) {
		$('#fillInputButtons').append("<a href='input.htm?i=" + (i+1) + "' data-role='button'>" + inputNames[i] + "</a>");
	}
});

///// Process Outputs -- proco.htm ///////////
$('#processOutputsPage').live('pagebeforecreate', function(e) {
	var outputNames = loadOutputNameArray();
	var j = 0;
	
	for(j=0; j < outputNames.length; j++) {
		$('#fillOutputButtons').append("<a href='output.htm?o=" + (j+1) + "' data-role='button'>" + outputNames[j] + "</a>");
	}
});

//////Input Processing Selection -- input.htm /////////////
$('#inputPage').live('pagebeforeshow', function (event, ui) {
	inum = $.urlParam('i');

	$('#inputTitle').text('Input ' + getActiveInputName(inum));
	$('#eqLink').attr('href','eq.htm?i=' + inum)
	$('#compLink').attr('href','comp.htm?i=' + inum)
	$('#limLink').attr('href','lim.htm?i=' + inum)
});

////////Output Processing Selection -- output.htm ///////////////
$('#outputPage').live('pagebeforeshow', function (event, ui) {
	onum = $.urlParam('o');
	$('#outputTitle').text('Output ' + getOutputName(onum));
	$('#eqLink').attr('href','eq.htm?o=' + onum)
	$('#compLink').attr('href','comp.htm?o=' + onum)
	$('#limLink').attr('href','lim.htm?o=' + onum)
});

//////  EQ Settings Page -- eq.htm ////////////
$("#eqPage").live('pagebeforeshow',function(event) {
	enable = null; // reset the enable/disable status
	setEnableDisableButton();
	inum = $.urlParam('i');
	onum = $.urlParam('o');
	if( inum == 0 ) {
		$('.eqTitle').text('EQ Output ' + getOutputName(onum));
		$('.backLink').attr('href','output.htm?o=' + onum);
	}
	if( inum != 0) {
		$('.eqTitle').text('EQ Input ' + getActiveInputName(inum));
		$('.backLink').attr('href','input.htm?i=' + inum);
	}
});

//event listener for Apply button on eq.htm
$('#eqApply').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	//run some function to update the values in the MCU
	alert('updating...');
	return false;
});

///// Compressor Settings Page -- comp.htm ///////////
$("#compPage").live('pagebeforeshow',function(event) {
	enable = null; // reset the enable/disable status
	setEnableDisableButton();
	inum = $.urlParam('i');
	onum = $.urlParam('o');

	if( inum == 0 ) {
		$('.compTitle').text('Comp Output ' + getOutputName(onum));
		$('.backLink').attr('href','output.htm?o=' + onum);
	}
	if( inum != 0) {
		$('.compTitle').text('Comp Input ' + getActiveInputName(inum));
		$('.backLink').attr('href','input.htm?i=' + inum);
	}
	
	var values = loadCompSettings();
	$('#compRatio').val(values['ratio']);
	$('#compThreshold').val(values['threshold']);
	$('#compAttack').val(values['attack']);
	$('#compRelease').val(values['release']);
	$('#compGain').val(values['gain']);
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
		$('#fillBreakOutStatus').append("</div>");
	}
});
////// GENERAL Event Listener for Enable/Disable on eq.htm & comp.htm
$('#enableDisable').live('click',function(e) {
	e.stopImmediatePropagation();
	e.preventDefault();
	setEnableDisableButton();
	return false;
});


///////////////////////////////////////////////////////////////////////////
//////////////////   FUNCTIONS!! //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

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
//    if enable is null then it executes loadEnableStatus();
function setEnableDisableButton() {
	if (enable == null) {
		enable = loadEnableStatus();
	}
	if(enable == 1) {
		$('#enableDisable .ui-btn-text').text('Disable');
		enable=0;
	}
	else {
		$('#enableDisable .ui-btn-text').text('Enable');
		enable=1;
	}
}

function loadActiveInputNames() {
	var i=0;
	var activeInputNames = [];
	var inputInf = loadInputs();
	for (i=0; i< numInputs; i++) {
		if(inputInf[i]['active'] == 1) activeInputNames.push(inputInf[i]['name']);
	}
	return activeInputNames;
}

function getOutputName(onum) {
	return loadOutputNameArray()[onum-1];
}

function getActiveInputName(inum) {
	return loadActiveInputNames()[inum-1];
}

function changeTopTitle(text) {
	$('.topTitle').text(text);
	return false;
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