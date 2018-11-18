import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CandidateService } from '../../services/candidate.service';
import { UtilitiesService } from '../../services/utilities.service';
import { User } from '../../models/user';
import { State } from '../../reducers/user/user.reducer';
import { Store } from '@ngrx/store';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-candidate-item-timeline',
    templateUrl: './candidate-item-timeline.component.html',
    styleUrls: ['./candidate-item-timeline.component.scss']
})
export class CandidateItemTimelineComponent implements OnInit {
    @Input() candidate;
    @Input() jobId;
    feedForm: FormGroup;
    contentLoading = false;
    timeline = [];
    user: User;
    users: User[];
    constructor(private fb: FormBuilder,
        private candidateService: CandidateService,
        private userService: UserService,
        private store: Store<State>,
        private utilities: UtilitiesService) { }

    ngOnInit() {
        this.initForm();
        this.store.select('user').subscribe((user: User) => {
            this.user = user;
        });
        this.populateFeed();
    }
    populateFeed() {
        // console.log(this.timeline);
        this.userService.getUsers()
            .subscribe((users: User[]) => {
                this.users = users;
                if (this.candidate.feed && this.candidate.feed[this.jobId]) {
                    this.timeline = this.candidate.feed[this.jobId];
                    this.timeline.map((item) => {
                        const itemIndex = this.users.find((c) => c.id === item.sender_id);
                        if (itemIndex) {
                            item.icon_url = itemIndex.icon_url;
                            item.first_name = itemIndex.first_name;
                            item.last_name = itemIndex.last_name;
                            // console.log('1', itemIndex);
                        } else {
                            // console.log('2');
                        }
                        return item;
                    }).sort((a: any, b: any) => {
                        return b.created - a.created;
                    });
                }
            });
    }
    initForm() {
        this.feedForm = this.fb.group({
            description: ['', Validators.required],
        });

    }
    onSaveFeed() {
        this.contentLoading = true;
        const data = {
            comments: {
                id: this.utilities.generateUID(10).toLowerCase(),
                text: this.feedForm.value.description,
                created: new Date().getTime(),
                sender_id: this.user.id
            }
        };
        if (this.feedForm.valid) {
            this.candidateService.saveFeed(this.jobId, this.candidate.id, data).subscribe((response) => {
                this.feedForm.reset();
                this.contentLoading = false;
                this.timeline.unshift(Object.assign({ 'icon_url': this.user.icon_url, 'created_at_rel': 'Today', 'first_name': this.user.first_name, 'last_name': this.user.last_name }, data.comments));
            }, (err) => {
                console.error(err);
            });
        }

    }

}