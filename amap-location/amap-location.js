module.exports = function (RED) {
    function AMapLocationNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.longitude = config.longitude;
        this.latitude = config.latitude;
    }
    RED.nodes.registerType("amap-location", AMapLocationNode);
}