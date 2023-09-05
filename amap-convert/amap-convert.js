module.exports = function (RED) {
    var axios = require('axios');

    function AMapConvert(config) {
        RED.nodes.createNode(this, config);

        let node = this;

        function prepareValue(msg, fieldName){
            console.log("Field name type")
            console.log(typeof node[fieldName])
            if(typeof node[fieldName] === "num")
                return Number(node[fieldName]);

            var property = "payload"
            var output = msg[property];
            if(typeof node.latitude !== "undefined"){
                property = node.latitude;
                try{
                    output = RED.util.getMessageProperty(msg, node.latitude);
                }
                catch (err){
                    output = undefined;
                }
            }

            return output
        }

        this.on('input', function (msg) {
            // src
            var longitude = prepareValue(msg, "longitude")
            //config.longitude || msg.payload.longitude
            var latitude = config.latitude || msg.payload.latitude
            let coordsys = config.coordsys
            var location_str = `${longitude},${latitude}`

            let gaodeKey = RED.nodes.getNode(config.amap_key).amap_key;
            var payload = {}
            axios({
                method: 'get',
                url: `http://restapi.amap.com/v3/assistant/coordinate/convert?key=${gaodeKey}&locations=${location_str}&coordsys=${coordsys}`
            }).then(function (response) {
                var data = response.data
                var status = data['status']
                if (status != 1) {
                    throw new Error(JSON.stringify(data))
                }

                var locations = data.locations.split(';')[0].split(',')
                payload.status = 1
                payload.longitude = locations[0]
                payload.latitude = locations[1]
                msg.payload = payload
                node.send(msg)
            }).catch(function (error) {
                payload.status = 0
                msg.payload = payload
                msg['data'] = error
                node.send(msg)
            })
        });
    }

    RED.nodes.registerType("amap-convert", AMapConvert);
}