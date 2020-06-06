#ifdef GL_ES
precision mediump float;
#endif

/* all the code has to go up here */

void main() { /* the output function */
    vec3 color = vec3(1.0);
    gl_FragColor = vec4(color,.3);  /* this is the output*/
}       
