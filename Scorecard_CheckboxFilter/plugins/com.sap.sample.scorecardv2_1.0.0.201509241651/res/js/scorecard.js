sap.designstudio.sdk.Component.subclass("com.sap.sample.scorecardv2.Scorecardv2",function() {
	var that = this;
	var columnSet = undefined, lineSet = undefined, middleClm = undefined;

	var cssstyle = undefined;

	var lineGraph = undefined, clmStackedGraph = undefined, cenClmGraph = undefined, d3xAxis = undefined, d3yAxis = undefined;
	var colunmData = undefined, nested_colunmData = undefined, lineData = undefined, middleData = undefined;

	var width = 0, height = 0, legendWid = 0, middleClmColor = "#ffed66";
	var margin = {
		top : 20,
		right : 100,
		bottom : 30,
		left : 40
	};

	var stackedColor = d3.scale.ordinal().range([ "#02c39a", "#84dcc6", "#a5ffd6", "#ffa69e", "#ff686b" ]);

	this._poller = null;
	this._pollInterval = 250;
	this._previousWidth = -1;
	this._previousHeight = -1;

	var legendFilterArr = new Array();

	this.init = function() {
	};

	this.measureSize = function(_that) {
		// In most cases, the value of this is determined by how a function is called.
		// It can't be set by assignment during execution, and it may be different each time the function is called.
		var currentWidth = _that.$().innerWidth();
		var currentHeight = _that.$().innerHeight();
		if (currentWidth != _that._previousWidth || currentHeight != _that._previousHeight) {
			// alert("Resize detected.\n\nOld:" + _that._previousWidth + " x " + 
			//_that._previousHeight +"\n\nNew:" + currentWidth + " x " + currentHeight);
			_that._previousWidth = currentWidth;
			_that._previousHeight = currentHeight;

			width = currentWidth - margin.left - margin.right;
			height = currentHeight - margin.top - margin.bottom;
			//console.log("Current Width is: " + width + " Height :" + height);
			drawScoreCard(); // ***
		} else {
			// Sizes are the same. Don't redraw, but poll again
			// after an interval.
			_that._poller = window.setTimeout(function() {_that.measureSize(_that)}, _that._pollInterval);
		}
	}

	this.afterUpdate = function() {
//						console.log(that.$()[0]);
		var container = this.$()[0];
		legendWid = margin.right;
		width = this.$().width() - margin.left - margin.right;
		height = this.$().height() - margin.top - margin.bottom;

		var graph = d3.select(container).append("svg:svg")
				.attr("width",width + margin.left + margin.right)
				.attr("height",height + margin.top + margin.bottom)
				.attr("id", that.$().attr("id") + "_viz")
				.attr("transform","translate(" + margin.left + ","+ margin.top + ")");

		d3xAxis = graph.append("g").attr("class", "x axis");
		d3yAxis = graph.append("g").attr("class", "y axis");

		// When the name is specified as a string, it may have a
		// name space prefix of the form "namespace:tag"
		clmStackedGraph = graph.append("svg:g").attr("id", "StackedColumn");
		cenClmGraph = graph.append("svg:g").attr("id","CenterColumn");
		
		lineGraph = graph.append("svg:g").attr("id", "Line");

		convertData();
		drawScoreCard();
	};

	function convertData() {
		if (columnSet && columnSet.data) {
			// create a simple data array that we'll plot with a
			// line (this array represents only the Y values , X
			// will just be the index location)

			// data for stacked column chart
			colunmData = sliceData(columnSet.data,columnSet.columnCount);
			colunmData = nameDataSet(colunmData, columnSet.dimensions, columnSet.selection, "StackedColunm");

			var newClmData = new Array();
			colunmData.forEach(function(d, index) {
				d.values = colunmData.map(function(quarter, i) {
					// this function will play number of
					// colunmData.values times
					return {
						key : d.key,
						name : d.dates[i].key,
						value : d.sales[i]
					};
				});
				newClmData = newClmData.concat(d.values);
			});

			// create the special data set to fit the stacked
			// column chart
			nested_colunmData = d3.nest().key(function(d) {
				return d.name;
			}).sortKeys(d3.ascending).entries(newClmData);

			nested_colunmData.forEach(function(d) {
				var y0 = 0;
				d.values.forEach(function(data, index) {
					data.y0 = y0;
					y0 += data.value;
					data.y1 = y0;
					data.show = true;
					data.color = index;
				});
				newClmData = newClmData.concat(d.values);
			});

			// data for line Chart
			lineData = sliceData(lineSet.data, lineSet.columnCount);
			lineData = nameDataSet(lineData, lineSet.dimensions, lineSet.selection, "LineGroup");
			lineData.forEach(function(d) {
					d.show = true;
			});
			
			// data for middle Chart
			middleData = nameDataSet(middleClm, middleClm.dimensions, middleClm.selection, "MiddleColumn");

		} // if property get 3 group of data set

	}

	function drawScoreCard() {
		var svg_viz = that.$().attr("id") + '_viz';
		var lineColor = d3.scale.ordinal().range(
				[ "#06AED5", "#086788", "#98abc5", "#8a89a6",
						"#7b6888", "#a05d56", "#d0743c" ]);

		var tipdiv = d3.select("body").append("div") // declare the tooltip div
		.attr("class", "tooltip") // apply the 'tooltip' class
		.style("opacity", 0);
		
		var smtipdiv = d3.select("body").append("div") 
			.attr("class", "smtooltip") 
			.style("opacity", 0);

		
		$('#' + svg_viz).children().each(function() {
			$(this).empty();
		});

		d3.select("svg#" + that.$().attr("id") + "_viz")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom);

		// calculate the Max number
		var data = columnSet.data;
		data = data.concat(lineSet.data);
		data = data.concat(middleClm.data);

		var lengthData = columnSet.columnCount;
		var maxY = d3.max(data);
		var minY = d3.min(data);

		// X scale will fit values from 0-10 within pixels 0-100
		var x = d3.scale.ordinal().domain(d3.range(colunmData[0].dates.length)).rangePoints([ 0, width ], 1);
		var xcol = d3.scale.ordinal().domain(d3.range(colunmData[0].dates.length)).rangeBands([ 0, width ], .1, 0);
		var xccol = d3.scale.ordinal().domain(d3.range(colunmData[0].dates.length)).rangePoints([ 0, width ], 1);

		// Y scale will fit values fromWel 0-10 within pixels
		// 0-100
		var y = d3.scale.linear().domain([ maxY, minY ]).range([ 0, height ]);

		var xAxis = d3.svg.axis().scale(x).tickFormat(function(d) { return nested_colunmData[d].key; }).orient("bottom");
		var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));

		d3xAxis.call(xAxis); 
		d3yAxis.attr("stroke-width", 1).call(yAxis);
		d3.selectAll("path").attr("stroke-width", 2).attr("stroke", "#000").attr("fill", "none");

		// create a line object that represents the SVN line  we're creating

		var line = d3.svg.line() // assign the X function to plot our line as we wish
			.x(function(d, i) { // return the X coordinate where we want to plot this data point
				var xRange = x.range();
				// console.log('Plotting X value for data point: ' +
				// d + ' using index: ' + i + ' to be at: ' + x(i) +
				// ' X Range is: ' + xRange[i]);
				return xRange[i];
				// return x(i);
			}).y(function(d) {// return the Y coordinate where we want to plot this datapoint
				// console.log('Plotting Y value for data point: ' +
				// d + ' to be at: ' + y(d) + " using our yScale.");
				return y(d);
			});

		// Draw the stacked column chart
		var clmChart = clmStackedGraph.selectAll(".stackedClm")
				.data(nested_colunmData).enter().append("g")
				.attr("class", "stackedClm")
				.attr( "transform", function(d, i) {  return "translate(" + xcol(i) + ",0)"; });

		clmChart.selectAll("rect")
				.data(function(d) {
					return d.values;
				})
				.enter()
				.append("rect")
				.filter(function(d) {
					return d.show === true;
				})
				.attr("width", function() {
					return xcol.rangeBand();
				})
				.attr("y", function(d) {
					return y(d.y1);
				})
				.attr("height", function(d) {
					return y(d.y0) - y(d.y1);
				})
				.style("fill", function(d) {
					return stackedColor(d.color);
				})
				.on("mouseover", function(d) {  // Tooltip stuff after this
					console.log(d);
					tipdiv.transition().duration(300).style("opacity", 0);
					tipdiv.transition().duration(200).style("opacity", .9);
					tipdiv.html(function() {
						return '<p> Stacked Column:' + 
						 '<br/><strong>' + d.key + '</strong>' +
						 '<br/>' + d.value + '</p>';
					})
					.style("left",(d3.event.pageX + 10) + "px")
					.style("top",(d3.event.pageY - 20) + "px");
				})
				.on('mouseout', function(){
					tipdiv.transition().duration(300).style("opacity", 0);
				});
		
		// Draw the middle column chart
		var cenClmChart = cenClmGraph.selectAll(".middleClm")
			.data(middleData.data).enter()
			.append("g")
			.filter(function(){ return middleData.show === true; })
			.attr("class", "middleClm")
			.append("rect")
			.attr("x", function(d, i) {  return xccol(i) - xcol.rangeBand() / 4; })
			.attr("width", function() {  return xcol.rangeBand() / 2; })
			.attr("y", function(d) {	return y(d);})
			.attr("height", function(d) {	return height - y(d);  })
			.style("fill", middleClmColor)
			.on("mouseover", function(d, i) {  // Tooltip stuff after this
				var lineGroupNum = $(this).closest('g.LineGroup').attr('id');
				smtipdiv.transition().duration(300).style("opacity", 0);
				smtipdiv.transition().duration(200).style("background", "orange").style("opacity", .9);
				smtipdiv.html(function() {
					return '<p><strong>' +  middleData.key + '</strong>' +
					 '<br/>' + d + '</p>';
				})
				.style("left",(d3.event.pageX + 10) + "px")
				.style("top",(d3.event.pageY - 20) + "px");
			})
			.on('mouseout', function(){
				smtipdiv.transition().duration(300).style("opacity", 0);
			});
		
		// Draw line chart
		var lineChart = lineGraph.selectAll(".line")
			.data(lineData)
			.enter()
			.append("g")
			.filter(function(d){ 
				return d.show === true; 
			})
			.attr("class", "LineGroup")
			.attr("id", function(d, i) {
				return i + " " + d.key;
			});

		lineChart.append("g").attr("class", "line").append("path")
			.attr("d", function(d) {
				return line(d.sales);
			})
			.classed("sapSparkline", true)
			.style("stroke", function(d, i) {
				return lineColor(i);
		});
		// display the line by setting the lineChart with thed data line we created above

		lineChart.selectAll(".linePoint")
			.data(function(d){ return d.sales; })
			.enter()
			.append("g").attr("class", "linePoint")
			.append("circle").attr('cx', function(d, i) { var xRange = x.range();  return xRange[i];  })
			.attr('cy', function(d) { return y(d); })
			.attr('r', 6)
			.style( "fill", function() {
				var lineGroupNum = $(this).closest('g.LineGroup').attr('id');
				return lineColor(parseInt(lineGroupNum));
			})
			.style( "stroke", function() {
				var lineGroupNum = $(this).closest('g.LineGroup').attr('id');
				return lineColor(parseInt(lineGroupNum));
			})
			.on("mouseover", function(d, i) {  // Tooltip stuff after this
				var lineGroupNum = $(this).closest('g.LineGroup').attr('id');
				console.log(d);
				smtipdiv.transition().duration(300).style("opacity", 0);
				smtipdiv.transition().duration(200).style("background", "steelblue").style("opacity", .9);
				smtipdiv.html(function() {
					return '<p><strong> ' +  lineData[parseInt(lineGroupNum)].key + '</strong>' +
					 '<br/>' + d + '</p>';
				})
				.style("left",(d3.event.pageX + 10) + "px")
				.style("top",(d3.event.pageY - 20) + "px");
			})
			.on('mouseout', function(){
				smtipdiv.transition().duration(300).style("opacity", 0);
			});

		if ($("#filter_checkboxs").length === 0) {
			$('#' + that.$().attr("id")).append(
					'<div id="filter_checkboxs"></div>');
		}
		drawLegend(columnSet, stackedColor,"StackedColumnChart");
		drawLegend(lineSet, lineColor, "LineChart");
		drawSimpleLegend(middleData, middleClmColor, "MiddleColumnChart");

		var indexNum = 0;

		if (cssstyle != undefined) {
			lineChart.attr("style", cssstyle);
		}

		this._poller = window.setTimeout(function() {
			that.measureSize(that)
		}, that._pollInterval); // Call for setup the timer for
								// watching the resize of window

		$('#' + svg_viz).children().each(function() {
			if ($(this).attr("class") === "x axis") {
				$(this).attr("transform","translate(40,"+ (height+4) + ")");
			} else {
				$(this).attr("transform","translate(40,4)");
			}
		});

	} // function drawScoreCard()

	function drawLegend(dataSet, colorSet, chartName) {
		var selection = undefined, description = undefined;
		var svg = d3.select("svg");

		dataSet.selection.forEach(function(d) {
			if (typeof d === "object" || d !== -1) {
				selection = d;
			}
		});
		dataSet.dimensions.forEach(function(obj) {
			if (obj.key === "DESCRIPTION") {
				description = obj.members;
			}
		});
		var legendText = selection.map(function(d) {
			return description[d]
		});

		chartName  = "checkboxs_" + chartName;
		// Assign each input:checkbox to form#checkboxs_charName
		if ($('#' + chartName).length === 0) {
			// $('#' + div_container_id).append('<form id="' +
			// chartName + '"></form>');
			$('div#filter_checkboxs').append(
					'<form id="' + chartName + '"></form>');
			for ( var obj in legendText) {
				var radioBtn = $('<input type="checkbox" name="rbtnCount"/> <div class="colorbox"></div>'
						+ legendText[obj].key + '<br>');
				// $('form#' + chartName).append(radioBtn);

				radioBtn.attr("value", legendText[obj].key)
						.attr("id", obj).appendTo('form#' + chartName).prop('checked', true);

				if (chartName === "checkboxs_StackedColumnChart") {
					radioBtn.change(stackedClmFilterCheck); // radioBtn.change
				} else if (chartName === "checkboxs_LineChart") {
					radioBtn.change(lineFilterCheck);
				}
			} // for(var obj in legendText)
		} // if #checkbox_chartName === 0

		$('#' + chartName + ">div.colorbox").css(
				"background-color", function(index, value) {
					var colorId = $(this).attr("id");
					return colorSet(colorId);
				}); // fill different color for square of each  // inpug:checkbox

	}// drawLegend(dataSet, colorSet)
	
	function drawSimpleLegend(dataSet, color, chartName) {
		chartName = "checkboxs_" + chartName;
		if ($('#' + chartName).length === 0) {
			$('div#filter_checkboxs').append('<form id="' + chartName + '"></form>');
			var radioBtn = $('<input type="checkbox" name="rbtnCount"/> <div class="colorbox"></div>' + dataSet.key + '<br>');

				radioBtn.attr("value", dataSet.key)
					.appendTo('form#' + chartName).prop('checked', true)
					.change(midClmFilterCheck);
		} // if #checkbox_chartName === 0

		$('#' + chartName + " > div.colorbox").css("background-color", color); 
	}// drawSimpleLegend(dataSet, colorSet)

	function stackedClmFilterCheck() {
		if (!$(this).is(':checked')) {
			console.log("## " + $(this).attr("value") + "_HIDE!");
			var checkbox_value = $(this).attr("value");
			// the checkbox was checked
			nested_colunmData.forEach(function(d) {
				var y0 = 0;
				d.values.forEach(function(data) {
					if (data.key === checkbox_value) {
						data.show = false;
						data.y0 = y0;
						data.y1 = y0;
					} else if(data.show === true){
						data.y0 = y0;
						y0 += data.value;
						data.y1 = y0;
					} else if(data.show === false && data.key != checkbox_value){
						console.log("### one data don't SHOW! and name isn't checked");
						data.y0 = y0;
						data.y1 = y0;
					}

				});
			});
			drawScoreCard();
		} else {
			console.log("## " + $(this).attr("value") + "_SHOW!");
			var checkbox_value = $(this).attr("value");
			// the checkbox was checked
			nested_colunmData.forEach(function(d) {
				var y0 = 0;
				d.values.forEach(function(data) {
					if (data.key === checkbox_value) {
						data.show = true;
						data.y0 = y0;
						y0 += data.value;
						data.y1 = y0;
					} else if(data.show === true) {
						data.y0 = y0;
						y0 += data.value;
						data.y1 = y0;
					} else if(data.show === false && data.key != checkbox_value){
						console.log("### one data don't SHOW! and name isn't checked");
						data.y0 = y0;
						data.y1 = y0;
					}
				});
			});
			drawScoreCard();
		} // if-else
		
		console.log("### Nested_Column Data after clicking the check box ###");						
		console.log(nested_colunmData);
	}

	function lineFilterCheck() {
		if (!$(this).is(':checked')) {
			console.log("## " + $(this).attr("value") + "_HIDE!");
			var checkbox_value = $(this).attr("value");
			// the checkbox is unchecked
			lineData.forEach(function(d) {
				if (d.key === checkbox_value) {
					d.show = false;
				}
			});
			drawScoreCard();
		} else {
			console.log("## " + $(this).attr("value") + "_SHOW!");
			var checkbox_value = $(this).attr("value");
			// the checkbox is checked
			lineData.forEach(function(d) {
				if (d.key === checkbox_value) {
					d.show = true;
				}
			});
			drawScoreCard();
		} // if-else
	}
	
	function midClmFilterCheck() {
		if (!$(this).is(':checked')) {
			console.log("## " + $(this).attr("value") + "_HIDE!");
			var checkbox_value = $(this).attr("value");
			// the checkbox is unchecked
			middleData.show = false;
			drawScoreCard();
		} else {
			console.log("## " + $(this).attr("value") + "_SHOW!");
			var checkbox_value = $(this).attr("value");
			// the checkbox is checked
			middleData.show = true;
			drawScoreCard();
		} // if-elsed
		console.log(middleData);	
	}

	function sliceData(data, colNum) {
		var objNum = data.length / colNum;
		var tempArr = new Array(), newArr = new Array();
		for (var i = 0; i < objNum; i++) {
			temArr = data.slice(i * colNum, (i + 1) * colNum);
			newArr.push(temArr);
		}
		// console.log(newArr);
		return newArr;
	}

	function nameDataSet(dataSet, dimensions, selectionArr, arrayname) {
		var desriptArr = new Array();
		for ( var i in dimensions) {
			if (dimensions[i].key === "DESCRIPTION")
				desriptArr = dimensions[i];
		}
		var dateArr = new Array();
		for ( var i in dimensions) {
			if (dimensions[i].key === "DATE")
				dateArr = dimensions[i].members;
		}

		var selection = selectionArr[2];

		// Create new Key array which include the all DESCRIPTIONs in current data set.
		var returnArr = new Array();
		
		if(typeof selection === "number"){ // selection is a number
			returnArr.key = desriptArr.members[selection].key;
			returnArr.data = dataSet.data;
			returnArr.show = true;
			return returnArr;
		}
		else if(typeof selection === "object"){
			var keyArr = new Array();
			for (var k = 0; k < selection.length; k++) {
				var newmem = desriptArr.members[selection[k]];
				keyArr.push(newmem);
			}
			for ( var index in dataSet) {
				var newObj = new Object();
				newObj.dates = dateArr;
				newObj.sales = dataSet[index];
				newObj.key = keyArr[index].key;
				returnArr.push(newObj);
			}
			return returnArr;
		}
	}

	this.stackedColumnSet = function(value) {
		if (value === undefined) {
			return columnSet;
		} else {
			columnSet = value;
			console.log("## [GS] Stacked Column Set Data is: ");
			console.log(columnSet);
			return this;
		}
	};

	this.lineSet = function(value) {
		if (value === undefined) {
			return lineSet;
		} else {
			lineSet = value;
			console.log("## [GS] Line Set Data is: ");
			console.log(lineSet);
			return this;
		}
	};
	this.centerColumn = function(value) {
		if (value === undefined) {
			return middleClm;
		} else {
			middleClm = value;
			console.log("## [GS] Middle Column Data is: ");
			console.log(middleClm);
			return this;
		}
	};

	this.css = function(value) {
		if (value === undefined) {
			return cssstyle;
		} else {
			cssstyle = value;
			return this;
		}
	};
});