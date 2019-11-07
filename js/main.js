'use strict';

window.addEventListener("load",()=>{
    console.log("a");
    main();
});

function main(){
    let gl = document.getElementById("canvas").getContext("webgl2");
    if(gl)console.log("webgl loaded.")
    else{
        console.error("webgl2 has been deleted.");
        return;
    }

    let vshader=`
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 texCoord;
        
        uniform mat4 mMatrix;
        uniform mat4 mvpMatrix;
        uniform mat4 normalMatrix;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vTexCoord;
        
        void main(){
            vPosition = (mMatrix * vec4(position, 1.0)).xyz;
            vNormal = (normalMatrix * vec4(normal, 0.0)).xyz;
            vTexCoord = texCoord;
            gl_Position = mvpMatrix * vec4(position, 1.0);
        }
    `;

    function render(){
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        window.requestAnimationFrame(render);
    }
}