import { User } from './../../models/user';
import { Action } from '@ngrx/store';


export const GET_AUTH_USER = 'GET_AUTH_USER';
export const CREATE_TENANT_USER = 'CREATE_TENANT_USER';

export enum UserActionTypes {
    GetAuthUser = '[User] Get authenticated user',
    SetAuthUser = '[User] Save authenticated user to the store'
}

export class GetAuthUser implements Action {
    readonly type = UserActionTypes.GetAuthUser;
}

export class SetAuthUser implements Action {
    readonly type = UserActionTypes.SetAuthUser;
    payload: User;
}

export type UserActions = GetAuthUser | SetAuthUser;
