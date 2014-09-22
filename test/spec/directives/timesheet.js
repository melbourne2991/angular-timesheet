'use strict';

describe('Directive: timesheet', function () {

  // load the directive's module
  beforeEach(module('angularTimesheetApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<timesheet></timesheet>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the timesheet directive');
  }));
});
