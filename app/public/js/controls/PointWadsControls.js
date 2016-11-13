/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

THREE.PointWadsControls = function ( object, domElement ) {

	this.object = object;
	this.velocity = new THREE.Vector3( 0, 0, 0);

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.lookVertical = true;
	this.autoForward = false;
	this.invertVertical = true;
	this.movementSpeed = 8;

	this.activeLook = true;

	this.mouseX = 0;
	this.mouseY = 0;
	this.mousePos = new THREE.Vector3(0,0,0);

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0:
					fireWeapon();
					break;
				case 2:
					//this.moveBackward = true;
					break;

			}

		}

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

	};

	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = -(event.pageX - this.viewHalfX);
			this.mouseY = -(event.pageY - this.viewHalfY);

		} else {

			this.mouseX = -(event.pageX - this.domElement.offsetLeft - this.viewHalfX);
			this.mouseY = -(event.pageY - this.domElement.offsetTop - this.viewHalfY);

		}
	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {
			
			case 16: /*shift*/ this.shift = true; break;

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.freeze = !this.freeze; togglePauseGame(); break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {
			
			case 16: /*shift*/ this.shift = false; break;

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};
	
	this.getMousePosition = function() {
		var vector = new THREE.Vector3();
		vector.set(
			-(this.mouseX / window.innerWidth) * 2,
			(this.mouseY / window.innerHeight) * 2,
			0.5 );
		vector.unproject( camera );
		var dir = vector.sub( camera.position ).normalize();
		var distance = - (camera.position.z / dir.z);
		return camera.position.clone().add( dir.multiplyScalar( distance ) );
	}

	this.update = function( delta ) {

		if ( this.freeze ) {
			return;
		}

		this.mousePos = this.getMousePosition();
		
		//controls
		if(this.moveForward || this.moveBackward) {
			var lookVector = new THREE.Vector3();
			lookVector.subVectors(this.mousePos, this.object.position);
				lookVector.normalize();

			if ( this.moveForward && !this.moveBackward ) {
				if(this.shift) {
					lookVector.setLength(delta * this.movementSpeed * 3);
				} else {
					lookVector.setLength(delta * this.movementSpeed);
				}
				this.velocity.addVectors(this.velocity, lookVector);
			}
			if ( this.moveBackward && !this.moveForward ){
				lookVector.setLength(delta * this.movementSpeed * -1);
				this.velocity.addVectors(this.velocity, lookVector);
			}
		}
		
		if(this.moveLeft || this.moveRight) {
			var lookVector = new THREE.Vector3();
			lookVector.subVectors(this.mousePos, this.object.position);
			lookVector.normalize();
			var originVector = new THREE.Vector3(0,0,-1);

			if ( this.moveLeft && !this.moveRight ) {
				lookVector.cross(originVector);
				lookVector.setLength(delta * this.movementSpeed * 1);
				this.velocity.addVectors(this.velocity, lookVector);
			}
			if ( this.moveRight && !this.moveLeft ){
				lookVector.cross(originVector);
				lookVector.setLength(delta * this.movementSpeed * -1);
				this.velocity.addVectors(this.velocity, lookVector);
			}
		}
		
		this.object.position.addVectors(this.object.position, this.velocity);
		this.object.lookAt(this.mousePos);
	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.handleResize();

};

function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}
