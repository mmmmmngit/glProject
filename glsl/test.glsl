#version 300 es
precision highp float;

in vec4 vColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

out vec4 fColor;

const float acc=0.0001;
const float PI = 3.14159265;

struct Ray{
    vec3 pos;
    vec3 dir;
};
struct Camera{
    vec3 pos;
    vec3 dir;
    vec3 up;
    vec3 side;
    float depth;
    float fov;
};

float sd_sphere( vec3 p, float s ){
    return length(p)-s;
}
float sd_box( vec3 p, vec3 b ,float r)
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0)-r;
}


vec3 op_trans(vec3 p){
    float t=4.0;
    return mod(p, t) - t/2.0;
}
float op_uni( float d1, float d2 ) {return min(d1,d2);}

float op_sub( float d1, float d2 ) {return max(-d1,d2);}

float op_inter( float d1, float d2 ) {return max(d1,d2);}

float distFunc(vec3 p){
    float sp1 = sd_sphere(op_trans(p),1.0);

    float box1= sd_box(op_trans(p),vec3(2.0),.0);

    float obj1 = min(sp1,box1);
    return op_inter(obj1,sp1);
}

vec3 normal(vec3 p){
    float d = acc;
    return normalize(vec3(
        distFunc(p + vec3(  d, 0.0, 0.0)) - distFunc(p + vec3(-d, 0.0, 0.0)),
        distFunc(p + vec3(0.0,   d, 0.0)) - distFunc(p + vec3(0.0,  -d, 0.0)),
        distFunc(p + vec3(0.0, 0.0,   d)) - distFunc(p + vec3(0.0, 0.0,  -d))
    ));
}


void main() {
    
    const vec3 lightDir = vec3(0.2, 0.3, 1.0);
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    
    Camera c;
    c.pos = vec3(0.0, 0.0, u_time*5.0);   // カメラの位置
    c.dir = vec3(0.0,  0.0 ,-1.0);  // カメラの向き(視線)
    c.up  = vec3(0.0,  1.0,  0.0);// カメラの上方向
    c.side = cross(c.dir, c.up);    // 外積を使って横方向を算出
    c.depth = 1.0;          // フォーカスする深度
    c.fov = 90.0 * 0.5 * PI / 180.0;

    Ray r;
    r.pos = c.pos;
    r.dir = normalize(sin(c.fov)*p.x * c.side + sin(c.fov)*p.y * c.up + cos(c.fov)*c.dir*c.depth);
    
    float t=0.0,d;
    for(int i = 0; i < 128; i++){
        d = distFunc(r.pos);
        if(d<acc)break;
        t += d;
        r.pos = c.pos + t * r.dir;
    }
    
    // hit check
    if(abs(d) < acc){
        vec3 normal = normal(r.pos);
        float diff = clamp(dot(lightDir, normal), 0.0, 1.0);
        fColor  = vec4(vec3(diff), 1.0);
    }else{
        fColor  = vec4(vec3(0.0), 1.0);
    }

}