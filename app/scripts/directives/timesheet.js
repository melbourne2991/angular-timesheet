'use strict';

angular.module('angularTimesheetApp')
  .factory('TimesheetBubble', function() {
    var Bubble = function(wMonth, min, start, end) {
      this.min = min;
      this.start = start;
      this.end = end;
      this.widthMonth = wMonth;
    };

    Bubble.prototype.formatMonth = function(num) {
      num = parseInt(num, 10);

      return num >= 10 ? num : '0' + num;
    };

    Bubble.prototype.getStartOffset = function() {
      return (this.widthMonth/12) * (12 * (this.start.getFullYear() - this.min) + this.start.getMonth());
    };

    Bubble.prototype.getFullYears = function() {
      return ((this.end && this.end.getFullYear()) || this.start.getFullYear()) - this.start.getFullYear();
    };

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

    Bubble.prototype.getWidth = function() {
      return (this.widthMonth/12) * this.getMonths();
    };

    Bubble.prototype.getDateLabel = function() {
      return [
        (this.start.hasMonth ? this.formatMonth(this.start.getMonth() + 1) + '/' : '' ) + this.start.getFullYear(),
        (this.end ? '-' + ((this.end.hasMonth ? this.formatMonth(this.end.getMonth() + 1) + '/' : '' ) + this.end.getFullYear()) : '')
      ].join('');
    };

    return Bubble;
  })
  .factory('Timesheet', function() {
    var Timesheet = function(container, min, max, incrementType, incrementSize, incrementTotal, incrementsInView) {
        this.range = {
          min: min,
          max: max,
        };

        this.increment = {
          type: incrementType,
          size: incrementSize,
          total: incrementTotal,
          inView: incrementsInView
        };

        if (typeof document !== 'undefined') {
          this.container = (typeof container === 'string') ? document.querySelector('#'+container) : container;
        }
    };

    Timesheet.prototype.parseDate = function(date) {
      // if (date.indexOf('/') === -1) {
      //   date = new Date(parseInt(date, 10), 0, 1);
      //   date.hasMonth = false;
      // } else {
      //   date = date.split('/');
      //   date = new Date(parseInt(date[1], 10), parseInt(date[0], 10)-1, 1);
      //   date.hasMonth = true;
      // }

      // return date;
    };

    Timesheet.prototype.parse = function(startdate, enddate, label, type) {
      var dateRange = enddate - startdate;

      // date range/total range

      // var beg = this.parseDate(data[0]);
      // var end = data.length === 4 ? this.parseDate(data[1]) : null;
      // var lbl = data.length === 4 ? data[2] : data[1];
      // var cat = data[3] || 'default';

      // if (beg.getFullYear() < this.year.min) {
      //   this.year.min = beg.getFullYear();
      // }

      // if (end && end.getFullYear() > this.year.max) {
      //   this.year.max = end.getFullYear();
      // } else if (beg.getFullYear() > this.year.max) {
      //   this.year.max = beg.getFullYear();
      // }

      // return {start: beg, end: end, label: lbl, type: cat};
    };

    return Timesheet;
  })
  .directive('timesheet', function (Timesheet) {
    return {
    	template: '<div></div>',
      replace: true,
    	transclude: true,
    	scope: {
    		mindate: '=',
    		maxdate: '=',
        incrementType: '=',
        incrementSize: '=',
        incrementTotal: '=',
        incrementInView: '='
    	},
      restrict: 'E',
      compile: function compile(tElement, tAttrs) {
      	return {
      		post: function postLink(scope, element, attrs, ctrl, transcludeFn) {
            var timesheet = ctrl.getTimesheet();
            var html = [];

            var sectionWidth = element[0].offsetWidth / scope.incrementTotal;

            console.log(sectionWidth);

            for (var c = 0; c < scope.incrementTotal; c++) {
              html.push('<section style="width:' + sectionWidth + 'px">' + c + '</section>');
            }

            console.log(scope);

            element.addClass('timesheet color-scheme-default');
            element.html('<div class="scale">' + html.join('') + '</div>');
            element.append('<ul class="data"></ul>');

            // Pass parent scope in so ng-repeat and others will work as expected.
            transcludeFn(scope.$parent, function(cloned) {
              angular.element(element[0].querySelector('ul.data')).append(cloned);
            });
		      }
      	};
      },
      controller: function($scope, $element) {
        var timesheet = new Timesheet(
              $element[0], 
              $scope.mindate, 
              $scope.maxdate, 
              $scope.incrementType,
              $scope.incrementSize,
              $scope.incrementsInView 
            );

        return {
          getTimesheet: function() {
            return timesheet;
          }
        };
      },
    };
  })
  .directive('timesheetBubble', function (TimesheetBubble) {
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
                var cur     = timesheet.parse(scope.startdate, scope.enddate, angular.element(clone).text(), ''),
                    bubble  = new TimesheetBubble(widthMonth, mindate, cur.start, cur.end);

                return {
                  startOffset: bubble.getStartOffset(),
                  width: bubble.getWidth(),
                  dateLabel: bubble.getDateLabel(),
                  label: cur.label,
                  duration: (cur.end ? Math.round((cur.end-cur.start)/1000/60/60/24/39) : ''),
                  type: (cur.type || 'default')
                };   
              };

              var checkEval = function(drawData) {
                var bubbleEl = angular.element(timesheet.container.querySelector('.bubble')),
                    dateEl   = angular.element(timesheet.container.querySelector('.date')),
                    labelEl  = angular.element(timesheet.container.querySelector('.label'));

                if(drawDataCurrent.startOffset !== drawData.startOffset) {
                  bubbleEl.css({
                    marginLeft: drawData.startOffset + 'px'
                  });
                }

                if(drawDataCurrent.width !== drawData.width) {
                  bubbleEl.css({
                    width: drawData.width + 'px'
                  });
                }

                if(drawDataCurrent.dateLabel !== drawData.dateLabel) {
                  dateEl.text(drawData.dateLabel);
                }

                if(drawDataCurrent.label !== drawData.label) {
                  labelEl.text(drawData.label);
                }

                if(drawDataCurrent.duration !== drawData.duration) {
                  bubbleEl.data('duration', drawData.duration);
                }

                if(drawDataCurrent.type !== drawData.type) {
                  bubbleEl.removeClass('.bubble-' + drawDataCurrent.type);
                  bubbleEl.addClass('.bubble-' + drawData.type);
                }

                drawDataCurrent = drawData;
              };

              var drawDataCurrent = reEvaluate(),
                  line = [
                    '<span style="margin-left: ' + drawDataCurrent.startOffset + 'px; width: ' + drawDataCurrent.width + 'px;" class="bubble bubble-' + drawDataCurrent.type + '" data-duration="' + drawDataCurrent.duration + '"></span>',
                    '<span class="date">' + drawDataCurrent.dateLabel + '</span> ',
                    '<span class="label">' + drawDataCurrent.label + '</span>'
                  ].join('');

              element.html(line);   

              scope.$watch('startdate', function(n, o) {
                if(n && n !== o) {
                  var reVal = reEvaluate();
                  console.log(reVal);
                  checkEval(reVal);
                }
              });

              scope.$watch('enddate', function(n, o) {
                if(n && n !== o) {
                  var reVal = reEvaluate();
                  console.log(reVal);
                  checkEval(reVal);
                }
              });
            });
          }
        };
      }
    };
  });
