#ifdef GL_ES
precision mediump float;
#endif

const float PI = 3.14159;

uniform vec2 u_resolution;

float poly(vec2 position, float radius, float sides){
    position = position * 2.0 - 1.0;
    float angle = atan(position.x, position.y);
    float slice = PI * 2.0 / sides;
    return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}
void main(){
    vec2 position = gl_FragCoord.xy / u_resolution;

    vec3 color = vec3(0.0);

    // float circle = circleshape(position, 0.3);
    // float rectangle = rectshape(position, vec2(0.7,0.3));

    // // color = vec3(circle);
    // color = vec3(rectangle);
    // color = vec3(rectangle);

    float polys = poly(position,.3,6.);
    color = vec3(polys);

    gl_FragColor = vec4(color, 1.0);

}
