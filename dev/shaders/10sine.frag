#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float circleshape(vec2 position, float radius){
    return step(radius, length(position));
}

void main(){
    vec2 position = gl_FragCoord.xy / u_resolution - vec2(0.0,1.0);
    position *= 1.0;

    vec3 color = vec3(0.0);

    vec2 translate = vec2(0.5,0.5);
    position.x -= translate.x;
    position.y += translate.y;
    position.x += 0.5 * sin(u_time * 10.0);
    float circle = circleshape(position, 0.5);
    // float rectangle = rectshape(position, vec2(0.7,0.3));


    color = vec3(circle);
    // color = vec3(rectangle);
    // color = vec3(rectangle);

    // float polys = poly(position,.3,6.);
    // color = vec3(polys);

    gl_FragColor = vec4(color, 1.0);

}