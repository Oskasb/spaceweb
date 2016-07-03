ServerAttachmentPoint = function(ap, conf, gameConfigs) {
    var module = {};

    var config = gameConfigs.MODULE_DATA[ap.module];

    for (var key in config) {
        module[key] = config[key];
    }

    for (key in ap) {
        module[key] = ap[key];
    }

    conf.modules.push(module);
};

ServerAttachmentPoint.prototype.attachModuleToAttachmentPoint = function(serverModule) {

    
};

ServerAttachmentPoint.prototype.setApplyCallback = function(callback) {

};



ServerAttachmentPoint.prototype.getAttachmentModuleState = function() {

};


