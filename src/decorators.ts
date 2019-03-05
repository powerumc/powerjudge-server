import "reflect-metadata";
import {injectable, interfaces} from "inversify";
import Newable = interfaces.Newable;
import {container} from "./container";

export function register() {
    console.log("register.");

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

        console.log(target);
        console.log(ctor);

        container.bind(target).to(ctor).inSingletonScope();

        Reflect.decorate([injectable()], target);
    };
}

export function createDecorator<T>(named: string) {
    const decorator = (target: any) => {
    };

    decorator.toString = () => named;

    return decorator;
}