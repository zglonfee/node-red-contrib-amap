module.exports = function (RED) {
    var axios = require('axios');

    function AMapConvert(config) {
        RED.nodes.createNode(this, config);

        let node = this;

        this.on('input', function (msg, send, done) {
            // src
            var longitude = RED.util.evaluateNodeProperty(config.longitude, config.longitude_type, msg);
            var latitude = RED.util.evaluateNodeProperty(config.latitude, config.latitude_type, msg);
            let lt = typeof longitude;
            if (typeof longitude !== 'number' || typeof latitude !== 'number') {
                node.error(RED._('amap.error.input_error'), msg);
                done();
                return;
            }

            let coordsys = config.coordsys
            let location_str = `${longitude},${latitude}`
            let gaodeKey = RED.nodes.getNode(config.amap_key).amap_key;
            axios({
                method: 'get',
                url: `http://restapi.amap.com/v3/assistant/coordinate/convert?key=${gaodeKey}&locations=${location_str}&coordsys=${coordsys}`
            }).then(function (response) {
                let data = response.data
                if (data.status != 1) {
                    // has some error
                    node.error(RED._('amap.error.request_error') + data.info, msg)
                    done()
                } else {
                    var locations = data.locations.split(';')[0].split(',')
                    if (typeof msg.payload !== 'object') {
                        msg.payload = {}
                    }
                    msg.payload.longitude = locations[0]
                    msg.payload.latitude = locations[1]
                    node.send(msg)
                    done();
                }
            });
        });
    }

    RED.nodes.registerType("amap-convert", AMapConvert);
}