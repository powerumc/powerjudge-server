// import "reflect-metadata";
// import {Container, inject, injectable, interfaces} from "inversify";
// import Newable = interfaces.Newable;
// import {container} from "@app";
//
// export const IContainer = createDecorator(Container);
//
// export function register() {
//   return {
//     hasInterface<T>(target: any) {
//       return {
//         isSingleton() {
//           return inSingletonScope(target);
//         },
//         inTransientScope() {
//           return inTransientScope(target);
//         }
//       }
//     },
//     isSingleton() {
//       return inSingletonScope();
//     },
//     inTransient() {
//       return inTransientScope();
//     }
//   };
// }
//
// function inSingletonScope<T>(target?: any) {
//   return (ctor: Newable<T>) => {
//     target = target || ctor;
//
//     container.bind(target).to(ctor).inSingletonScope();
//     Reflect.decorate([injectable()], <Function>ctor);
//   };
// }
//
// function inTransientScope<T>(target?: any) {
//   return (ctor: Newable<T>) => {
//     target = target || ctor;
//
//     container.bind(target).to(ctor).inTransientScope();
//     Reflect.decorate([injectable()], <Function>ctor);
//   };
// }
//
// export function createDecorator<T>(named: any) {
//   return inject(named);
// }
