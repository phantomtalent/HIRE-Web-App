import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UtilitiesService } from './../../../../../../../core/services/utilities.service';

import * as fromServices from '../../../../../../../core/services';
import * as fromRoot from '../../../../../../../store';
import * as emailActions from '../actions/emails.action';
import { EmailTemplate } from './../../../../../../../core/models/email-template';

@Injectable()
export class EmailsEffect {
    baseUrl: string;
    constructor(
        private actions$: Actions,
        private emailService: fromServices.EmailService,
        private utilities: UtilitiesService
    ) {
        this.baseUrl = this.utilities.getHireBaseUrl();
    }

    @Effect() loadEmails$: Observable<Action> = this.actions$.pipe(
        ofType(emailActions.LOAD_EMAILS),
        switchMap(() => {
            return this.emailService.findAll().pipe(
                map((emails) => new emailActions.LoadEmailsSuccess(emails)),
                catchError((error) => of(new emailActions.LoadEmailsFail(error)))
            );
        })
    );

    @Effect() createEmail$: Observable<Action> = this.actions$.pipe(
        ofType(emailActions.CREATE_EMAIL),
        map((action: emailActions.CreateEmail) => action.payload),
        switchMap((data) => {
            return this.emailService.create(data).pipe(
                map((emails) => new emailActions.CreateEmailSuccess(emails)),
                catchError((error) => of(new emailActions.CreateEmailFail(error)))
            );
        })
    );

    @Effect() createEmailSuccess$: Observable<Action> = this.actions$.pipe(
        ofType(emailActions.CREATE_EMAIL_SUCCESS),
        map((action: emailActions.CreateEmailSuccess) => action.payload),
        map(
            (email) =>
                new fromRoot.Go({
                    path: [`${this.baseUrl}/settings/email-templates`, email.id]
                })
        )
    );

    @Effect() updateEmail$: Observable<Action> = this.actions$.pipe(
        ofType(emailActions.UPDATE_EMAIL),
        map((action: emailActions.UpdateEmail) => action.payload),
        switchMap((response: { id: string; data: EmailTemplate }) => {
            return this.emailService.update(response.id, response.data).pipe(
                map((email) => new emailActions.UpdateEmailSuccess(email)),
                catchError((error) => of(new emailActions.UpdateEmailFail(error)))
            );
        })
    );

    @Effect() bulkDeleteEmails$: Observable<Action> = this.actions$.pipe(
        ofType(emailActions.BULK_DELETE_EMAILS),
        map((action: emailActions.BulkDeleteEmails) => action.payload),
        switchMap((data) => {
            return this.emailService.bulkDelete(data).pipe(
                map(() => new emailActions.BulkDeleteEmailsSuccess(data)),
                catchError((error) => of(new emailActions.BulkDeleteEmailsFail(error)))
            );
        })
    );
}
