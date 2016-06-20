define({
	"renderers":[
		{
			"id":"ParticleRenderer",
			"script":"ParticleRenderer",
			"settings": {
			}
		},
		{
			"id":"SurfaceRenderer",
			"script":"ParticleRenderer",
			"settings": {
				"billboardType":2,
				"up":[0, 0, 1]
			}
		},
		{
			"id":"FastTrailRenderer",
			"script":"TrailRenderer",
			"settings": {
				"segmentCount": 4,
				"width": {
					"value": 1,
					"type": "number"
				},
				"updateSpeed": {
					"value": 4,
					"type": "number"
				}
			}
		},
		{
			"id":"TrailRenderer",
			"script":"TrailRenderer",
			"settings": {
				"segmentCount": 12,
				"width": {
					"value": 1,
					"type": "number"
				},
				"updateSpeed": {
					"value": 3,
					"type": "number"
				}
			}
		}
	]
});