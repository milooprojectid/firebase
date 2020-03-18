declare module "*.json" {
    const value: any;
    export default value;
}

export interface DeterminerOut<Model> {
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    data: Model,
    dataBefore?: Model
}

export type DeterminerOutFirestore<Model> = {
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    data: Model
}

export interface IContext {
    username: string;
    user_id: string;
}

export interface IData {
    query: any;
    body: any;
    method: string;
    handler: string;
}

export interface IHttpError {
    message: string;
    name: string;
    status: number;
    data?: object;
}

export interface IHandlerOutput {
    message?: string;
    data?: any;
    status?: number;
}

type methodHandler = (data: IData, context: IContext) => Promise<IHandlerOutput>;

export interface ObjectAny {
    [s: string]: any;
}