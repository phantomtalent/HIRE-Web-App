import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';

import { User } from '../../../../../core/models/user';
import { CandidateService } from './../../../../../core/services/candidate.service';
import { UserService } from './../../../../../core/services/user.service';
import { UtilitiesService } from './../../../../../core/services/utilities.service';
import * as fromStore from './../../../../../store';
import * as fromSelectors from './../../../../../store/selectors';

@Component({
    selector: 'app-candidate-item-feedback',
    templateUrl: './candidate-item-feedback.component.html',
    styleUrls: ['./candidate-item-feedback.component.scss']
})
export class CandidateItemFeedbackComponent implements OnInit {
    @Input() jobId;
    @Input() job;
    @Input() candidateId;
    @Input() feedback;
    @Output() public feedbackUpdate = new EventEmitter<any>();
    feedbackForm: FormGroup;
    positionSpecificCategories: any[] = [];
    addPositionSpecificCategory = false;
    user: User;
    users: User[];
    contentLoading = false;
    initialState;
    changedState;
    formIsDirty = false;

    editMarks = false;
    view = 'default';
    candidateAbilities = [];
    jobOwner = false;
    showPositionRating = false;
    alreadySelectedPositionRating = false;

    constructor(
        private candidateService: CandidateService,
        private userService: UserService,
        private fb: FormBuilder,
        private store: Store<fromStore.State>,
        private utilities: UtilitiesService
    ) {
        // Get users
        this.contentLoading = true;
        this.userService.getUsers().subscribe(
            (users: User[]) => {
                this.users = users;
                this.contentLoading = false;
            },
            (err) => {
                this.contentLoading = false;
            }
        );
    }

    ngOnInit() {
        this.initForm();
        if (this.feedback && this.feedback[this.jobId]) {
            this.view = 'results';
            this.positionSpecificCategories = this.feedback[this.jobId].position_rating;
        }
        this.showPositionRating = this.job.show_position_rating ? true : false;
        this.alreadySelectedPositionRating =
            this.job && (typeof this.job.show_position_rating === 'undefined' || this.job.show_position_rating === null)
                ? false
                : true;
        // Get user
        this.store.pipe(select(fromSelectors.getUserEntity)).subscribe((user: User) => {
            this.user = user;
            this.populateForm();
            this.initialState = { ...this.getState() };
            if (this.job.owner === this.user.id) {
                this.jobOwner = true;
            }
        });
        this.feedbackForm.valueChanges.subscribe((a) => {
            this.changedState = this.getState();
            this.formIsDirty = !this.utilities.isEqual(this.initialState, this.changedState);
        });
    }

    initForm() {
        this.feedbackForm = this.fb.group({
            comments: ['', Validators.required],
            rating: ['0', Validators.required],
            positionRating: ['']
        });
    }
    getState() {
        return {
            comments: this.feedbackForm.get('comments').value,
            rating: this.transformRating(this.feedbackForm.get('rating').value),
            position_rating: this.positionSpecificCategories
                .slice(0)
                .filter((cat) => cat.value)
                .map((cat) => ({ id: cat.id, value: cat.value }))
        };
    }
    commentsExist() {
        for (const comment of this.feedback[this.jobId].comments) {
            if (comment.value.trim().length > 0) {
                return true;
            }
        }
    }

    populateForm() {
        if (this.feedback && this.feedback[this.jobId]) {
            const candidateFeedback = this.feedback[this.jobId];
            if (candidateFeedback.comments) {
                const item = candidateFeedback.comments.find((c) => {
                    return c.user_id === this.user.id;
                });
                if (item) {
                    this.feedbackForm.patchValue({
                        comments: item.value
                    });
                }
            }
            if (candidateFeedback.rating) {
                const item = candidateFeedback.rating.find((c) => c.user_id === this.user.id);
                if (item) {
                    this.feedbackForm.patchValue({
                        rating: this.transformRatingToPercent(item.value)
                    });
                }
            }

            // this.positionSpecificCategories = candidateFeedback.position_rating.map(item => {
            //     if (item.votes && item.votes.length) {
            //         const vote = item.votes.find(v => v.user_id === this.user.id);
            //         if (vote) {
            //             item.value = vote.value;
            //         }
            //     }
            //     return item;
            // });
            // this.positionSpecificCategories = this.job.position_rating;
            // console.log(this.positionSpecificCategories);
        }
        if (this.job.position_rating) {
            this.positionSpecificCategories = this.job.position_rating.map((item) => {
                if (this.feedback && this.feedback[this.jobId]) {
                    const obj = this.feedback[this.jobId].position_rating.find((v) => v.id === item.id);
                    if (obj) {
                        item.votes = obj.votes;
                        const val = obj.votes.find((u) => u.user_id === this.user.id);
                        if (val) {
                            item.value = val.value;
                        }
                    }
                }
                return item;
            });
        }
        // console.log(this.positionSpecificCategories);
    }
    getUserData(id, field) {
        if (this.users) {
            const userData: any = this.users.find((c) => {
                return c.id === id;
            });
            return userData[field];
        }
    }
    calculateOverallRating(mark) {
        const length = Object.keys(this.feedback[this.jobId].rating).length;
        return { width: `${(this.mapAmountProp(this.feedback[this.jobId].rating, 'value')[mark] / length) * 100}%` };
    }

    mapAmountProp(data, prop) {
        return data.reduce((res, item) => ({ ...res, [item[prop]]: 1 + (res[item[prop]] || 0) }), Object.create(null));
    }

    onAddPositionSpecificCategory(input) {
        const val = input.value.trim();
        if (val.length) {
            this.positionSpecificCategories.push({
                id: this.utilities.generateUID(10).toLowerCase(),
                title: val,
                order: this.positionSpecificCategories.length
            });
            input.value = '';
        }
    }

    moveUp(index: number) {
        this.positionSpecificCategories[index].order = index - 1;
        this.positionSpecificCategories[index - 1].order = index;
        this.updateOrder();
    }

    moveDown(index: number) {
        this.positionSpecificCategories[index].order = index + 1;
        this.positionSpecificCategories[index + 1].order = index;
        this.updateOrder();
    }

    onRemovePositionSpecificCategory(index: number) {
        this.positionSpecificCategories.splice(index, 1);
        this.updateOrder();
    }

    onEvaluateCategory(index: number, value: number) {
        this.positionSpecificCategories = this.positionSpecificCategories.slice(0);
        this.positionSpecificCategories[index].value = value;
        if (!this.positionSpecificCategories[index].votes) {
            this.positionSpecificCategories[index].votes = [
                {
                    user_id: this.user.id,
                    value
                }
            ];
        }

        if (this.positionSpecificCategories[index].votes && this.positionSpecificCategories[index].votes.length) {
            const vote = this.positionSpecificCategories[index].votes.find((v) => v.user_id === this.user.id);
            console.log(vote);
            if (vote) {
                vote.value = value;
            } else {
                this.positionSpecificCategories[index].votes.push({
                    user_id: this.user.id,
                    value
                });
            }
        }
        this.changedState = { ...this.getState() };
        this.formIsDirty = !this.utilities.isEqual(this.initialState, this.changedState);
    }

    updateOrder() {
        this.positionSpecificCategories = this.positionSpecificCategories.sort((a: number, b: number) => {
            if (a['order'] < b['order']) {
                return -1;
            } else if (a['order'] > b['order']) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    onUpdateFeedbackPositionRatingCategories(input = null) {
        if (input.value.trim().length > 0 || this.positionSpecificCategories.length) {
            if (input) {
                this.onAddPositionSpecificCategory(input);
            }

            this.addPositionSpecificCategory = false;
            const data = this.positionSpecificCategories.map((item) => ({
                id: item.id,
                title: item.title,
                order: item.order
            }));
            this.candidateService
                .updateFeedbackPositionRatingCategories(this.jobId, data)
                .subscribe((r) => console.log('✅ Position specific categories updated'));
        }
    }

    onSaveFeedback() {
        const data = {
            comments: this.feedbackForm.get('comments').value,
            created: new Date().getTime(),
            rating: this.transformRating(this.feedbackForm.get('rating').value),
            position_rating: this.positionSpecificCategories
                .slice(0)
                .filter((cat) => cat.value)
                .map((cat) => ({ id: cat.id, value: cat.value }))
        };
        this.contentLoading = true;
        console.log(data);
        this.candidateService.updateFeedback(this.jobId, this.candidateId, data).subscribe(
            (response: any) => {
                this.contentLoading = false;
                if (response.feedback) {
                    this.feedback = response.feedback;
                    console.log(response.feedback);
                    this.view = 'results';
                    this.feedbackUpdate.next(response.feedback);
                    this.initialState = { ...this.getState() };
                    this.formIsDirty = false;
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }
    transformRating(value: number) {
        switch (value) {
            case 0:
                return 1;
            case 25:
                return 2;
            case 50:
                return 3;
            case 75:
                return 4;
            case 100:
                return 5;
            default:
                return 1;
        }
    }
    transformRatingToPercent(value: number) {
        switch (value) {
            case 1:
                return 0;
            case 2:
                return 25;
            case 3:
                return 50;
            case 4:
                return 75;
            case 5:
                return 100;
            default:
                return 0;
        }
    }

    onEdit() {
        this.addPositionSpecificCategory = false;
        this.view = 'default';
        this.editMarks = true;
    }
    selectSpecificRatingVisability(result) {
        this.contentLoading = true;
        const data: any = {
            show_position_rating: result
        };
        if (result) {
            this.addPositionSpecificCategory = true;
        }
        console.log(data);
        this.candidateService.updateFeedbackPositionRatingCategories(this.jobId, data).subscribe(
            (response: any) => {
                console.log(response);
                this.contentLoading = false;
                this.alreadySelectedPositionRating = true;
                this.showPositionRating = result ? true : false;
            },
            (err) => {
                console.error(err);
            }
        );
    }
}
