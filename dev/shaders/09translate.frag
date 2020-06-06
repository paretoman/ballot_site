#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float circleshape(vec2 position, float radius){
    return step(radius, length(position));
}

void main(){
    vec2 position = gl_FragCoord.xy / u_resolution - vec2(0.0,1.0);
    position *= 600.0;

    vec3 color = vec3(0.0);

    vec2 translate = vec2(300,300);
    position.x -= translate.x;
    position.y += translate.y;
    float circle = circleshape(position, 300.0);
    // float rectangle = rectshape(position, vec2(0.7,0.3));


    color = vec3(circle);
    // color = vec3(rectangle);
    // color = vec3(rectangle);

    // float polys = poly(position,.3,6.);
    // color = vec3(polys);

    gl_FragColor = vec4(color, 1.0);

}