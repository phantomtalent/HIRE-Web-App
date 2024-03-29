import { Stage } from './stage';

export interface ITag {
    hash: string;
    color: string;
    label?: string;
}

export class Job {
    id?: string;
    title: string;
    company: string;
    ref: string;
    location: string;
    is_remote: boolean;
    job_type: string;
    number_of_hires: string | number;
    education: string;
    experience: string;
    single_salary: boolean;
    salary_from?: number;
    salary_to?: number;
    salary_period: string;
    hide_salary: boolean;
    description: string;
    requirements: string;
    job_role: string;
    job_listing: string;
    resume_upload_required: boolean;
    email_missing_info: boolean;
    email_suggestions: boolean;
    application_field_name: string;
    application_field_email: string;
    application_field_phone: string;
    application_field_current_location: string;
    application_field_employment_equity_status: string;
    application_field_gender: string;
    application_field_experience_summary: string;
    application_field_work_history: string;
    application_field_education: string;
    application_field_cover_letter: string;
    questionnaire: string;
    questions?: any[];
    hiring_managers: string[];
    recruiters: string[];
    default_email_name: string;
    step_completed?: number;
    status?: string;
    created?: boolean;
    stages?: Stage[];
    owner?: string;
    show_position_rating?: boolean;
    location_city?: string;
    location_country?: string;
    pool?: boolean;
    tags?: ITag[];
    sovren_parsed_job?: object;
    sovren_categories?: {
        AppliedCategoryWeights?: any[];
        SuggestedCategoryWeights?: any[];
    };
}
