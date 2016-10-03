var validator = {
    set: function (obj, prop, valeur) {
        console.log(obj, prop, valeur);
    }
};
var TestProxy = (function () {
    function TestProxy() {
        var proxy = new Proxy(this, validator);
    }
    return TestProxy;
}());
