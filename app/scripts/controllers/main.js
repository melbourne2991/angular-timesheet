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
  		mindate: '2002',
  		maxdate: '2013',
  		datas: [
  			{ startdate: '06/2002' , enddate: '2008' },
  			{ startdate: '06/2008' , enddate: '2011' },
  			{ startdate: '07/2008' , enddate: '2004' },
  			{ startdate: '06/2002' , enddate: '2004' }
  		]
  	}


  });
