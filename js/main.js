'use strict';
import vShaderSource from 'mandelbrot.vert';
import fShaderSource from 'mandelbrot.frag';

window.addEventListener("load",()=>{
    main();
});

function main(vShaderSource,fShaderSource){
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

    const rect = canvas.getBoundingClientRect();
    
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.enable(gl.BLEND);
    //gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LEQUAL);

    const VERTEX_SIZE = 3;
    const COLOR_SIZE = 4;
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

    gl.uniform2f(gl.getUniformLocation(program, "resolution"), width,height); 
    const utimer = gl.getUniformLocation(program, "timer");
    const umouse = gl.getUniformLocation(program, "mouse");
    const uzoom = gl.getUniformLocation(program, "zoom");

    const startTime = Date.now();
    let sec=0,m={x:width/2,y:height/2},zoom=1;

    canvas.addEventListener("mousemove", function(e){
        m.x = e.clientX - rect.left;
        m.y = e.clientY - rect.top;
        //console.log(m.x/width-0.5,m.y/height-0.5)
    });
    canvas.addEventListener("mousedown", function(e){
        switch(e.button){
            case 0:
                zoom*=2;
                break;
            case 2:
                zoom/=2;
                break;
        }
        console.log(zoom)
    });
    canvas.addEventListener('contextmenu',function(e){e.stopPropagation();},true);
    

    window.requestAnimationFrame(render);

    let r=0,g=0,b=0;
    function render(){
        sec = (Date.now() - startTime) / 1000;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, width, height);

        gl.uniform1f(utimer, sec); 
        gl.uniform2f(umouse, m.x,m.y); 
        gl.uniform1f(uzoom, zoom); 

        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, iData.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        document.getElementById("snap").innerText=sec;
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

