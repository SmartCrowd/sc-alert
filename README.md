# sc-alert
Bootstrap alert generator directive for angularjs

# Installation
Include `sc-alert.js` file and load 'sc-alert' module to your angular app
```
angular.module('app', ['sc-alert'])
```

#Usage
As a Directive
```
<sc-alert type="info" content="Info message" config="{timeout: 0}"></sc-alert>
```
As a Service
```
.controller('myController', function(scAlertService) {
    // Main method
    scAlertService.alert("success", "Success message", "Success title");

    // Shorthand methods 'success', 'danger', 'info', 'warning'
    scAlertService.success("Success message");
    scAlertService.danger("Danger message", "Custom title");
    ...
});
```

#Configure
Default configs
```
titles = {
    success: "Success",
    danger: "Danger",
    info: "Info",
    warning: "Warning"
}

config = {
    // Directive config
    show_title: true,
    allow_html: false,
    dismissible: true,
    timeout: 5000,

    // Service config
    parent: 'body',
    method: 'append'
}
```
You can change default config's in your app config section through scAlertProvider
```
angular.module('app').config(function (scAlertProvider) {
    scAlertProvider.setConfig({
        parent: "#errors",
        timeout: 0,
        classes: {
            animated: true,
            fadeIn: true
        }
        ...
    });

    scAlertProvider.setTitles({
        danger: "Error!",
        ...
    });
})
```
Or you always can change some options right in service methods
```
scAlertService.alert("success", "Success message", "Success title", {dismissible: false});
scAlertService.success("Success message", "Success title", {dismissible: false});
```