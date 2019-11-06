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

    function render(){
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        window.requestAnimationFrame(render);
    }
}