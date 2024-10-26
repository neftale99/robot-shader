uniform float uSliceStart;
uniform float uSliceArc;

varying vec3 vPosition;

void main() {


    float angle = atan(vPosition.z, vPosition.x);
    angle -= uSliceStart;
    angle = mod(angle, PI * 2.0);

    if(angle > 0.0 && angle < uSliceArc)
        discard;
    
    float csm_Slice;
}