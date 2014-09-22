(function() {
  'use strict';

  /**
   * Timesheet Bubble
   */
  var Bubble = function(wMonth, min, start, end) {
    this.min = min;
    this.start = start;
    this.end = end;
    this.widthMonth = wMonth;
  };

  /**
   * Format month number
   */
  Bubble.prototype.formatMonth = function(num) {
    num = parseInt(num, 10);

    return num >= 10 ? num : '0' + num;
  };

  /**
   * Calculate starting offset for bubble
   */
  Bubble.prototype.getStartOffset = function() {
    return (this.widthMonth/12) * (12 * (this.start.getFullYear() - this.min) + this.start.getMonth());
  };

  /**
   * Get count of full years from start to end
   */
  Bubble.prototype.getFullYears = function() {
    return ((this.end && this.end.getFullYear()) || this.start.getFullYear()) - this.start.getFullYear();
  };

  /**
   * Get count of all months in Timesheet Bubble
   */
  Bubble.prototype.getMonths = function() {
    var fullYears = this.getFullYears();
    var months = 0;

    if (!this.end) {
      months += !this.start.hasMonth ? 12 : 1;
    } else {
      if (!this.end.hasMonth) {
        months += 12 - (this.start.hasMonth ? this.start.getMonth() : 0);
        months += 12 * (fullYears-1 > 0 ? fullYears-1 : 0);
      } else {
        months += this.end.getMonth() + 1;
        months += 12 - (this.start.hasMonth ? this.start.getMonth() : 0);
        months += 12 * (fullYears-1);
      }
    }

    return months;
  };

  /**
   * Get bubble's width in pixel
   */
  Bubble.prototype.getWidth = function() {
    return (this.widthMonth/12) * this.getMonths();
  };

  /**
   * Get the bubble's label
   */
  Bubble.prototype.getDateLabel = function() {
    return [
      (this.start.hasMonth ? this.formatMonth(this.start.getMonth() + 1) + '/' : '' ) + this.start.getFullYear(),
      (this.end ? '-' + ((this.end.hasMonth ? this.formatMonth(this.end.getMonth() + 1) + '/' : '' ) + this.end.getFullYear()) : '')
    ].join('');
  };

  window.TimesheetBubble = Bubble;
})();

/* global TimesheetBubble */

(function() {
  'use strict';

  /**
   * Initialize a Timesheet
   */
  var Timesheet = function(container, min, max, data) {
    this.data = [];
    this.year = {
      min: min,
      max: max
    };

    this.parse(data || []);

    if (typeof document !== 'undefined') {
      this.container = (typeof container === 'string') ? document.querySelector('#'+container) : container;
      // this.drawSections();
      // this.insertData();
    }
  };

  /**
   * Insert data into Timesheet
   */
  Timesheet.prototype.insertData = function() {
    var html = [];
    var widthMonth = this.container.querySelector('.scale section').offsetWidth;

    for (var n = 0, m = this.data.length; n < m; n++) {
      var cur = this.data[n];
      var bubble = new TimesheetBubble(widthMonth, this.year.min, cur.start, cur.end);

      var line = [
        '<span style="margin-left: ' + bubble.getStartOffset() + 'px; width: ' + bubble.getWidth() + 'px;" class="bubble bubble-' + (cur.type || 'default') + '" data-duration="' + (cur.end ? Math.round((cur.end-cur.start)/1000/60/60/24/39) : '') + '"></span>',
        '<span class="date">' + bubble.getDateLabel() + '</span> ',
        '<span class="label">' + cur.label + '</span>'
      ].join('');

      html.push('<li>' + line + '</li>');
    }

    this.container.innerHTML += '<ul class="data">' + html.join('') + '</ul>';
  };

  /**
   * Draw section labels
   */
  Timesheet.prototype.drawSections = function() {
    var html = [];

    for (var c = this.year.min; c <= this.year.max; c++) {
      html.push('<section>' + c + '</section>');
    }

    this.container.className = 'timesheet color-scheme-default';
    this.container.innerHTML = '<div class="scale">' + html.join('') + '</div>';
  };

  /**
   * Parse data string
   */
  Timesheet.prototype.parseDate = function(date) {
    if (date.indexOf('/') === -1) {
      date = new Date(parseInt(date, 10), 0, 1);
      date.hasMonth = false;
    } else {
      date = date.split('/');
      date = new Date(parseInt(date[1], 10), parseInt(date[0], 10)-1, 1);
      date.hasMonth = true;
    }

    return date;
  };

  /**
   * Parse passed data
   */
  Timesheet.prototype.parse = function(data) {
    for (var n = 0, m = data.length; n<m; n++) {
      var beg = this.parseDate(data[n][0]);
      var end = data[n].length === 4 ? this.parseDate(data[n][1]) : null;
      var lbl = data[n].length === 4 ? data[n][2] : data[n][1];
      var cat = data[n][3] || 'default';

      if (beg.getFullYear() < this.year.min) {
        this.year.min = beg.getFullYear();
      }

      if (end && end.getFullYear() > this.year.max) {
        this.year.max = end.getFullYear();
      } else if (beg.getFullYear() > this.year.max) {
        this.year.max = beg.getFullYear();
      }

      this.data.push({start: beg, end: end, label: lbl, type: cat});
    }
  };

  window.Timesheet = Timesheet;
})();


'use strict';

/**
 * @ngdoc directive
 * @name angularTimesheetApp.directive:timesheet
 * @description
 * # timesheet
 */
angular.module('angularTimesheetApp')
  .directive('timesheet', function () {
    return {
    	template: '<div ng-transclude=""></div>',
    	transclude: true,
    	scope: {
    		mindate: '=',
    		maxdate: '='
    	},
      restrict: 'E',
      controller: function($scope, $element) {
      	// $scope.bubbleDatas = [];
      	return {
      		getElementWidth: function() {
      			return $element.width();
      		}
      	}
      },
      compile: function compile(tElement, tAttrs) {
      	return {
      		pre: function preLink(scope, element, attrs, ctrl, transcludeFn) {
      			scope.timesheet = new Timesheet(element[0], scope.mindate, scope.maxdate, []);
      			scope.timesheet.drawSections();

      			transcludeFn(scope, function(cloned) {
      				// console.log(cloned);
      			});
      		},
      		post: function postLink(scope, element) {
		      	// var bubbles = element.find('timesheet-bubble');

		      	// angular.forEach(bubbles, function(bubble, i) {
		      	// 	var bubble 			= angular.element(bubble);
		      	// 	var startdate 	= bubble.attr('startdate');
		      	// 	var enddate 		= bubble.attr('enddate');
		      	// 	var content 		= bubble.text();
		      	// 	var bubbleData 	= [startdate, enddate, content, ''];

		      	// 	scope.bubbleDatas.push(bubbleData);
		      	// });

		      	// var timesheet = new Timesheet(element[0], scope.mindate, scope.maxdate, scope.bubbleDatas);
		      	// element.css({display: 'block'});
		      }
      	}
      }
    };
  })
  .directive('timesheetBubble', function () {
    return {
    	scope: {
    		startdate: '=',
    		enddate: '='
    	},
    	require: '^timesheet',
      template: '<div></div>',
      restrict: 'E',
      compile: function compile(tElement, tAttrs, transclude) {
      	return {
      		pre: function preLink(scope, element, attrs, ctrl) {
      			var widthMonth = ctrl.getElementWidth();
      			scope = new Bubble();
      		},
      		post: function postLink(scope, element) {

      		}
      	}
      }
    };
  });
