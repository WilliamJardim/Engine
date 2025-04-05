import ObjectVelocity from "./ObjectVelocity";

export default interface PhysicsState{
    havePhysics?: boolean,
    velocity: ObjectVelocity
}