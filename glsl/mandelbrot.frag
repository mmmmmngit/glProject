#version 300 es
precision highp float;

in vec4 vColor;

uniform vec2 resolution;
uniform float timer;
uniform vec2 mouse;
uniform float zoom;

out vec4 fColor;
vec3 col(float t){
    return vec3(t,t,t);
}
void main() {
    int depth = 1000;
    vec2 point= (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec2 m = vec2(mouse.x,-mouse.y)/resolution+vec2(-0.5,0.5);

    vec2 p = (point+vec2(-0.5,0.0));
    vec2 z = vec2(0.0, 0.0);
    int i;

    for(i=0;i<depth;i++){
        if(length(z)>2.0){break;}
        z = vec2(z.x * z.x - z.y * z.y + p.x , 2.0 * z.x * z.y + p.y) ;
    }
    
    vec3 t = col(float(i)/float(depth));
    fColor = vec4(t,1.0);
}