#version 300 es

in vec3 vPosition;
in vec4 color;

out vec4 vColor;

void main() {
    vColor = color;
    gl_Position = vec4(vPosition, 1.0);
}