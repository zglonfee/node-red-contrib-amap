module.exports = function (RED) {
    var axios = require('axios');

    function AMapDistance(config) {
        RED.nodes.createNode(this, config);

        let node = this;

        this.on('input', function (msg, send, done) {
            // src
            var src_longitude = RED.util.evaluateNodeProperty(config.src_dyn_longitude, config.src_dyn_longitude_type, node, msg);
            var src_latitude = RED.util.evaluateNodeProperty(config.src_dyn_latitude, config.src_dyn_latitude_type, node, msg);
            if(config.src_type === 'static'){
                var src_cfg = RED.nodes.getNode(config.src_cfg)
                src_longitude = src_cfg.longitude;
                src_latitude = src_cfg.latitude;
            }
            var src_location_str = `${src_longitude},${src_latitude}`

            // dest
            var dest_longitude = RED.util.evaluateNodeProperty(config.dest_dyn_longitude, config.dest_dyn_longitude_type, node, msg);
            var dest_latitude = RED.util.evaluateNodeProperty(config.dest_dyn_latitude, config.dest_dyn_latitude_type, node, msg);
            if(config.dest_type === 'static'){
                var dest_cfg = RED.nodes.getNode(config.dest_cfg)
                dest_longitude = dest_cfg.longitude;
                dest_latitude = dest_cfg.latitude;
            }
            var dest_location_str = `${dest_longitude},${dest_latitude}`

            this.amap_key = RED.nodes.getNode(config.amap_key);
            let gaodeKey = this.amap_key.amap_key
            axios({
                method: 'get',
                url: `https://restapi.amap.com/v3/distance?origins=${src_location_str}&destination=${dest_location_str}&key=${gaodeKey}&type=1`
            }).then(function (response) {
                let data = response.data
                if (data.status != 1) {
                    // has some error
                    node.error(RED._('amap.error.request_error') + data.info, msg)
                    if(done)
                        done()
                }else{
                    var result = data['results'][0]
                    if (typeof msg.payload !== 'object') {
                        msg.payload = {}
                    }
                    msg.payload.distance = result['distance']
                    msg.payload.duration = result['duration']
                    node.send(msg)
                    if(done)
                        done()
                }
            })
        });
    }

    RED.nodes.registerType("amap-distance", AMapDistance);
}