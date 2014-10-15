var vm = new function () {
	// Initialization
	$('.date').datetimepicker({
		pickTime: false,
		language: 'ro',		
	})
	.on("dp.change",function (e) {
		onSetDate(e);   
	});

	$("#openCSVModalBtn").click(function (e) {
		setCSVContent();
		$('#myModal').modal({
			keyboard: false,
			backdrop: 'static',
			show: true
		});

		$('#myModal').modal('show');
	});

	$("#chkAllMonthDesc").change(function() {	    
		if (this.checked) {
			workDescription = $("#workDesc").val();
			$(".input_work_desc").val(workDescription);
		}
		else {
			workDescription = "";
		}

		$("#workDesc").prop('disabled', !this.checked);	    
		$(".input_work_desc").prop('disabled', this.checked);
	});

	var workDescription = "";
	$("#workDesc").keyup(function() {
		workDescription = $(this).val();

		$(".input_work_desc").val(workDescription);
	});

	// <date, work_description> pairs
	var arrWorkDesc = {};
	var totalWorkingDays = 0;

	var dateStartCtrlId = 'dateStart';
	var dateEndCtrlId = 'dateEnd';

	var dateStartCtrl = $('#' + dateStartCtrlId).data("DateTimePicker");	
	var dateEndCtrl = $('#' + dateEndCtrlId).data("DateTimePicker");

	dateStartCtrl.setDate(moment().startOf('month'));
	dateEndCtrl.setDate(moment().endOf('month'));

	function onSetDate(e) {
		if (dateStartCtrl == undefined || dateEndCtrl == undefined) {
			return;
		}

		pickerType = e.target.id;		

		if (pickerType == dateStartCtrlId) {
			dateEndCtrl.setMinDate(e.date);
		} else {
			dateStartCtrl.setMaxDate(e.date);
		}

		totalWorkingDays = getNoOfWorkingDays(dateStartCtrl.getDate(), dateEndCtrl.getDate());
		$("#requiredWorkHours").text(8 * totalWorkingDays);
		generateTable();
	}

	function getNoOfWorkingDays(startDate, endDate) {
		var count = 0;
		var startDate = new moment(startDate);

		while (startDate <= endDate) {
			if (startDate.isoWeekday() !== 6 && startDate.isoWeekday() !== 7) {
				count ++;
			}

			startDate = startDate.add(1, 'days');
		}

		return count;
	}

	function setTotalWorkHours(){
		var sum = 0;
		$(".work_list li").each(function (elem) {
			var kids = $(this).children();
			sum += parseInt($(kids[2]).val());		
		});

		$("#totalWorkHours").text(sum);

		if (sum != 8 * totalWorkingDays) {
			$("#totalWorkHours").attr('class', 'label label-danger');
		} else {
			$("#totalWorkHours").attr('class', 'label label-success');
		}
	}

	function generateTable() {
		var workingDaysCtrl = $('#workingDays');
		workingDaysCtrl.empty();

		var startDate = new moment(dateStartCtrl.getDate());
		var endDate = new moment(dateEndCtrl.getDate());	

		randHours = generateRandomNumbers(totalWorkingDays);
		var idx = 0;

		while (startDate <= endDate) {
			if (startDate.isoWeekday() !== 6 && startDate.isoWeekday() !== 7) {
				currDayStr = startDate.format('L');

				var span = $('<span>').append(currDayStr);

				if (arrWorkDesc[currDayStr] == undefined) {
					console.log('undef'+currDayStr+!$("#chkAllMonthDesc").checked);
					arrWorkDesc[currDayStr] = $('<input type="text" class="form-control input_work_desc" style="width: 700px;display: inline;margin-left: 2px;margin-right: 2px;margin-bottom: 2px;">');
					$(".input_work_desc").prop('disabled', !$("#chkAllMonthDesc").checked);	    
				}		

				var workDesc = arrWorkDesc[currDayStr];
				workDesc.val(workDesc.val() != "" ? workDesc.val() : workDescription);

				var hours = $('<input type="text" class="form-control input_work_hours" style="width: 50px;display: inline;margin-left: 2px;margin-right: 2px;margin-bottom: 2px;">');
				var hoursValue = randHours[idx++];
				hours.keyup(function() { setTotalWorkHours(); });

				hours.val(hoursValue);

				var li = $('<li>');
				li.append(span).append(workDesc).append(hours);
				workingDaysCtrl.append($('<div class="form-inline work_list">').append(li));	
			}

			startDate = startDate.add(1, 'days');	    	
		}

		setTotalWorkHours();
	}

	function setCSVContent() {
		var csvContent = "";

		$(".work_list li").each(function (elem) {
			var kids = $(this).children();
			csvContent += $(kids[0]).text() + ",\"" + $(kids[1]).val() + "\"," + $(kids[2]).val() + "\r\n";
		});

		$("#csvContent").text(csvContent);
	}

	function getRandomNumberInterval(low, high) {
		return low + Math.floor((Math.random() * (high - low)) + 1)
	}

	function generateRandomNumbers(count) {	
		var randNumbers = Array(count);
		var defaultMinWorkHours = 1;
		var defaultMaxWorkHours = 11;

		var sum = 0;

		for (var i = 0; i < count; i++) {
			randNumbers[i] = getRandomNumberInterval(defaultMinWorkHours, defaultMaxWorkHours);

			sum += randNumbers[i];
		}

		console.log(randNumbers);

		remainToDistribute = 8 * count - sum;

		var sign = remainToDistribute > 0 ? 1 : -1;

		while (Math.abs(remainToDistribute) > 0) {
			do {		
				var randNbr = sign * getRandomNumberInterval(defaultMinWorkHours, defaultMaxWorkHours);
	
				// If we went above the remaining then take it all
				if (Math.abs(randNbr) > Math.abs(remainToDistribute)) {
					randNbr = remainToDistribute;
				}

				var sampleIndex =  Math.floor((Math.random() * (count - 1)));
				var sampleValue = randNumbers[sampleIndex];

			} while (sampleValue + randNbr > defaultMaxWorkHours);

			randNumbers[sampleIndex] += randNbr;
			remainToDistribute -= randNbr;
		}

		console.log(randNumbers);

		sum = 0;
		for (var i = 0; i < count; i++) {		
			sum += randNumbers[i];
		}

		return randNumbers;
	}

}