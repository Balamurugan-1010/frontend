export interface Manager {
  id: number;
  name: string;
  email: string;
  company_name: string;
  created_at?: string;
}

export interface College {
  id: number;
  name: string;
  location: string;
  total_candidates: number;
  eligible_candidates: number;
  departments: string[];
  average_cgpa: number;
}

export interface ProjectItem {
  project_name: string;
  description?: string;
}

export interface InternshipItem {
  company: string;
  description?: string;
  duration?: string;
}

export interface CertificationItem {
  name: string;
  issuer?: string;
}

export interface Candidate {
  id: number;
  candidate_code: string;
  name: string;
  email: string;
  phone: string;
  college_id: number;
  college_name: string;
  department: string;
  graduation_year: number;
  cgpa: number;
  areas_of_interest?: string;
  created_at?: string;
  skills: string[];
  projects: ProjectItem[];
  internships: InternshipItem[];
  certifications: CertificationItem[];
  has_resume: boolean;
}

export interface JobSkill {
  skill_name: string;
  required: boolean;
}

export interface JobRole {
  id: number;
  manager_id?: number;
  college_id?: number;
  company_name: string;
  role_name: string;
  job_description: string;
  minimum_cgpa: number;
  eligible_departments: string;
  experience_requirement?: string;
  created_at?: string;
  required_skills: JobSkill[];
}

export interface CandidateMatch {
  id?: number;
  candidate_id: number;
  candidate_code: string;
  candidate_name: string;
  email: string;
  phone: string;
  college_id: number;
  college_name: string;
  department: string;
  cgpa: number;
  graduation_year: number;
  match_score: number;
  skill_score: number;
  similarity_score: number;
  project_score: number;
  experience_score: number;
  education_score: number;
  matched_skills: string[];
  missing_skills: string[];
  ai_explanation: string;
  is_eligible: boolean;
  status: string;
  shortlist_id?: number;
}

export interface ShortlistEntry {
  id: number;
  candidate_id: number;
  candidate_code: string;
  candidate_name: string;
  email: string;
  phone: string;
  college_name: string;
  department: string;
  cgpa: number;
  job_role_id: number;
  role_name: string;
  company_name: string;
  status: 'Shortlisted' | 'Assessment' | 'Interview' | 'Selected' | 'Rejected';
  match_score: number;
  shortlisted_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_candidates: number;
  total_colleges: number;
  active_job_roles: number;
  shortlisted_candidates: number;
  recent_submissions: Candidate[];
  top_colleges: {
    id: number;
    name: string;
    candidates_count: number;
  }[];
}

export interface AssessmentItem {
  id: number;
  candidate_id: number;
  candidate_code: string;
  candidate_name: string;
  department: string;
  cgpa: number;
  job_role_id: number;
  role_name: string;
  assessment_type: string;
  score: number;
  status: string;
  created_at?: string;
}
