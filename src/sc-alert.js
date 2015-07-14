(function () {

    "use strict";

    angular
        .module('sc-alert', [])
        .provider('scAlert', scAlertProvider)
        .run(templateCache)
        .directive('scAlert', scAlert)
        .service('scAlertService', scAlertService);

    function scAlert($sce, $timeout, scAlertService, scAlert) {
        return {
            restrict: 'E',
            templateUrl: "templates/scAlert/alert.html",
            scope: { config: "@", type: "@", content: "@", title: "@" },
            link: function (scope, element, attributes) {
                scope.destroy = false;
                scope.inner_title = scope.title && (scope.title != "") ? scope.title : scAlert.titles[scope.type];
                scope.params = scAlertService.mergeConfig(scope.$eval(scope.config));
                scope.text = scope.params.allow_html ? $sce.trustAsHtml(scope.content) : scope.content;
                scope.classes = angular.extend(scAlertService.alertClasses(scope.type), scope.params.classes);
                scope.close = function () {
                    scope.$destroy();
                    element.remove();
                };
                if (scope.params.timeout > 0) {
                    $timeout(scope.close, scope.params.timeout);
                }

            }
        };
    }

    function templateCache($templateCache) {
        if ($templateCache.get('templates/scAlert/alert.html') === undefined) {
            $templateCache.put("templates/scAlert/alert.html",
                '<div ng-if="!destroy" ng-class="classes">' +
                '<div ng-if="params.dismissible" type="button" class="close" aria-label="Close">' +
                '<span aria-hidden="true" ng-click="close()">&times;</span>' +
                '</div>' +
                '<strong ng-if="params.show_title" ng-bind="inner_title"></strong> ' +
                '<span ng-if="params.allow_html" ng-bind-html="text"></span>' +
                '<span ng-if="!params.allow_html" ng-bind="text"></span>' +
                '</div>'
            );
        }
    }

    function scAlertService($compile, $interpolate, scAlert) {
        var self = this;
        self.template = '<sc-alert type="{{type}}" config="{{config}}" content="{{content}}" title="{{title}}"></sc-alert>';
        self.alert = function(type, content, title, user_config) {
            var config = self.mergeConfig(user_config);
            var scope = getParent(config.parent).scope();

            var start_symbols = $interpolate.startSymbol();
            var end_symbols = $interpolate.endSymbol();

            scope.type    = type;
            scope.title   = title;
            scope.content = content;
            scope.config  = config;
            self.template = self.template.replace(/\{\{/g, start_symbols);
            self.template = self.template.replace(/\}\}/g, end_symbols);

            scope.alert = $compile(self.template)(scope);
            getParent(scope.config.parent)[scope.config.method](scope.alert);
        };
        self.success = function (content, caption, user_config) { self.alert('success', content, caption, user_config) };
        self.danger  = function (content, caption, user_config) { self.alert('danger',  content, caption, user_config) };
        self.info    = function (content, caption, user_config) { self.alert('info',    content, caption, user_config) };
        self.warning = function (content, caption, user_config) { self.alert('warning', content, caption, user_config) };

        self.getConfig = function () {
            return scAlert.config;
        };

        self.mergeConfig = function(new_config) {
            return angular.extend({}, scAlert.config, new_config);
        };
        self.alertClasses = function (type) {
            return {
                'alert': true,
                'alert-success': type === "success",
                'alert-danger':  type === "danger",
                'alert-info':    type === "info",
                'alert-warning': type === "warning"
            };
        };

        function getParent (selector) {
            switch(selector[0]) {
                case ".":
                    return angular.element(document.getElementsByClassName(selector.substr(1))[0]);
                case "#":
                    return angular.element(document.querySelector(selector));
                default:
                    return angular.element(document.getElementsByTagName(selector)[0]);
            }
        }
    }

    function scAlertProvider() {
        var config = {
            // Directive config
            show_title: true,
            allow_html: false,
            dismissible: true,
            timeout: 5000,
            // Service config
            parent: 'body',
            method: 'append'
        };
        var titles = {
            success: "Success",
            danger: "Danger",
            info: "Info",
            warning: "Warning"
        };
        this.setConfig = function (new_config) {
            return config = angular.extend(config, new_config);
        };
        this.getConfig = function () {
            return config;
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
    }

})();
