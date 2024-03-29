import { ITag } from './job';

export class Candidate {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    stage: any;
    score?: any;
    skills?: any;
    matching?: any;
    resume_file?: string;
    resume_file_new?: string;
    resume_link?: string;
    resume_link_new?: string;
    questions?: any;
    source?: string;
    feedback?: any;
    isDdEmployee?: boolean;
    employment_history?: any;
    audit?: any;
    created_at?: number;
    stages_data?: any;
    markedAsUnsuccessful?: any;
    profile_image?: any;
    profile_image_link?: any;
    created_at_rel?: any;
    updated_at_rel?: any;
    job_specific?: any;
    read?: string[];
    application_completed?: any;
    tags?: ITag[];
    hasUser: boolean;
    hasUserReviewed: boolean;
    assignments?: any;
    blockData?: any;
    applicaitons?: any[];
    opportunities?: any[];
}
