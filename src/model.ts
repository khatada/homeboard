
import { Record } from 'immutable';
import { EventEmitter } from "events";

export interface ModelStore<T, S> {
    getState: (key: string) => Record<T>;
    dispatcher: (key: string) => Dispatcher<T>;
    getModels: () => S;
}

export abstract class Model<T, M = any> {
    private key: string | null = null;
    private store: ModelStore<T, M> | null = null;

    get state(): Record<T> {
        return this.store!.getState(this.key!);
    }

    apply(key: string, store: ModelStore<T, M>): void{
        this.key = key;
        this.store = store;
    }

    abstract getInitialState(): T;

    constructor() {
    }

    action<R>(callback: (dispatcher: Dispatcher<T>, getStates: () => M) => R): R {
        return callback(this.store!.dispatcher(this.key!), this.store!.getModels.bind(this.store));
    }
}

export type Dispatcher<T> = (next: Record<T>) => void;


export class Store<S extends {[key: string]: any}, R extends {[P in keyof S]: Model<S[P]>}> extends EventEmitter{
    readonly models: {[P in keyof S]: Model<S[P]>};
    readonly states: S = Object.create(null);

    constructor(models: R) {
        super();
        this.models = models;
        Object.keys(this.models).forEach(key => {
            const model = this.models[key];
            model.apply(key, this);
            const record = Record(model.getInitialState())();
            this.states[key] = record;
        });
    }

    getStates(): {[P in keyof S]: Record<S[P]> & S[P]} {
        return this.states as any;
    }

    getState<T>(key: string): Record<T> & T {
        const states = this.states;
        return states[key] as any;
    }

    getModels(): R {
        return this.models as any;
    }

    toJSON(): S {
        const result = Object.create(null);
        Object.keys(this.states).forEach(key => {
            const state = this.states[key];
            result[key] = state.toJS();
        });
        return result;
    }

    dispatcher<T>(target: string): Dispatcher<T> {
        return (next: Record<T>) => {
            this.states[target] = next;
            this.emit("change", this);
            this.emit(`change.${target}`, this);
        };
    }
}
