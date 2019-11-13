'use strict';
window.addEventListener("load",()=>{
    main();
});

function main(){
    const canvas = document.getElementById("canvas");
    const width = 512,height=512;
    canvas.width = width;
    canvas.height = height;
    const gl = canvas.getContext("webgl2");
    if(gl)console.log("webgl2 loaded.")
    else{
        console.error("webgl2 has been deleted.");
        return;
    }
    
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.enable(gl.BLEND);
    //gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LEQUAL);

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
        uniform float timer;

        out vec4 fColor;

        void main() {
            vec3 t = gl_FragCoord.xyz;
            fColor = vec4(t.x/512.0,t.y/512.0,t.z+sin(timer),1.0);
        }
    `;
//compile
    const vs = create_shader(vShaderSource,"vertex");
    const fs = create_shader(fShaderSource,"fragment")
//link
    const program = create_program(vs,fs);
    gl.useProgram(program);
//data
    const vData =[
        1,1,0,
        -1,1,0,
        1,-1,0,
        -1,-1,0,
    ];
    const cData = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0
    ];
    const iData = [
        0,1,2,
        2,3,1
    ];
    const attLocation = [
        gl.getAttribLocation(program, 'vPosition'),
        gl.getAttribLocation(program, 'color')
    ];
    const attStride=[3,4];
    const vao = create_vao([vData,cData],attLocation,attStride,iData);

    const timer = gl.getUniformLocation(program, "timer");

    const startTime = Date.now();
    let sec;

    window.requestAnimationFrame(render);

    let r=0,g=0,b=0;
    function render(){
        sec = (Date.now() - startTime) / 1000;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, width, height);

        gl.uniform1f(timer, sec); 

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, iData.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        window.requestAnimationFrame(render);
    }
    //////////////////////////////////////////////////////////////////////////////////////////
    function create_shader(source,type){
        var shader;
        var script = source;
        if(!source){return;}
        switch(type){
            case 'vertex':
                shader = gl.createShader(gl.VERTEX_SHADER);
                break;
            case 'fragment':
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                break;
            default :
                return;
        }
        gl.shaderSource(shader, script);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        }else{
            console.error(gl.getShaderInfoLog(shader));
        }
    }
    function create_program(vs, fs){
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        }else{
            alert(gl.getProgramInfoLog(program));
        }
    }
    function create_vbo(data){
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }
    function create_ibo(data){
        var ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }
    function create_vao(vboDataArray, attLocation, attStride, iboData){
        var vao, vbo, ibo, i;
        vao = gl.createVertexArray();//vao作成
        gl.bindVertexArray(vao);
        for(i in vboDataArray){//vbo作成
            vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vboDataArray[i]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(attLocation[i]);
            gl.vertexAttribPointer(attLocation[i], attStride[i], gl.FLOAT, false, 0, 0);
        }
        if(iboData){//ibo作成
            ibo = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(iboData), gl.STATIC_DRAW);
        }
        gl.bindVertexArray(null);
        return vao;
    }
}

