module.exports = function (RED) {
    var axios = require('axios');

    function AMapDistance(config) {
        RED.nodes.createNode(this, config);

        let node = this;
        this.on('input', function (msg) {
            // src
            var src_longitude = config.src_dyn_longitude || msg.payload.src_dyn_longitude
            var src_latitude = config.src_dyn_latitude || msg.payload.src_dyn_latitude
            if(config.src_type === 'static'){
                var src_cfg = RED.nodes.getNode(config.src_cfg)
                src_longitude = src_cfg.longitude;
                src_latitude = src_cfg.latitude;
            }
            var src_location_str = `${src_longitude},${src_latitude}`

            // dest
            var dest_longitude = config.dest_dyn_longitude || msg.payload.dest_dyn_longitude
            var dest_latitude = config.dest_dyn_latitude || msg.payload.dest_dyn_latitude
            if(config.dest_type === 'static'){
                var dest_cfg = RED.nodes.getNode(config.dest_cfg)
                dest_longitude = dest_cfg.longitude;
                dest_latitude = dest_cfg.latitude;
            }
            var dest_location_str = `${dest_longitude},${dest_latitude}`

            this.amap_key = RED.nodes.getNode(config.amap_key);
            let gaodeKey = this.amap_key.amap_key
            var payload = {}
            axios({
                method: 'get',
                url: `https://restapi.amap.com/v3/distance?origins=${src_location_str}&destination=${dest_location_str}&key=${gaodeKey}&type=1`
            }).then(function (response) {
                let data = response.data
                let status = data['status']
                if (status != 1) {
                    throw new Error(JSON.stringify(data))
                }

                var result = data['results'][0]
                payload.status = 1
                payload.distance = result['distance']
                payload.duration = result['duration']
                msg.payload = payload
                msg['data'] = data
                node.send(msg)
            }).catch(function (error) {
                payload.status = 0
                msg.payload = payload
                msg['data'] = error
                node.send(msg)
            })
        });

    }

    RED.nodes.registerType("amap-distance", AMapDistance);
}