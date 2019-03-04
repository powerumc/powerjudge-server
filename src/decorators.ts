import "reflect-metadata";
import {injectable, interfaces} from "inversify";
import {container} from "./index";
import Newable = interfaces.Newable;

export function register() {
    console.log("register.");

    return {
        hasInterface<T>(target: any) {
            return {
                isSingleton() {
                    return (ctor: Newable<T>) => {
                        console.log(target);
                        console.log(ctor);

                        container.bind(target).to(ctor).inSingletonScope();

                        Reflect.decorate([injectable()], ctor);
                    };
                }
            }
        }
    };
}

export function createDecorator<T>(named: string) {
    const decorator = (target: any) => {
    };

    decorator.toString = () => named;

    return decorator;
}