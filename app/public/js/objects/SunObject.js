
THREE.SunObject = function ( radius) {


	this.radius = radius || Math.random() * 200;
	
	var geometry = new THREE.SphereGeometry( radius, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff44} );
	this.obj = new THREE.Mesh( geometry, material);

	return this.obj;
};