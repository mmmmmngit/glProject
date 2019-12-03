#version 300 es
precision highp float;

in vec4 vColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

out vec4 fColor;

const float acc=0.01;
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

vec3 hsv2rgb(vec3 hsv){
    return ((clamp(abs(fract(hsv.x+vec3(0,2,1)/3.)*6.-3.)-1.,0.,1.)-1.)*hsv.y+1.)*hsv.z;
}
vec4 minVec4(vec4 a, vec4 b) {
    return (a.a < b.a) ? a : b;
}
float sd_sphere( vec3 p, float s ){
    return length(p)-s;
}
float sd_box( vec3 p, vec3 b ,float r)
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0)-r;
}
float sd_plane( vec3 p, vec4 n )
{
    // n must be normalized
    return dot(p,n.xyz) + n.w;
}


vec3 op_trans(vec3 p,float t){
    return mod(p, t) - t/2.0;
}
float op_uni( float d1, float d2 ) {return min(d1,d2);}
float op_sub( float d1, float d2 ) {return max(-d1,d2);}
float op_inter( float d1, float d2 ) {return max(d1,d2);}
float op_suni( float d1, float d2, float k ) {float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );return mix( d2, d1, h ) - k*h*(1.0-h);}
float op_ssub( float d1, float d2, float k ) {float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );return mix( d2, -d1, h ) + k*h*(1.0-h);}
float op_sinter( float d1, float d2, float k ){float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );return mix( d2, d1, h ) + k*h*(1.0-h);}

float distFunc(vec3 p){
    float sp1 = sd_sphere(p-vec3(1.5,0.0,0.0),1.0);
    float box1= sd_box(p-vec3(-1.5,0.0,0.0),vec3(1.0),.0);
    float plane1 = sd_plane(p-vec3(0.0,5.0,0.0),vec4(1.0,1.0,1.0,1.0));
    return op_uni(sp1,box1);
}
vec3 normal(vec3 p){
    float d = acc;
    return normalize(vec3(
        distFunc(p + vec3(  d, 0.0, 0.0)) - distFunc(p + vec3(0.0, 0.0, 0.0)),
        distFunc(p + vec3(0.0,   d, 0.0)) - distFunc(p + vec3(0.0,  0.0, 0.0)),
        distFunc(p + vec3(0.0, 0.0,   d)) - distFunc(p + vec3(0.0, 0.0,  0.0))
    ));
}
vec4 dist(vec3 p) {
    int size=9;
    float[] dist = float[](
        sd_sphere(op_trans(p+vec3(1.5,0.0,0.0),10.0)+vec3(0.0,0.0,0.0),2.2),
        sd_sphere(op_trans(p+vec3(-1.5,0.0,0.0),10.0)+vec3(.0,0.0,0.0),2.2)
    );
    vec3[] col = vec3[](
        hsv2rgb(vec3(0.0+u_time/3.0, 1.5, 1.0)),
        hsv2rgb(vec3(0.0+u_time/3.0, 1.0, 1.0)),
        hsv2rgb(vec3(2.0/3.0+u_time/3.0, 1.0, 1.0))
    );
    int n=0;
    float t=10000.0;
    for(int i=0;i<size;i++){
        if(dist[i]<t){
            t=dist[i];
            n=i;
        }
    }
    return vec4(col[n],dist[n]);
}
vec3 norm(vec3 p){
    float d = acc;
    return normalize(vec3(
        dist(p + vec3(  d, 0.0, 0.0)).a - dist(p + vec3(-d, 0.0, 0.0)).a,
        dist(p + vec3(0.0,   d, 0.0)).a - dist(p + vec3(0.0, -d, 0.0)).a,
        dist(p + vec3(0.0, 0.0,   d)).a - dist(p + vec3(0.0, 0.0, -d)).a
    ));
}

void main() { 
    const vec3 lightDir = (vec3(0.1, 0.5, 1.0));
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    Camera c;
    c.pos = vec3(0.0, 5.0, u_time*10.0);   // カメラの位置
    c.dir = vec3(0.0,  0.0 ,-1.0);   // カメラの向き(視線)
    c.up  = vec3(0.0,  1.0,  0.0);// カメラの上方向
    c.side = cross(c.dir, c.up);    // 外積を使って横方向を算出
    c.depth = 1.0;          // フォーカスする深度
    c.fov =90.0 * 0.5 * PI / 180.0;

    Ray r;
    r.pos = c.pos;
    r.dir = normalize(sin(c.fov)*p.x * c.side + sin(c.fov)*p.y * c.up + cos(c.fov)*c.dir*c.depth);

    float t=0.0,d;
    for(int i = 0; i < 64; i++){
        d = dist(r.pos).a;
        if(d<acc)break;
        t += d;
        r.pos = c.pos + t * r.dir;
    }
    
    // hit check
    if(abs(d) < acc){
        vec3 normal = norm(r.pos);
        vec4 color = dist(r.pos);
        float diff = (clamp(dot(lightDir, normal), 0.5, 1.0));
        fColor  = vec4(diff*color.xyz, 1.0);
    }else{
        float c = clamp(-p.y+0.2,0.3,1.0);
        fColor  = vec4(vec3(c,c,1.0), 1.0);
    }

}