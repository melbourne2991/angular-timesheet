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
  	$scope.timesheetData = {
  		mindate: new Date('2000'),
  		maxdate: new Date('2028'),
  		incrementType: 'years',
  		incrementSize: 1,
  		incrementsInView: 6,
  		datas: [
  			{ startdate: new Date('02-19-2002'), enddate: new Date('02-19-2006') },
  			{ startdate: new Date('02-19-2004') , enddate: new Date('02-19-2005') },
  			{ startdate: new Date('02-19-2005') , enddate: new Date('02-19-2009') },
  			{ startdate: new Date('02-19-2008') , enddate: new Date('02-19-2010') }
  		]
  	};

  	$scope.addNew = function() {
  		$scope.timesheetData.datas.push({ startdate: '07/2002' , enddate: '2004' });
  	};
  });
