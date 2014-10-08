'use strict';

/**
 * @ngdoc function
 * @name angularTimesheetApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the angularTimesheetApp
 */
angular.module('angularTimesheetApp')
  .controller('MainCtrl', function ($scope, $interval) {
  	var mindate = new Date();
  	var maxdate = new Date();
  	
  	maxdate.setSeconds(mindate.getSeconds() + 5*60);

  	$scope.timesheetData = {
  		mindate: new Date('2002'),
  		maxdate: new Date('2012'),
  		incrementType: 'years',
  	// console.log(mindate);
  	// console.log(maxdate);

  	$scope.timesheetData = {
  		mindate: mindate,
  		maxdate: maxdate,
  		incrementType: 'seconds',
  		incrementSize: 1,
  		incrementsInView: 4,
  		datas: [
  			// { startdate: mindate, enddate: new Date() }
  			{ startdate: new Date('02-19-2004') , enddate: new Date('02-19-2005') },
  			{ startdate: new Date('02-19-2005') , enddate: new Date('02-19-2009') },
  			{ startdate: new Date('02-19-2008') , enddate: new Date('02-19-2010') }
  		]
  	};

  	$scope.addNew = function() {
  		$scope.timesheetData.datas.push({ startdate: '07/2002' , enddate: '2004' });
  	};

  	$scope.change = function() {
  		var t = $scope.timesheetData.datas[0].enddate;

  		console.log('in change');

  		$interval(function() {
	  		t.setMilliseconds(t.getMilliseconds() + 100);
  		}, 100);

  		// $interval(function() {
	  	// 	t.setSeconds(t.getSeconds() + 1);
  		// }, 1000);
  	};
  });
