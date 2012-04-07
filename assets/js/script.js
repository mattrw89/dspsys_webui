$(function(){
	
	var colors = [
		'26e000','2fe300','37e700','45ea00','51ef00',
		'61f800','6bfb00','77ff02','80ff05','8cff09',
		'93ff0b','9eff09','a9ff07','c2ff03','d7ff07',
		'f2ff0a','fff30a','ffdc09','ffce0a','ffc30a',
		'ffb509','ffa808','ff9908','ff8607','ff7005',
		'ff5f04','ff4f03','f83a00','ee2b00','e52000'
	];
	
	var rad2deg = 180/Math.PI;
	var deg = 0;
	var barsQ = $('#barsQ');
	var barsFreq = $('#barsFreq');
	var barsGain = $('#barsGain');
	
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
	
	for(var i=0;i<colors.length;i++){
		
		deg = i*12;
		
		// Create the colorbars
		
		$('<div class="colorBar">').css({
			backgroundColor: '#'+colors[i],
			transform:'rotate('+deg+'deg)',
			top: -Math.sin(deg/rad2deg)*80+100,
			left: Math.cos((180 - deg)/rad2deg)*80+100,
		}).appendTo(barsFreq);
	}
	
	for(var i=0;i<colors.length;i++){
		
		deg = i*12;
		
		// Create the colorbars
		
		$('<div class="colorBar">').css({
			backgroundColor: '#'+colors[i],
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
	
	
	$('#controlQ').knobKnob({
		snap : 15,
		value: 180,
		turn : function(ratio){
			numBarsQ = Math.round(colorBarsQ.length*ratio);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBarsQ == lastNumQ){
				return false;
			}
			lastNumQ = numBarsQ;
			
			colorBarsQ.removeClass('active').slice(0, numBarsQ).addClass('active');
		}
	});
	
	$('#controlFreq').knobKnob({
		snap : 10,
		value: 300,
		turn : function(ratio){
			numBarsFreq = Math.round(colorBarsFreq.length*ratio);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBarsFreq == lastNumFreq){
				return false;
			}
			lastNumFreq = numBarsFreq;
			
			colorBarsFreq.removeClass('active').slice(0, numBarsFreq).addClass('active');
		}
	});

	$('#controlGain').knobKnob({
		snap : 10,
		value: 300,
		turn : function(ratio){
			numBarsGain = Math.round(colorBarsGain.length*ratio);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBarsGain == lastNumGain){
				return false;
			}
			lastNumGain = numBarsGain;
			
			colorBarsGain.removeClass('active').slice(0, numBarsGain).addClass('active');
		}
	});
	
});


function convertDegToQuality(degrees) {
	var q = 0;
	
	if(degree>=180)[
		
		q=degree/11.96667-15;
	
	]
	if(degree<180){
		
		q=-1*degree/11.9997-15;
		
	}
	
	return q;
}
