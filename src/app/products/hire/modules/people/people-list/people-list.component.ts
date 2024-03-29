import { Component, OnInit } from '@angular/core';
import * as closest from 'closest';

import { CandidateService, JobService, UtilitiesService } from '../../../../../core/services';

@Component({
    selector: 'app-people-list',
    templateUrl: './people-list.component.html',
    styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent implements OnInit {
    list;
    filteredList = [];
    contentLoading = true;
    chunkRequestInProgress = false;
    lastCandidate = {
        first_name: '',
        last_name: ''
    };
    searchedValue = {
        visible: false,
        value: null
    };
    candidatesCompleted = false;
    selectedAll = false;
    amountCandidates;
    filter = [];
    countries: any[] = [];
    educationOptions = [
        { label: 'High School or Equivalent', value: 'school' },
        { label: 'Certification', value: 'certification' },
        { label: 'Vocational', value: 'vocational' },
        { label: 'Associate Degree', value: 'associate' },
        { label: 'Bachelors Degree', value: 'bachelors' },
        { label: 'Masters Degree', value: 'masters' },
        { label: 'Professional', value: 'professional' }
    ];

    constructor(
        private jobService: JobService,
        private candidateService: CandidateService,
        private utilities: UtilitiesService
    ) {
        this.utilities.getCountries().subscribe((countries: Array<{ name: string; code: string }>) => {
            this.countries = countries;
        });

        this.chunkRequestInProgress = true;
        this.jobService.getCandidatesChunk('first', 100).subscribe(
            (candidates: any[]) => {
                this.list = (candidates || []).map((item) => ({ ...item, active: item.job_id && item.job_id.length }));
                this.filteredList = this.list.slice(0);
                this.contentLoading = false;
                this.candidatesCompleted = true;
                this.lastCandidate = {
                    first_name:
                        this.list[this.list.length - 1] && this.list[this.list.length - 1].first_name
                            ? this.list[this.list.length - 1].first_name
                            : '',
                    last_name:
                        this.list[this.list.length - 1] && this.list[this.list.length - 1].last_name
                            ? this.list[this.list.length - 1].last_name
                            : ''
                };
                this.jobService.getCandidatesAmount().subscribe((amount: number) => {
                    this.amountCandidates = amount;
                });
                this.chunkRequestInProgress = false;
            },
            (errorResponse) => {
                console.error(errorResponse);
                this.chunkRequestInProgress = false;
            }
        );

        this.jobService.getSearchValueForPeople().subscribe((searchedValue) => {
            if (searchedValue) {
                this.searchedValue = {
                    visible: true,
                    value: searchedValue
                };
                if (
                    this.lastCandidate.first_name &&
                    this.lastCandidate.first_name.length &&
                    !this.chunkRequestInProgress
                ) {
                    this.fetchCandidatesChunk(this.lastCandidate.first_name);
                }
            } else if (this.list && this.list.length) {
                this.searchedValue = {
                    visible: false,
                    value: null
                };
                this.filteredList = this.list.slice(0);
            }
        });
    }

    ngOnInit() {}

    getCandidatesChunk() {
        console.log('getCandidateChunk', this.chunkRequestInProgress);
        if (this.lastCandidate.first_name && this.lastCandidate.first_name.length && !this.chunkRequestInProgress) {
            this.fetchCandidatesChunk(this.lastCandidate.first_name);
        }
    }

    fetchCandidatesChunk(first = 'first', len = 100) {
        if (first === 'first') {
            this.contentLoading = true;
            this.list = [];
            this.filteredList = [];
        } else this.candidatesCompleted = false;
        this.chunkRequestInProgress = true;
        this.jobService.getCandidatesChunk(first, len).subscribe(
            (candidates: any) => {
                if (candidates && candidates.length > 0) {
                    candidates.forEach((item) => {
                        if (this.selectedAll) {
                            item.selected = true;
                        }
                        item.active = item.job_id && item.job_id.length;
                        this.list.push(item);
                        this.filteredList.push(item);
                    });
                    this.lastCandidate = {
                        first_name: this.list[this.list.length - 1].first_name,
                        last_name: this.list[this.list.length - 1].last_name
                    };
                    this.jobService.getCandidatesAmount().subscribe((amount: number) => {
                        this.amountCandidates = amount;
                    });
                    this.filterCandidates();
                }
                if (this.searchedValue.visible) {
                    this.contentLoading = true;
                    this.filteredList = this.list.filter((c) => {
                        if (c.first_name && c.last_name) {
                            const fullname = c.first_name.toLowerCase().trim() + ' ' + c.last_name.toLowerCase().trim();
                            const query = this.searchedValue.value.toLowerCase().trim();
                            const queryWords = query.split(' ').filter((word) => word);
                            const matched = queryWords.every((word) => fullname.indexOf(word) !== -1);
                            const emailIncluded = c.email.toLowerCase().includes(query);
                            return matched || emailIncluded;
                        }
                    });
                    setTimeout(() => {
                        this.contentLoading = false;
                    }, 1500);
                }
                this.candidatesCompleted = true;
                this.chunkRequestInProgress = false;
                this.contentLoading = false;
            },
            (errorResponse) => {
                console.error(errorResponse);
                this.candidatesCompleted = true;
                this.chunkRequestInProgress = false;
                this.contentLoading = false;
            }
        );
    }

    onScroll() {
        console.log('onScroll => getCandidatesChunk');
        setTimeout(() => {
            this.getCandidatesChunk();
        }, 1000);
    }

    onItemsBulkRemove() {
        this.contentLoading = true;
        const itemsToRemove = this.filteredList.filter((item) => item.selected).map((item) => item.id);
        console.log('Remove: ', itemsToRemove);
        this.candidateService.bulkDelete(itemsToRemove).subscribe(
            (res: any) => {
                console.log('Removed: ', res);
                this.fetchCandidatesChunk();
            },
            (errorResponse) => {
                console.error(errorResponse);
                this.contentLoading = false;
            }
        );
    }

    onItemClick(event, item) {
        event.preventDefault();
        const target = event.target;
        const escapeDD = closest(event.target, '[data-escape-click]');
        if (escapeDD) {
            // console.log('DO NOTHING');
        } else {
            console.log('onItemClick', item);
        }
    }

    onItemSeletectedChange() {
        this.calculateSelectedItems();
    }

    get selectedItems() {
        return this.filteredList.filter((item) => item.selected).length;
    }

    private calculateSelectedItems() {
        if (!this.selectedItems) {
            this.selectedAll = false;
        }
    }

    onSelectAllChange() {
        if (this.selectedAll) {
            this.filteredList.forEach((item) => !item.active && (item.selected = true));
        } else {
            this.filteredList.forEach((item) => (item.selected = false));
        }
        this.calculateSelectedItems();
    }

    onFilterChanges(value) {
        console.log('onFilterChanges', value);
        this.filter = value;
        this.candidatesCompleted = false;
        this.filterCandidates();
    }

    filterCandidates() {
        if (this.filter.length) {
            console.log('=> Filtering results');
            // Filter candidates
            this.filteredList = this.list.slice(0).filter((c) => {
                const filterValues = [];
                this.filter.forEach((f) => {
                    // City filter
                    if (f.type === 'city') {
                        const filterCities = f.value.map((item) => item.toLowerCase());
                        const candidateCity = c.location_city ? c.location_city.toLowerCase() : 'unspecified';
                        if (filterCities.indexOf(candidateCity) === -1) {
                            // console.log('filtered', c.id, candidateCity);
                            filterValues.push(false);
                        } else {
                            filterValues.push(true);
                        }
                    }
                    // Country filter
                    if (f.type === 'country') {
                        const filterCountries = f.value
                            .map((item) => {
                                const country = this.countries.find(
                                    (countryItem) =>
                                        countryItem.name.toLowerCase() === item.trim().toLowerCase() ||
                                        countryItem.code.toLowerCase() === item.trim().toLowerCase()
                                );

                                return country ? country.name.toLowerCase() : null;
                            })
                            .filter((val) => val);

                        let candidateCountry = 'unspecified';
                        if (c.location_country) {
                            const listCountry = this.countries.find(
                                (countryItem) =>
                                    countryItem.name.toLowerCase() === c.location_country.trim().toLowerCase() ||
                                    countryItem.code.toLowerCase() === c.location_country.trim().toLowerCase()
                            );
                            if (listCountry) {
                                candidateCountry = listCountry.name.toLowerCase();
                            }
                        }

                        if (filterCountries.indexOf(candidateCountry) === -1) {
                            filterValues.push(false);
                        } else {
                            filterValues.push(true);
                        }
                    }

                    // Education filter
                    if (f.type === 'education') {
                        const filterVal = f.value;
                        const candidateEducation = c.education_history
                            ? c.education_history.map((ed) => ({
                                  major: ed.area_of_study || 'unspecified',
                                  school: ed.school || 'unspecified',
                                  degree: ed.degree || 'unspecified'
                              }))
                            : null;

                        const foundFilterValues = candidateEducation.filter((ce) => {
                            let valid = true;
                            if (filterVal.degree && ce.degree.indexOf(filterVal.degree) === -1) {
                                valid = false;
                            }
                            if (
                                filterVal.major &&
                                ce.major.toLowerCase().indexOf(filterVal.major.toLowerCase()) === -1
                            ) {
                                valid = false;
                            }
                            if (
                                filterVal.school &&
                                ce.school.toLowerCase().indexOf(filterVal.school.toLowerCase()) === -1
                            ) {
                                valid = false;
                            }
                        });
                        if (!foundFilterValues.length) {
                            filterValues.push(false);
                        } else {
                            filterValues.push(true);
                        }
                    }

                    // Employers
                    if (f.type === 'employers') {
                        const filterVal = f.value.map((v) => v.toLowerCase());

                        if (c.employment_history) {
                            const employers = c.employment_history.map(
                                (emp) => `${emp.title.toLowerCase()}, ${emp.company.toLowerCase()}`
                            );
                            const foundFilterValues = filterVal.some((fv) => {
                                return employers.find((emp) => emp.indexOf(fv) !== -1);
                            });
                            filterValues.push(foundFilterValues);
                        } else {
                            filterValues.push(false);
                        }
                    }

                    // experience
                    if (f.type === 'experience') {
                        const filterVal = f.value;
                        if (c.years_of_experience) {
                            if (filterVal.min && filterVal.max) {
                                if (c.years_of_experience >= filterVal.min && c.years_of_experience <= filterVal.max) {
                                    filterValues.push(true);
                                } else {
                                    filterValues.push(false);
                                }
                            } else if (!filterVal.min && filterVal.max) {
                                if (c.years_of_experience <= filterVal.max) {
                                    filterValues.push(true);
                                } else {
                                    filterValues.push(false);
                                }
                            } else if (filterVal.min && !filterVal.max) {
                                if (c.years_of_experience >= filterVal.min) {
                                    filterValues.push(true);
                                } else {
                                    filterValues.push(false);
                                }
                            }
                        } else {
                            filterValues.push(false);
                        }
                    }

                    // skills
                    if (f.type === 'skills') {
                        const filterVal = f.value.name.toLowerCase().trim();
                        if (c.skills && c.skills.length) {
                            if (c.skills.map((s) => s.toLowerCase()).indexOf(filterVal) !== -1) {
                                filterValues.push(true);
                            } else {
                                filterValues.push(false);
                            }
                        } else {
                            filterValues.push(false);
                        }
                    }
                });

                // console.log('FILTER VALUES:', filterValues);
                return filterValues.every((fv) => fv);
            });

            console.log('🦹🏻‍♂️ Filtered results:', this.filteredList.length);
            if (
                this.filteredList.length &&
                this.filteredList.length < 10 &&
                !this.candidatesCompleted &&
                this.utilities.isBottomOfPage()
            ) {
                console.log('... Get new chunk', this.filteredList.length);
                setTimeout(() => this.getCandidatesChunk(), 2000);
            }
        } else {
            console.log('=> Show full list');
            // Show full list
            this.filteredList = this.list.slice(0);
        }
    }
}
