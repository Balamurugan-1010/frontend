import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Check,
  X,
  Building,
  GraduationCap,
  Loader2,
  FileText,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import { SearchableCollegeDropdown } from '../components/SearchableCollegeDropdown';
import { jobRoleService, collegeService } from '../services/api';
import { JobRole, College } from '../types';

export const ManagerJobRolesPage: React.FC = () => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [eligibleDepts, setEligibleDepts] = useState(
    'Computer Science and Engineering,Information Technology'
  );
  const [expReq, setExpReq] = useState('Freshers / 0-1 Years');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');

  // Skills input state
  const [skillsList, setSkillsList] = useState<{ skill_name: string; required: boolean }[]>([
    { skill_name: 'JavaScript', required: true },
    { skill_name: 'React', required: true },
    { skill_name: 'Node.js', required: true },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [isSkillRequired, setIsSkillRequired] = useState(true);

  // JD PDF upload state
  const [isUploadingJd, setIsUploadingJd] = useState(false);
  const [jdUploadStatus, setJdUploadStatus] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, collegesData] = await Promise.all([
        jobRoleService.getAll(),
        collegeService.getAll(),
      ]);
      setJobRoles(rolesData);
      setColleges(collegesData);
    } catch (err) {
      console.error('Failed to load job roles data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      setSkillsList([
        ...skillsList,
        { skill_name: newSkillName.trim(), required: isSkillRequired },
      ]);
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsList(skillsList.filter((_, idx) => idx !== index));
  };

  const handleJdPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploadingJd(true);
        setJdUploadStatus('Extracting text & detecting technical skills...');
        const res = await jobRoleService.parseJdPdf(file);
        setJobDesc(res.extracted_text);
        if (res.detected_skills && res.detected_skills.length > 0) {
          const autoSkills = res.detected_skills.map((s) => ({
            skill_name: s,
            required: true,
          }));
          setSkillsList((prev) => {
            const existing = new Set(prev.map((p) => p.skill_name.toLowerCase()));
            const toAdd = autoSkills.filter((a) => !existing.has(a.skill_name.toLowerCase()));
            return [...prev, ...toAdd];
          });
        }
        setJdUploadStatus(`Extracted ${res.detected_skills.length} skills automatically from PDF!`);
      } catch (err) {
        setJdUploadStatus('Failed to parse JD PDF');
      } finally {
        setIsUploadingJd(false);
      }
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !companyName.trim() || !jobDesc.trim()) return;

    try {
      await jobRoleService.create({
        company_name: companyName.trim(),
        role_name: roleName.trim(),
        job_description: jobDesc.trim(),
        minimum_cgpa: parseFloat(minCgpa) || 7.0,
        eligible_departments: eligibleDepts.trim(),
        experience_requirement: expReq.trim(),
        college_id: selectedCollegeId ? parseInt(selectedCollegeId) : undefined,
        required_skills: skillsList,
      });

      setIsModalOpen(false);
      // Reset form
      setRoleName('');
      setJobDesc('');
      loadData();
    } catch (err) {
      alert('Failed to create job role');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this job role?')) {
      try {
        await jobRoleService.delete(id);
        setJobRoles(jobRoles.filter((r) => r.id !== id));
      } catch (err) {
        alert('Failed to delete job role');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="Campus Job Roles"
          subtitle="Define recruitment requirements, skills, minimum CGPA, and job descriptions"
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Job Role</span>
            </button>
          }
        />

        <main className="p-8 space-y-8 max-w-7xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-2" />
              <p className="text-xs text-[#64748B]">Loading job roles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white rounded-3xl border border-[#E2E8F0] p-6 subtle-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                        {role.company_name}
                      </span>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-[#1E293B]">{role.role_name}</h3>
                    <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                      {role.job_description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Min CGPA</span>
                        <span className="font-bold text-[#2563EB]">{role.minimum_cgpa.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Experience</span>
                        <span className="font-bold text-slate-800">{role.experience_requirement || 'Freshers'}</span>
                      </div>
                    </div>

                    {/* Required Skills list */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Required Technical Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.required_skills && role.required_skills.length > 0 ? (
                          role.required_skills.map((s, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                s.required
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {s.skill_name} {s.required ? '(Req)' : '(Pref)'}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Job Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-[#E2E8F0] max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#1E293B]">Create Campus Job Role</h3>
                <p className="text-xs text-[#64748B]">Define requirements for candidate screening & ranking</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HexaTech Solutions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Web Developer"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Target College (Optional)</label>
                  <SearchableCollegeDropdown
                    colleges={colleges}
                    selectedCollegeId={selectedCollegeId}
                    onChange={(collegeId) => setSelectedCollegeId(collegeId)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Minimum CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* JD PDF Auto-Parser */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                    Auto-Fill via Job Description PDF
                  </span>
                  <label className="cursor-pointer text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload JD PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleJdPdfUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {isUploadingJd && <p className="text-[11px] text-[#2563EB]">Parsing PDF JD text with PyMuPDF...</p>}
                {jdUploadStatus && <p className="text-[11px] text-emerald-700 font-medium">{jdUploadStatus}</p>}
              </div>

              {/* Job Description Text */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">Job Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste or write detailed job role description, duties, and technology expectations..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Skills Tag Management */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1E293B]">Required & Preferred Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. React, Python, Docker)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#2563EB]"
                  />
                  <select
                    value={isSkillRequired ? 'req' : 'pref'}
                    onChange={(e) => setIsSkillRequired(e.target.value === 'req')}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="req">Required</option>
                    <option value="pref">Preferred</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skillsList.map((sk, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                    >
                      <span>
                        {sk.skill_name} ({sk.required ? 'Req' : 'Pref'})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-blue-500 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                >
                  Save Job Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
