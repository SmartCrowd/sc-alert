(function () {

    "use strict";

    angular
        .module('sc-alert', [])
        .constant('config', {
            parent: 'body',
            html: false,
            dismissible: true,
            timeout: 5000,
            // Element attach method:angular 'append' or 'prepend'
            method: 'prepend'
        })
        .run(['$templateCache', function ($templateCache) {
            if ($templateCache.get('templates/scAlert/alert.html') === undefined) {
                $templateCache.put("templates/scAlert/alert.html",
                    '<div ng-if="!destroy" ng-class="classes">' +
                        '<div ng-if="config.dismissible" type="button" class="close" aria-label="Close">' +
                            '<span aria-hidden="true" ng-click="close()">&times;</span>' +
                        '</div>' +
                        '<strong ng-bind="title"></strong> ' +
                        '<span ng-if="config.html" ng-bind-html="content"></span>' +
                        '<span ng-if="!config.html" ng-bind="content"></span>' +
                    '</div>'
                );
            }
        }])
        .service('scAlert', function($templateCache, $compile, $document, $timeout, $sce, config) {
            var self = this;
            self.template = $templateCache.get('templates/scAlert/alert.html');

            self.alert = function(type, content, title, user_config) {
                var scope = this.$new(true);
                scope.config = mergeConfig(user_config);
                scope.classes = angular.extend(alertClasses(type), scope.config.classes);
                scope.title = title || type.charAt(0).toUpperCase() + type.slice(1);
                scope.content = scope.config.html ? $sce.trustAsHtml(content) : content;
                scope.close = function () {
                    scope.destroy = true;
                };
                if (scope.config.timeout) {
                    $timeout(scope.close, scope.config.timeout);
                }
                scope.alert = $compile(self.template)(scope);
                getParent(scope.config.parent)[scope.config.method](scope.alert);
            };

            self.success = function (content, caption, user_config) { self.alert('success', content, caption, user_config) };
            self.danger = function (content, caption, user_config) { self.alert('danger', content, caption, user_config) };
            self.info = function (content, caption, user_config) { self.alert('info', content, caption, user_config) };
            self.warning = function (content, caption, user_config) { self.alert('warning', content, caption, user_config) };

            function mergeConfig (new_config) {
                return angular.extend({}, config, new_config);
            }
            function getParent (selector) {
                switch(selector[0]) {
                    case ".":
                        return angular.element(elem.querySelector(selector));
                    case "#":
                        return angular.element(document.querySelector(selector));
                    default:
                        return angular.element(document.getElementsByTagName(selector)[0]);
                }
            }
            function alertClasses (type) {
                return {
                    'alert': true,
                    'alert-success': type === "success",
                    'alert-danger': type === "danger",
                    'alert-info': type === "info",
                    'alert-warning': type === "warning"
                };
            }
        });

})();