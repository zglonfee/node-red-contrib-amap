module.exports = function (RED) {
    function AMapKeyNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.amap_key = config.amap_key;
    }
    RED.nodes.registerType("amap-key", AMapKeyNode);
}