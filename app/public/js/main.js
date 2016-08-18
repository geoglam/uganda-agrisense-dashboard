require(["js/charts"], function(charts) {

	var selectType = "District";
	var d = new Date();
	var month_key = new Array();
	month_key[1] = "January";
	month_key[2] = "February";
	month_key[3] = "March";
	month_key[4] = "April";
	month_key[5] = "May";
	month_key[6] = "June";
	month_key[7] = "July";
	month_key[8] = "August";
	month_key[9] = "September";
	month_key[10] = "October";
	month_key[11] = "November";
	month_key[12] = "December";
	var onaClient;
	var current_district = "*"; // Starts with all districts
	var current_month = 6
	var today_month = d.getMonth()+1;
	var current_key;
	var map;
	var gData;
	var layer;
	var layerLabels;


	var geojsonMarkerOptions = {
			radius: 8,
			fillColor: "#009688",
			color: "#fff",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
	};

	var selectedGeojsonMarkerOptions = {
			radius: 8,
			fillColor: "#DC9B23",
			color: "#fff",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
	};

	var myStyle = {
    "color": "#635B5B",
    "weight": 2,
    "opacity": 9,
		"fillOpacity": 0,
};

	var mapDistrictBoundary = new L.geoJson(null,{
		style: myStyle,
		onEachFeature: function (feature, layer) {
			var html = "";
			html += "<b>District:</b> " + feature.properties.District + "<br/>"
			layer.bindPopup(html);
		}
	});

	var mapRegionBoundary = new L.geoJson(null,{
		style: myStyle,
		onEachFeature: function (feature, layer) {
			var html = "";
			html += "<b>Region:</b> " + feature.properties.Region + "<br/>"
			layer.bindPopup(html);
		}
	});

	var in_season_assessment = new L.geoJson();

	var current_district_data = new L.geoJson(null,{
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, geojsonMarkerOptions);
			},
			onEachFeature: function (feature, layer) {
				var html = ""
				html += "<b>District:</b> " + feature.properties.District + "<br/>"
				html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
				html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
				if (feature.properties.crop_con_8 !=null){
				html += "<img width='150px' src='"+appConfig.mediaURL+feature.properties.crop_con_8.split(".")[0]+".jpg' />"  +"<br/>"
				}
				layer.bindPopup(html);
			}
		}
	);

	function getAllForms(){
		onaClient.getForms(function(data){
			var html = '';
			for (var i = 0; i < data.length; i++) {
				html += "<option>"+data[i].title+"</option>";
			}
			$("#formlist").html(html);
			resetMasterialSelect();
		});
	}

	function resetMasterialSelect(){
		$('select').material_select();
		$('#districts').change(function(){
			districtStateChange($(this).val());

		});

		$('#month').change(function(){
			current_month = this.value;
			current_district = $("#districts").val();
			monthStateChange(current_month);
			if (selectType == "District"){
				setDistrictsItems();
			}else{
				setRegionsItems();
			}

			loadCharts("*");


		});
	}
	function districtStateChange(value){
		map.removeLayer(current_district_data);
		if (value == "all") {
			current_district = "*";
			loadCharts("*");
			showAllMapData();
		}else{
			current_district = value;
			loadCharts(value);
			setMapDataToDistrict(value);
		}
	}

	function monthStateChange(month){
		map.removeLayer(current_district_data);
		district = $('#districts').val();
		if (district == "all") {
			current_district = "*";
			loadCharts("*");
			showAllMapData();
		}else{
			current_district = district;
			loadCharts(district);
			setMapDataToDistrict(district);
		}
	}

	function showAllMapData(){
		current_district_data = L.geoJson(gData, {
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, geojsonMarkerOptions);
			},
			filter: function(feature, layer) {
					return (feature.properties.month == current_month)
			},
			onEachFeature: function (feature, layer) {
				var html = ""
				html += "<b>District:</b> " + feature.properties.District + "<br/>"
				html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
				html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
				html += "<b>Month:</b>" + feature.properties.month + "<br/>"
				if (feature.properties.crop_con_8 !=null){
					html += "<img width='150px' src='"+appConfig.mediaURL+feature.properties.crop_con_8.split(".")[0]+".jpg' />"  +"<br/>"
				}

				layer.bindPopup(html);
			}
		});
		map.fitBounds(current_district_data.getBounds());
		current_district_data.addTo(map);

	}
	function setMapDataToDistrict(district){
		current_district_data = L.geoJson(gData, {
			pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    	},
			filter: function(feature, layer) {
					return ((feature.properties[selectType] == district) && ( feature.properties.month == current_month))
			},
			onEachFeature: function (feature, layer) {
				var html = ""
				html += "<b>District:</b> " + feature.properties.District + "<br/>"
				html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
				html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
				html += "<b>Month:</b>" + feature.properties.month + "<br/>"
				if (feature.properties.crop_con_8 !=null){
					html += "<img width='150px' src='"+appConfig.mediaURL+feature.properties.crop_con_8.split(".")[0]+".jpg' />"  +"<br/>"
				}

				layer.bindPopup(html);
			}
		});
		if (_.isEmpty(current_district_data._layers)){

		}else{
			console.log(current_district_data._layers);
			map.fitBounds(current_district_data.getBounds());
			current_district_data.addTo(map);
		}
		// console.log(current_district_data._layers);
		// map.fitBounds(current_district_data.getBounds());
		// current_district_data.addTo(map);
	}
	function stopSplashScreen(){
		$( "#loading" ).animate({
				opacity: 0,
				display:'none',
			},1000, function() {
				this.remove();
		});
	}

	function addGeoJSON(url, geojson){
		var request = $.ajax({
			dataType: "json",
			url: url,
			async:false,
			success: function(data) {
				gData = data;
		  	$(data.features).each(function(key, data) {

		        geojson.addData(data);
		    });
			}
		}).error(function() {});
	}

	function setDistrictsItems(){
		var form = $('#formlist').val();
		if (form == 'in'){
			var districts = _.uniq(in_season_assessment.getLayers().filter(function(row){
				return (row.feature.properties.District != null && row.feature.properties.month == current_month);
			}).map(function(row){
				return row.feature.properties.District;
			}));

			var html = "<option value='all'>All</option>";
			districts.sort();
			$(districts).each(function(key,data){
				html += "<option value='"+data+"'>"+data+"</option>";
			});
			$("#districts").html(html);
			$("#districts").material_select();
		}
	}

	function setRegionsItems(){
		var form = $('#formlist').val();
		if (form == 'in'){
			var districts = _.uniq(in_season_assessment.getLayers().filter(function(row){
				return (row.feature.properties.Region != null && row.feature.properties.month == current_month);
			}).map(function(row){
				return row.feature.properties.Region;
			}));

			var html = "<option value='all'>All</option>";
			districts.sort();
			$(districts).each(function(key,data){
				html += "<option value='"+data+"'>"+data+"</option>";
			});
			$("#districts").html(html);
			$("#districts").material_select();
		}
	}

	function setMonths(){
		var form = $('#formlist').val();
		if (form == 'in'){

			var months = _.uniq(in_season_assessment.getLayers().filter(function(row){
				return row.feature.properties.month != null;
			}).map(function(row){
				return row.feature.properties.month;
			}));

			var html;
			months.sort();
			var selected_month;
			// $(months).each(function(key,data){
			// 	if (data == today_month){
			// 		selected_month = today_month;
			// 	}
			// });
			$(months).each(function(key,data){
				if (data == today_month){
					html += "<option selected value='"+data+"'>"+month_key[data]+"</option>";
				}else{
					html += "<option value='"+data+"'>"+month_key[data]+"</option>";
				}
			});

			$("#month").html(html);
			$('#month').children().last();
			$("#month").material_select();
		}
	}

	function getData(district,field){
		var data = []
		if (district == "*"){
			data = in_season_assessment.getLayers().filter(function(row){
				return row.feature.properties.month == current_month;
			}).map(function(row){
				return row.feature.properties[field]
			});

		}else{
			data = in_season_assessment.getLayers().filter(function(row){
		    return ((row.feature.properties[selectType] == district) && (row.feature.properties.month == current_month))
		  }).map(function(row){
		    return row.feature.properties[field]
		  });
		}
		return data
	}

	function getData2(district,field){
		var data = []
		data = in_season_assessment.getLayers().filter(function(row){
			return (row.feature.properties.month == current_month) && (row.feature.properties[field] != 'n/a') && row.feature.properties[field] != '0';
		}).map(function(row){
			return {price:row.feature.properties[field],'district':row.feature.properties[selectType]}
		});
		return data
	}

	function generateMaizeDevelopmentStage(district){
		// var data = getData(district,appConfig.chartFields.chart2[0].field);
		var temp = appConfig.chartFields.chart2
		var categories = []
		var chart_data = []
		temp.map(function(row){
			var temp2 = getData(district,row.field);
			// var total = temp2.length;
			temp2 = temp2.filter(function(row){
				return (row != null && row != "n/a")
			});
			var count = _.countBy(temp2,_.identity).True;
			if (count){
				categories.push(row.text)
				chart_data.push(count)
			}
		})
		var total = 0;
		for (var i = 0; i < chart_data.length; i++) {
			total = chart_data[i] + total

		}
		// chart_data.map(function(row){
		// 	total + row
		// });
		// debugger
		chart_data = chart_data.map(function(row){
			return (row/total) * 100
		})





		// debugger
		// data = data.filter(function(row){
		// 	return row != null
		// });
		// var total = data.length;
		// var uniq = _.uniq(data);
		// var categories = uniq.map(function(row){
		// 	return row.replace("_"," ")
		// })
		// var chart_data = uniq.map(function(row){
		// 	return ((_.countBy(data)[row])/total) *100
		// });

		$('#chart2').highcharts({
						chart: {type: 'bar'},
						title: {text: 'Maize Development Stage'},
						xAxis: {categories: categories,title: {text: null}},
						yAxis: {min: 0,title: {text: '',align: 'high'},labels: {overflow: 'justify'}},
						tooltip: {enabled:false,pointFormat: '{point.y:.0f}',valueSuffix: ' percentage'},
						plotOptions: {bar: {dataLabels: {format:"{y:.0f}%",enabled: true}}},
						legend: {enabled:false},
						credits: {enabled: false},
						series: [{
								data: chart_data
						}]
				});
	}
 // The original Maize Development stage before multi select
	// function generateMaizeDevelopmentStage(district){
	// 	var data = getData(district,appConfig.chartFields.chart2);
	// 	data = data.filter(function(row){
	// 		return row != null
	// 	});
	// 	var total = data.length;
	// 	var uniq = _.uniq(data);
	// 	var categories = uniq.map(function(row){
	// 		return row.replace("_"," ")
	// 	})
	// 	var chart_data = uniq.map(function(row){
	// 		return ((_.countBy(data)[row])/total) *100
	// 	});
	//
	// 	$('#chart2').highcharts({
	// 	        chart: {type: 'bar'},
	// 	        title: {text: 'Maize Development Stage'},
	// 	        xAxis: {categories: categories,title: {text: null}},
	// 	        yAxis: {min: 0,title: {text: '',align: 'high'},labels: {overflow: 'justify'}},
	// 	        tooltip: {enabled:false,pointFormat: '{point.y:.0f}',valueSuffix: ' percentage'},
	// 	        plotOptions: {bar: {dataLabels: {format:"{y:.0f}%",enabled: true}}},
	// 	        legend: {enabled:false},
	// 	        credits: {enabled: false},
	// 	        series: [{
	// 	            data: chart_data
	// 	        }]
	// 	    });
	// }
	function farmerAssessmentCondition(district){
		var data = getData(district,appConfig.chartFields.chart6);
		data = data.filter(function(row){
			return row != null
		});
		var total = data.length;
		var uniq = _.uniq(data);
		var categories = uniq.map(function(row){
			return row.replace("_"," ")
		})
		var chart_data = uniq.map(function(row){
			return ((_.countBy(data)[row])/total) *100
		});

		$('#chart6').highcharts({
						chart: {type: 'bar'},
						title: {text: 'Farmer Assessment of Condition'},
						xAxis: {categories: categories,title: {text: null}},
						yAxis: {min: 0,title: {text: '',align: 'high'},labels: {overflow: 'justify'}},
						tooltip: {enabled:false,pointFormat: '{y:.0f}%',valueSuffix: ' percentage'},
						plotOptions: {
							bar: {
								dataLabels: {
									format:"{y:.0f}%",
									enabled: true
								}
							},
							series:{
								point:{
									events:{
										mouseOver: function(e) {
											if (this.category == "above average"){
												filterMapByCategory(this.category.replace(" ","_"),appConfig.chartFields.chart6);
											}else{
												filterMapByCategory(this.category,appConfig.chartFields.chart6);
											}

										},
										mouseOut:function(e){
											resetfilterMapByCategory(this.category,appConfig.chartFields.chart6)
										}
									}
								}
							}
						},
						legend: {enabled:false},
						credits: {enabled: false},
						series: [{
								data: chart_data
						}]
				});
	}
	function resetfilterMapByCategory(category,key){
		map.removeLayer(current_district_data);
		current_district_data = L.geoJson(gData, {
			pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    	},
			filter: function(feature, layer) {
					if (current_district =="*"){
						return (feature.properties.month == current_month)
					}else{
						return (feature.properties[selectType] == current_district && feature.properties.month == current_month) ;
					}

			},
			onEachFeature: function (feature, layer) {
				var html = ""
				html += "<b>District:</b> " + feature.properties.District + "<br/>"
				html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
				html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
				if (feature.properties.crop_con_8 !=null){
				html += "<img width='150px' src='"+appConfig.mediaURL+feature.properties.crop_con_8.split(".")[0]+".jpg' />"  +"<br/>"
				}

				layer.bindPopup(html);
			}
		});
		current_key = key;
		current_district_data.addTo(map);
	}
	function filterMapByCategory(category,key){
		map.removeLayer(current_district_data);
		current_district_data = L.geoJson(gData, {
			pointToLayer: function (feature, latlng) {
				var sym;
					if (feature.properties[key] == category){
						sym = selectedGeojsonMarkerOptions
					}else{
						sym = geojsonMarkerOptions
					}
        return L.circleMarker(latlng, sym);
    	},
			filter: function(feature, layer) {
					if (current_district =="*"){
						return (feature.properties.month == current_month)
					}else{
						// console.log(current_month);
						return (feature.properties[selectType] == current_district && feature.properties.month == current_month) ;
					}

			},
			onEachFeature: function (feature, layer) {
				var html = ""
				html += "<b>District:</b> " + feature.properties.District + "<br/>"
				html += "<b>Crop:</b> "+feature.properties.agricultur + "<br/>"
				html += "<b>Comments:</b> "+feature.properties.comments + "<br/>"
				if (feature.properties.crop_con_8 !=null){
					html += "<img width='150px' src='"+appConfig.mediaURL+feature.properties.crop_con_8.split(".")[0]+".jpg' />"  +"<br/>"
				}

				layer.bindPopup(html);
			}
		});
		current_key = key;

		// map.removeLayer(current_district_data);
		current_district_data.addTo(map);
	}

	function generateCropTypeChart(district){
		var data;
		// console.log(district)
		if (district == "*"){
			data = in_season_assessment.getLayers().filter(function(row){
				return row.feature.properties.month == current_month;
			}).map(function(row){
				// return row.feature.properties.agricultur
				return row.feature.properties[appConfig.chartFields.chart1]
			});
		}else{
			// if(selectType == "Regions"){
				data = in_season_assessment.getLayers().filter(function(row){
					console.log(row.feature.properties[selectType])
					return ((row.feature.properties[selectType] == district) && (row.feature.properties.month == current_month))
				}).map(function(row){
					return row.feature.properties[appConfig.chartFields.chart1]
				});
			// }else if (selectType == "Districts") {
			// 	data = in_season_assessment.getLayers().filter(function(row){
			// 		return ((row.feature.properties.District == district) && (row.feature.properties.month == current_month))
			// 	}).map(function(row){
			// 		return row.feature.properties.agricultur
			// 	});
			// }
		}

		var unique_crops = _.uniq(data);
		var chartData = unique_crops.map(function(row){
			return {
			 	name:row,
			 	y:_.countBy(data)[row],
			 }
		})

		$('#chart1').highcharts({
	        chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,type: 'pie'},
	        title: {text: 'Crop Types'},
	        tooltip: {enabled:false,pointFormat: '{point.percentage:.0f}%'},
	        plotOptions: {
						pie: {
							allowPointSelect: false,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								format: '{point.name}: {point.percentage:.0f}%',
								style: {
									color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
								}
							},
							point:{
								events:{
									select: function(e){
										filterMapByCategory(this.name,appConfig.chartFields.chart1)
									},
									mouseOver: function(e) {
										 filterMapByCategory(this.name,appConfig.chartFields.chart1)
									},
									unselect:function(e){
										resetfilterMapByCategory(this.name,appConfig.chartFields.chart1)
									}
									,
									mouseOut:function(e){
										 resetfilterMapByCategory(this.name,appConfig.chartFields.chart1)
									}
								}
							}

						}
					},
					credits: {enabled: false},


					series: [{
	            name: 'Crops',
	            colorByPoint: true,
	            data:chartData
	        }]
	    });

	}
	function countInRange(data,high,low,binStep){
		var count = 0;
		for (var i = 0; i < data.length; i++) {
			if (binStep == 0 ){
				if(data[i] <=high){
					count = count + 1
				}
			}else{
				if (data[i] > low & data[i] <= high){
					count = count + 1
				}
			}

		}
		return count
	}

	function generateFoodPriceBeans(district){
		var c = getData2(district,appConfig.chartFields.chart9)
		var unq_dist =  _.uniq(c.map(function(row){
			return row.district
		}));
		var prices_avg = [];
		unq_dist.map(function(d){
			var prices = c.filter(function(row){
				return d == row.district
			}).map(function(row){
				return parseInt(row.price)
			});
			var priceTotal = _(prices).sum();
			prices_avg.push({district:d,avergare:priceTotal/prices.length})
		})

		var s = prices_avg.map(function(row){
			return row.avergare
		});
		$('#chart9').highcharts({
				chart: {type: 'bar'},
				title: {text: 'Beans (average price)'},
				xAxis: {categories: unq_dist,title: {text: selectType}},
				yAxis: {min: 0,title: {text: 'Prices'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {enabled:false,pointFormat: '{point.y}'},
				plotOptions: {bar: {dataLabels: {format:"{y:.0f} UGX",enabled: true}}},
				series: [{
						data: s
				}]
		});
	}

	function generateFoodPriceCassava(district){
		var c = getData2(district,appConfig.chartFields.chart8)
		var unq_dist =  _.uniq(c.map(function(row){
			return row.district
		}));
		var prices_avg = [];
		unq_dist.map(function(d){
			var prices = c.filter(function(row){
				return d == row.district
			}).map(function(row){
				return parseInt(row.price)
			});
			var priceTotal = _(prices).sum();
			prices_avg.push({district:d,avergare:priceTotal/prices.length})
		})

		var s = prices_avg.map(function(row){
			return row.avergare
		});
		$('#chart8').highcharts({
				chart: {type: 'bar'},
				title: {text: 'Matooke (average price)'},
				xAxis: {categories: unq_dist,title: {text: selectType}},
				yAxis: {min: 0,title: {text: 'Prices'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {enabled:false,pointFormat: '{point.y}'},
				plotOptions: {bar: {dataLabels: {format:"{y:.0f} UGX",enabled: true}}},
				series: [{
						data: s
				}]
		});
	}

	function generateFoodPriceRice(district){

		var c = getData2(district,appConfig.chartFields.chart4)
		var unq_dist =  _.uniq(c.map(function(row){
			return row.district
		}));
		var prices_avg = [];
		unq_dist.map(function(d){
			var prices = c.filter(function(row){
				return d == row.district
			}).map(function(row){
				return parseInt(row.price)
			});
			var priceTotal = _(prices).sum();
			prices_avg.push({district:d,avergare:priceTotal/prices.length})
		})

		var s = prices_avg.map(function(row){
			return row.avergare
		});
		$('#chart4').highcharts({
				chart: {type: 'bar'},
				title: {text: 'Rice (average price)'},
				xAxis: {categories: unq_dist,title: {text: selectType}},
				yAxis: {min: 0,title: {text: 'Prices'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {enabled:false,pointFormat: '{point.y}'},
				plotOptions: {bar: {dataLabels: {format:"{y:.0f} UGX",enabled: true}}},
				series: [{
						data: s
				}]
		});
	}

	function generateMaizeHeightChart(district){
		var bins = [0.5,1.0,1.5,2.0,2.5,3.0,4.0,5.0,6.0]
		var step = 0.5
		data = getData(district,appConfig.chartFields.chart3)
		data = data.filter(function(row){
			return row !=null

		});
		data = data.sort()
		var total = data.length -1;
		var binStep = 0;
		var binCounts = []
		for (var i = 0; i < bins.length-1; i++) {
			var high = bins[i]
			var low = bins[i] - step
			var binCount = (countInRange(data,high,low,binStep)/total)*100
			binCounts.push([bins[i],binCount]);
			binStep = binStep+1;
		}
		$('#chart3').highcharts({
        chart: {type: 'column'},
        title: {text: 'Maize Height'},
        xAxis: {type: 'category',title:{text:"Maize Hight (meters)"}},
        yAxis: {min: 0,title: {text: 'Frequency in percentage'}},
        legend: {enabled: false},
				credits: {enabled: false},
        tooltip: {
					enabled:false,
					pointFormat: 'Maize Height {point.y:.0f}%'
				},
        series: [{
            name: 'Maize Height',
            data: binCounts,
            dataLabels: {
                enabled: true,
                rotation: 0,
                align: 'center',
                format: '{point.y:.0f}%', // one decimal
                y: 0, // 10 pixels down from the top
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });
	}
	function generateMaizeFoodPriceChart(district){

		var c = getData2(district,appConfig.chartFields.chart7)
		var unq_dist =  _.uniq(c.map(function(row){
			return row.district
		}));
		var prices_avg = [];
		unq_dist.map(function(d){
			var prices = c.filter(function(row){
				return d == row.district
			}).map(function(row){
				return parseInt(row.price)
			});
			var priceTotal = _(prices).sum();
			prices_avg.push({district:d,avergare:priceTotal/prices.length})
		})

		var s = prices_avg.map(function(row){
			return row.avergare
		});
		$('#chart7').highcharts({
				chart: {type: 'bar'},
				title: {text: 'Maize (average price)'},
				xAxis: {categories: unq_dist,title: {text: selectType}},
				yAxis: {min: 0,title: {text: 'Prices'}},
				legend: {enabled: false},
				credits: {enabled: false},
				tooltip: {enabled:false,pointFormat: '{point.y}'},
				plotOptions: {bar: {dataLabels: {format:"{y:.0f} UGX",enabled: true}}},
				series: [{
						data: s
				}]
		});
	}

	function generateIrrigated(district){

		data = getData(district,appConfig.chartFields.chart0)
		data = data.filter(function(row){
			return row !=null
		})
		var categories = _.uniq(data);

		var chartData = categories.map(function(row){
			return {
				name:row,
				y:_.countBy(data)[row],
			 }
		})
		$('#chart0').highcharts({
					chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,type: 'pie'},
					title: {text: 'Crop Irrigated'},
					tooltip: {enabled:false,pointFormat: '{point.percentage:.0f}%</b>'},
					plotOptions: {
						pie: {
							allowPointSelect: false,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								format: '{point.name}: {point.percentage:.0f}%',
								style: {
									color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
								}
							},
							point:{
								events:{
									mouseOver: function(e) {
										 filterMapByCategory(this.name,appConfig.chartFields.chart0)
									},
									mouseOut:function(e){
										 resetfilterMapByCategory(this.name,appConfig.chartFields.chart0)
									}
								}
							}
						},

				},
					credits: {enabled: false},
					series: [{
							name: 'Crop Irrigated',
							colorByPoint: true,
							data:chartData
					}]
			});
	}

	function generateWeeded(district){
		data = getData(district,appConfig.chartFields.chart5)
		data = data.filter(function(row){
			return row !=null
		})
		var categories = _.uniq(data);

		var chartData = categories.map(function(row){
			return {
				name:row,
				y:_.countBy(data)[row],
			 }
		})
		$('#chart5').highcharts({
					chart: {plotBackgroundColor: null,plotBorderWidth: null,plotShadow: false,type: 'pie'},
					title: {text: 'Crop Weeded'},
					tooltip: {enabled:false,pointFormat: '{point.percentage:.0f}%'},
					plotOptions: {
						pie: {
							allowPointSelect: false,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								format: '{point.name}: {point.percentage:.0f}%',
								style: {
									color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
								}
							},
							point:{
								events:{
									mouseOver: function(e) {
										 filterMapByCategory(this.name,appConfig.chartFields.chart5)
									},
									mouseOut:function(e){
										 resetfilterMapByCategory(this.name,appConfig.chartFields.chart5)
									}
								}
							}
						}
					},
					credits: {enabled: false},
					series: [{
							name: 'Crop Weeded',
							colorByPoint: true,
							data:chartData
					}]
			});
	}

	function loadCharts(district){

		generateCropTypeChart(district);
		generateMaizeDevelopmentStage(district);
		generateMaizeHeightChart(district);
		generateIrrigated(district)
		generateWeeded(district);
		farmerAssessmentCondition(district);
		generateMaizeFoodPriceChart(district);
		generateFoodPriceRice(district);
		generateFoodPriceCassava(district);
		generateFoodPriceBeans(district);

	}

	function setBasemap(basemap) {
		if (layer) {
			map.removeLayer(layer);
		}

		layer = L.esri.basemapLayer(basemap);

		map.addLayer(layer);

		if (layerLabels) {
			map.removeLayer(layerLabels);
		}

		if (basemap === 'ShadedRelief'
		 || basemap === 'Oceans'
		 || basemap === 'Gray'
		 || basemap === 'DarkGray'
		 || basemap === 'Imagery'
		 || basemap === 'Terrain'
	 ) {
			layerLabels = L.esri.basemapLayer(basemap + 'Labels');
			map.addLayer(layerLabels);
		}
	}

	function changeBasemap(basemap){
		setBasemap(basemap);
	}


	function sortTypeChange(){
		map.removeLayer(current_district_data);
		map.removeLayer(mapRegionBoundary);
		map.removeLayer(mapDistrictBoundary);
		if (selectType == "Region"){
			 map.addLayer(mapRegionBoundary);
			 setRegionsItems()
		}else if (selectType == "District") {
			map.addLayer(mapDistrictBoundary);
			// monthStateChange(current_month);
			setDistrictsItems()
		}
		monthStateChange(current_month);
		current_district_data.addTo(map);
		// map.addLayer

	}

	function initMap(){
		map = L.map('map',{
			fullscreenControl: true,
			// OR
			fullscreenControl: {
					pseudoFullscreen: false // if true, fullscreen to page width and height
			}
		}).setView([-6.489983, 35.859375], 6);
		layer = L.esri.basemapLayer('Topographic').addTo(map);
		// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	  //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		// }).addTo(map);
		map.on('fullscreenchange', function () {
			if (map.isFullscreen()) {
			    console.log('entered fullscreen');
			} else {
			    console.log('exited fullscreen');
			}
		});

		// current_district_data.addTo(map);

		mapDistrictBoundary.addTo(map);
		// mapRegionBoundary.addTo(map);
		addGeoJSON("data/districts.geojson",mapDistrictBoundary);
		addGeoJSON("data/regions.geojson",mapRegionBoundary);
		addGeoJSON("data/in_season_assessment.geojson",in_season_assessment);
		addGeoJSON("data/in_season_assessment.geojson",current_district_data);

	}

	function init(){
		$(".dropdown-button").dropdown();
		resetMasterialSelect();
		var siteObject = {
			url:appConfig.baseURL,
			token:appConfig.token
		}
		onaClient = new OnaClient(siteObject);

		$('.dropdown-button').dropdown({
			inDuration: 300,
			outDuration: 225,
			constrain_width: false,
			hover: true,
			gutter: 10,
			belowOrigin: true,
			alignment: 'right'
		});

		$("#basemaps").change(function(){
			changeBasemap(this.value);
		});

		$("#type").change(function(){
			selectType = this.value;
			sortTypeChange()
		});

		initMap();
		setMonths();
		setDistrictsItems();
		loadCharts("*");

		$('#month').change();
		stopSplashScreen();
		// $('#mount').children().last()
		// current_district_data.addTo(map);

	}

	$(document).ready(function() {
		init();
	});

});
