import "reflect-metadata";
import {Container, inject, injectable, interfaces} from "inversify";
import Newable = interfaces.Newable;
import {container} from "./container";

export const IContainer = createDecorator(Container);

export function register() {
    return {
        hasInterface<T>(target: any) {
            return {
                isSingleton() {
                    return inSingletonScope(target);
                }
            }
        },
        isSingleton() {
            return inSingletonScope();
        }
    };
}

function inSingletonScope<T>(target?: any) {
    return (ctor: Newable<T>) => {
        target = target || ctor;

        //console.log(`register ${target.name} -> ${ctor.name}`);

        container.bind(target).to(ctor).inSingletonScope();
        Reflect.decorate([injectable()], <Function>ctor);
    };
}

export function createDecorator<T>(named: any) {
    return inject(named);
}
