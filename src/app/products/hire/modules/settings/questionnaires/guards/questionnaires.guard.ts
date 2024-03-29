import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, switchMap, take, tap } from 'rxjs/operators';

import * as fromStore from '../store';

@Injectable()
export class QuestionnairesGuard implements CanActivate {
    constructor(private store: Store<fromStore.QuestionnairesState>) {}

    canActivate(): Observable<boolean> {
        return this.checkStore().pipe(
            switchMap(() => of(true)),
            catchError(() => of(false))
        );
    }

    checkStore(): Observable<boolean> {
        return this.store.pipe(
            select(fromStore.getQuestionnairesLoaded),
            tap((loaded) => {
                if (!loaded) {
                    this.store.dispatch(new fromStore.LoadQuestionnaires());
                }
            }),
            filter((loaded) => loaded),
            take(1)
        );
    }
}
