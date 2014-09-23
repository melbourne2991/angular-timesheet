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

var TimesheetAngular = function(container, min, max, data) {
    this.data = [];
    this.year = {
      min: min,
      max: max
    };

    if (typeof document !== 'undefined') {
      this.container = (typeof container === 'string') ? document.querySelector('#'+container) : container;
    }
}

// Angular Sub Class
TimesheetAngular.prototype = Object.create(Timesheet.prototype);
TimesheetAngular.prototype.constructor = TimesheetAngular;

Timesheet.prototype.parse = function(data) {
  var beg = this.parseDate(data[0]);
  var end = data.length === 4 ? this.parseDate(data[1]) : null;
  var lbl = data.length === 4 ? data[2] : data[1];
  var cat = data[3] || 'default';

  if (beg.getFullYear() < this.year.min) {
    this.year.min = beg.getFullYear();
  }

  if (end && end.getFullYear() > this.year.max) {
    this.year.max = end.getFullYear();
  } else if (beg.getFullYear() > this.year.max) {
    this.year.max = beg.getFullYear();
  }

  return {start: beg, end: end, label: lbl, type: cat};
};

/**
 * @ngdoc directive
 * @name angularTimesheetApp.directive:timesheet
 * @description
 * # timesheet
 */
angular.module('angularTimesheetApp')
  .directive('timesheet', function ($rootScope) {
    return {
    	template: '<div></div>',
      replace: true,
    	transclude: true,
    	scope: {
    		mindate: '@',
    		maxdate: '@'
    	},
      restrict: 'E',
      compile: function compile(tElement, tAttrs) {
      	return {
      		post: function postLink(scope, element, attrs, ctrl, transcludeFn) {
            var timesheet = ctrl.getTimesheet();
            timesheet.drawSections();

            element.append('<ul class="data"></ul>');

            var ul = element.find('ul');

            transcludeFn(scope.$parent, function(cloned) {
              ul.append(cloned);
            });
		      }
      	}
      },
      controller: function($scope, $element) {
        var timesheet = new TimesheetAngular($element[0], $scope.mindate, $scope.maxdate, []);

        return {
          getTimesheet: function() {
            return timesheet;
          }
        }
      },
    };
  })
  .directive('timesheetBubble', function ($timeout) {
    return {
    	scope: {
    		startdate: '=',
    		enddate: '='
    	},
    	require: '^timesheet',
      restrict: 'E',  
      replace: true,
      transclude: true,
      template: '<li></li>',
      compile: function compile(tElement, tAttrs, transclude) {
        return {
          post: function(scope, element, attrs, ctrl, transcludeFn) {
            var timesheet   = ctrl.getTimesheet(),
                widthMonth  = timesheet.container.querySelector('.scale section').offsetWidth,
                mindate     = timesheet.year.min;

            transcludeFn(scope, function(clone) {
              var reEvaluate = function() {
                var curargs = [scope.startdate, scope.enddate, angular.element(clone).text(), ''],
                    cur     = timesheet.parse(curargs),
                    bubble  = new TimesheetBubble(widthMonth, mindate, cur.start, cur.end);

                var line = [
                  '<span style="margin-left: ' + bubble.getStartOffset() + 'px; width: ' + bubble.getWidth() + 'px;" class="bubble bubble-' + (cur.type || 'default') + '" data-duration="' + (cur.end ? Math.round((cur.end-cur.start)/1000/60/60/24/39) : '') + '"></span>',
                  '<span class="date">' + bubble.getDateLabel() + '</span> ',
                  '<span class="label">' + cur.label + '</span>'
                ].join('');

                return {
                  start_offset: bubble.getStartOffset(),
                  width: bubble.getWidth(),
                  date_label: bubble.getDateLabel(),
                  label: cur.label,
                  duration: (cur.end ? Math.round((cur.end-cur.start)/1000/60/60/24/39) : ''),
                  type: (cur.type || 'default')
                }      
              };

              var checkEval = function(draw_data) {
                var bubbleEl = angular.element(timesheet.container.querySelector('.bubble'));



                if(draw_data_current.start_offset !== draw_data.start_offset) {
                  console.log('start_offset changed');
                }

                if(draw_data_current.width !== draw_data.width) {
                  console.log('width changed');

                  bubbleEl.css({
                    width: draw_data.width + 'px'
                  });
                }

                if(draw_data_current.date_label !== draw_data.date_label) {
                  console.log('date_label changed');
                }

                if(draw_data_current.label !== draw_data.label) {
                  console.log('label changed');
                }

                if(draw_data_current.duration !== draw_data.duration) {
                  console.log('duration changed');

                  bubbleEl.data('duration', draw_data.duration);
                }

                if(draw_data_current.type !== draw_data.type) {
                  conosle.log('type changed');
                }
              };

              var draw_data_current = reEvaluate();

              var line = [
                    '<span style="margin-left: ' + draw_data_current.start_offset + 'px; width: ' + draw_data_current.width + 'px;" class="bubble bubble-' + draw_data_current.type + '" data-duration="' + draw_data_current.duration + '"></span>',
                    '<span class="date">' + draw_data_current.date_label + '</span> ',
                    '<span class="label">' + draw_data_current.label + '</span>'
                  ].join('');

              element.html(line);   

              scope.$watch('startdate', function(n, o) {
                if(n && n !== o) {
                  var draw_data = reEvaluate();
                  checkEval(draw_data);
                }
              });

              scope.$watch('enddate', function(n, o) {
                if(n && n !== o) {
                  var draw_data = reEvaluate();
                  checkEval(draw_data);
                }
              });
            });
          }
        }
      }
    };
  });


// var bubbles = element.find('timesheet-bubble');

// angular.forEach(bubbles, function(bubble, i) {
//  var bubble      = angular.element(bubble);
//  var startdate   = bubble.attr('startdate');
//  var enddate     = bubble.attr('enddate');
//  var content     = bubble.text();
//  var bubbleData  = [startdate, enddate, content, ''];

//  scope.bubbleDatas.push(bubbleData);
// });

// var timesheet = new Timesheet(element[0], scope.mindate, scope.maxdate, scope.bubbleDatas);
// element.css({display: 'block'});

// <div style="font-size:16px
//             "><span style="font-size:22px">Please note:</span>

// Dongwha is a wholesale manufacturer only and does not deal directly with 
//   the public or retail sector</div>
