(function () {

    "use strict";

    angular
        .module('sc-alert', [])
        .provider('scAlert', function () {
            var config = {
                parent: 'body',
                html: false,
                dismissible: true,
                timeout: 5000,
                // Element attach method:angular 'append' or 'prepend'
                method: 'prepend'
            };
            var titles = {
                success: "Success",
                danger: "Danger",
                info: "Info",
                warning: "Warning"
            };
            this.setConfig = function (new_config) {
                config = angular.extend(config, new_config);
            };
            this.setTitles = function (new_titles) {
                titles = angular.extend(titles, new_titles);
            };
            this.$get = function() {
                return {
                    config: config,
                    titles: titles
                };
            };
        })
        .run(['$templateCache', function ($templateCache) {
            if ($templateCache.get('templates/scAlert/alert.html') === undefined) {
                $templateCache.put("templates/scAlert/alert.html",
                    '<div ng-if="!destroy" ng-class="classes">' +
                        '<div ng-if="params.dismissible" type="button" class="close" aria-label="Close">' +
                            '<span aria-hidden="true" ng-click="close()">&times;</span>' +
                        '</div>' +
                        '<strong ng-bind="title"></strong> ' +
                        '<span ng-if="params.html" ng-bind-html="text"></span>' +
                        '<span ng-if="!params.html" ng-bind="text"></span>' +
                    '</div>'
                );
            }
        }])
        .directive('scAlert', function ($sce, $timeout, scAlertService, scAlert) {
            return {
                restrict: 'E',
                templateUrl: "templates/scAlert/alert.html",
                scope: { config: "@", type: "@", content: "=" },
                link: function (scope, element, attributes) {
                    scope.destroy = false;
                    scope.title = scope.title || scAlert.titles[scope.type];
                    scope.params = scAlertService.mergeConfig(scope.$eval(scope.config));
                    scope.text = scope.params.html ? $sce.trustAsHtml(scope.content) : scope.content;
                    scope.classes = angular.extend(scAlertService.alertClasses(scope.type), scope.params.classes);
                    scope.close = function () {
                        scope.$destroy();
                        element.remove();
                    };
                    if (scope.params.timeout) {
                        $timeout(scope.close, scope.params.timeout);
                    }

                }
            };
        })
        .service('scAlertService', function($templateCache, $compile, $document, scAlert) {
            var self = this;
            self.template = '<sc-alert type="{{type}}" config="{{config}}" content="content" title="title"></sc-alert>';
            self.alert = function(type, content, title, user_config) {
                var scope = this.$new(true);
                scope.type = type;
                scope.title = title;
                scope.content = content;
                scope.config = self.mergeConfig(user_config);
                scope.alert = $compile(self.template)(scope);
                getParent(scope.config.parent)[scope.config.method](scope.alert);
            };
            self.success = function (content, caption, user_config) { self.alert('success', content, caption, user_config) };
            self.danger = function (content, caption, user_config) { self.alert('danger', content, caption, user_config) };
            self.info = function (content, caption, user_config) { self.alert('info', content, caption, user_config) };
            self.warning = function (content, caption, user_config) { self.alert('warning', content, caption, user_config) };
            self.mergeConfig = function(new_config) {
                return angular.extend({}, scAlert.config, new_config);
            };
            self.alertClasses = function (type) {
                return {
                    'alert': true,
                    'alert-success': type === "success",
                    'alert-danger': type === "danger",
                    'alert-info': type === "info",
                    'alert-warning': type === "warning"
                };
            };

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
        });

})();