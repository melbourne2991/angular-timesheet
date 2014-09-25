'use strict';

angular.module('angularTimesheetApp')
  .factory('TimesheetBubble', function() {
    var Bubble = function(timesheet, startDate, endDate, label) {
      this.timesheet  = timesheet || '';
      this.startDate  = startDate || '';
      this.endDate    = endDate   || '';
      this.label      = label     || ''; 
    };

    Bubble.prototype.init = function(startDate, endDate, label) {
      if(startDate  !== this.startDate)  this.startDate  = startDate;
      if(endDate    !== this.endDate)    this.endDate    = endDate;
      if(label      !== this.label)      this.label      = label;

      return {
        width: this.getWidth(),
        startOffset: this.getOffset(),
        label: this.label,
        dateLabel: '',
        type: 'default'
      };
    };

    Bubble.prototype.getDiff = function() {
      return this.endDate - this.startDate;
    };

    Bubble.prototype.getWidth = function() {
      return this.timesheet.container.offsetWidth*(this.getDiff() / this.timesheet.getDiff());
    };

    Bubble.prototype.getOffset = function() {
      return this.timesheet.container.offsetWidth*((this.startDate - this.timesheet.min) / this.timesheet.getDiff());
    };

    return Bubble;
  })
  .factory('Timesheet', function() {
    var Timesheet = function(container, min, max) {
        this.min = min;
        this.max = max

        if (typeof document !== 'undefined') {
          this.container = container;
        }
    };

    Timesheet.prototype.getDiff = function() {
      return this.max - this.min;
    };

    Timesheet.prototype.setSectionWidth = function(incrementTotal) {
      console.log(incrementTotal);
      return this.sectionWidth = this.container.offsetWidth / incrementTotal;
    };

    Timesheet.prototype.getSectionWidth = function() {
      if(!this.sectionWidth) throw new Error('Section width has not been set');
      return this.sectionWidth;
    }

    Timesheet.prototype.newIncrement = function(incrementType, incrementSize) {
      if(!incrementSize) incrementSize = 1;

      var typeCount, 
          range = this.getDiff();

      if(incrementType === 'years') {
        typeCount = Math.ceil(moment.duration(range).asYears());
      }

      if(incrementType === 'months') {
        typeCount = Math.ceil(moment.duration(range).asMonths());
      }

      if(incrementType === 'days') {
        typeCount = Math.ceil(moment.duration(range).asDays());
      }

      if(incrementType === 'hours') {
        typeCount = Math.ceil(moment.duration(range).asHours());
      }

      if(incrementType === 'minutes') {
        typeCount = Math.ceil(moment.duration(range).asMinutes());
      }

      if(incrementType === 'seconds') {
        typeCount = Math.ceil(moment.duration(range).asSeconds());
      }

      if(incrementType === 'miliseconds') {
        typeCount = Math.ceil(moment.duration(range).asMiliseconds());
      }

      return typeCount / incrementSize
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
        incrementInView: '='
    	},
      restrict: 'E',
      compile: function compile(tElement, tAttrs) {
      	return {
      		post: function postLink(scope, element, attrs, ctrl, transcludeFn) {
            var timesheet       = ctrl.getTimesheet();
            var incrementTotal  = timesheet.newIncrement(scope.incrementType, scope.incrementSize);

            // Class may change width so add it before calculating.
            element.addClass('timesheet color-scheme-default');

            var sectionWidth = timesheet.setSectionWidth(incrementTotal);

            var html = [];

            for(var i = 1; i < incrementTotal; i++) {
              console.log('in');
              html.push('<section style="width:' + sectionWidth + 'px; box-sizing: border-box"></section>');
            }

            // Add the scale
            element.html('<div class="scale">' + html.join('') + '</div>');

            // Add the data container
            element.append('<ul class="data"></ul>');

            // Pass parent scope in so ng-repeat and others will work as expected.
            transcludeFn(scope.$parent, function(cloned) {
              angular.element(element[0].querySelector('ul.data')).append(cloned);
            });
		      }
      	};
      },
      controller: function($scope, $element) {
        var timesheet = new Timesheet($element[0], $scope.mindate, $scope.maxdate);

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
            var timesheet   = ctrl.getTimesheet();

            transcludeFn(scope, function(clone) {
              var reEvaluate = function() {
                var bubble        = new TimesheetBubble(timesheet),
                    parsedBubble  = bubble.init(scope.startdate, scope.enddate, clone.text());

                return parsedBubble;
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
