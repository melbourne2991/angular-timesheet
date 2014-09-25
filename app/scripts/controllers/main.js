'use strict';

/**
 * @ngdoc function
 * @name angularTimesheetApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularTimesheetApp
 */
angular.module('angularTimesheetApp')
  .controller('MainCtrl', function ($scope) {
  	var mindate = new Date();
  	var maxdate = new Date();
  	
  	maxdate.setSeconds(mindate.getSeconds() + 300);

  	console.log(mindate);
  	console.log(maxdate);

  	$scope.timesheetData = {
  		mindate: mindate,
  		maxdate: maxdate,
  		incrementType: 'minutes',
  		incrementSize: 1,
  		incrementsInView: 10,
  		datas: [
  			{ startdate: mindate, enddate: new Date() }
  			// { startdate: new Date('02-19-2004') , enddate: new Date('02-19-2005') },
  			// { startdate: new Date('02-19-2005') , enddate: new Date('02-19-2009') },
  			// { startdate: new Date('02-19-2008') , enddate: new Date('02-19-2010') }
  		]
  	};

  	$scope.addNew = function() {
  		$scope.timesheetData.datas.push({ startdate: '07/2002' , enddate: '2004' });
  	};

  	$scope.change = function() {
  		var t = $scope.timesheetData.datas[0].enddate;
  		t.setSeconds(t.getSeconds() + 10);

  		console.log($scope.timesheetData.datas[0].enddate);
  	};
  });
