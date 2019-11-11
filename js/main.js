'use strict';
window.addEventListener("load",()=>{
    main();
});

function main(){
    const canvas = document.getElementById("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const gl = canvas.getContext("webgl2");
    if(gl)console.log("webgl2 loaded.")
    else{
        console.error("webgl2 has been deleted.");
        return;
    }
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const VERTEX_SIZE = 3;
    const COLOR_SIZE = 4;
//shader
    const vShaderSource
      =`#version 300 es

        in vec3 vPosition;
        in vec4 color;
        
        out vec4 vColor;
        
        void main() {
        vColor = color;
        gl_Position = vec4(vPosition, 1.0);
        }
    `;
    const fShaderSource
      =`#version 300 es
        precision highp float;

        in vec4 vColor;
        out vec4 fColor;

        void main() {
        fColor = vColor;
        }
    `;
//compile
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vShader, vShaderSource);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(vShader));
    gl.shaderSource(fShader, fShaderSource);
    gl.compileShader(fShader);
    if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))console.log(gl.getShaderInfoLog(fShader));
//link
    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS))console.log(gl.getProgramInfoLog(program));
    gl.useProgram(program);
//buffer
    const vBuffer = gl.createBuffer();
    const cBuffer = gl.createBuffer();
    const iBuffer = gl.createBuffer();
    const vAttLocation = gl.getAttribLocation(program, 'vPosition');
    const cAttLocation  = gl.getAttribLocation(program, 'color');

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, VERTEX_SIZE, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.enableVertexAttribArray(cAttLocation);
    gl.vertexAttribPointer(cAttLocation, COLOR_SIZE, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
//data
    const vData = new Float32Array([
        1,1,0,
        -1,1,0,
        1,-1,0,
        -1,-1,0,
    ]);
    const cData = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    const iData = new Uint32Array([
        0,1,2,
        1,3,2
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, iData, gl.STATIC_DRAW);
    
    gl.drawElements(gl.TRIANGLES, iData.length, gl.UNSIGNED_SHORT, 0);
    gl.flush();

    //render();
    function render(){
        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.drawElements(gl.TRIANGLES, iData.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        window.requestAnimationFrame(render);
    }
}