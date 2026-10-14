import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Save,
  Check,
  Code2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ManagerSidebar } from '../components/ManagerSidebar';
import { ManagerHeader } from '../components/ManagerHeader';
import { useAuth } from '../context/AuthContext';

export const ManagerSettingsPage: React.FC = () => {
  const { manager } = useAuth();

  // Scoring weights configuration state
  const [skillWeight, setSkillWeight] = useState(40);
  const [jdSimWeight, setJdSimWeight] = useState(25);
  const [projectWeight, setProjectWeight] = useState(15);
  const [expWeight, setExpWeight] = useState(10);
  const [eduWeight, setEduWeight] = useState(10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleAliases = [
    { alias: 'JS, ecmascript', canonical: 'JavaScript' },
    { alias: 'ReactJS, React.js', canonical: 'React' },
    { alias: 'NodeJS, Node.js', canonical: 'Node.js' },
    { alias: 'ML, machine learning', canonical: 'Machine Learning' },
    { alias: 'DL, deep learning', canonical: 'Deep Learning' },
    { alias: 'NLP', canonical: 'Natural Language Processing' },
    { alias: 'My SQL, psql, postgres', canonical: 'MySQL / PostgreSQL' },
    { alias: 'K8s', canonical: 'Kubernetes' },
    { alias: 'TS', canonical: 'TypeScript' },
    { alias: 'Py', canonical: 'Python' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const totalWeight = skillWeight + jdSimWeight + projectWeight + expWeight + eduWeight;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <ManagerSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <ManagerHeader
          title="System Settings & Algorithms"
          subtitle="Configure scoring weights, NLP skill normalization aliases, and recruiter preferences"
        />

        <main className="p-8 space-y-8 max-w-5xl">
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Scoring weights updated successfully!</span>
            </div>
          )}

          {/* Scoring Weights Customizer */}
          <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#2563EB]" />
                  AI Scoring Weights Engine
                </h3>
                <p className="text-xs text-[#64748B]">Adjust percentage weight for each matching factor (must sum to 100%)</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                totalWeight === 100
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                Total: {totalWeight}%
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>1. Skill Overlap Match</span>
                  <span className="text-[#2563EB] font-bold">{skillWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={skillWeight}
                  onChange={(e) => setSkillWeight(parseInt(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>2. Job Description TF-IDF Cosine Similarity</span>
                  <span className="text-[#2563EB] font-bold">{jdSimWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={jdSimWeight}
                  onChange={(e) => setJdSimWeight(parseInt(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>3. Projects Relevance</span>
                  <span className="text-[#2563EB] font-bold">{projectWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={projectWeight}
                  onChange={(e) => setProjectWeight(parseInt(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>4. Practical Experience / Internship</span>
                  <span className="text-[#2563EB] font-bold">{expWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={expWeight}
                  onChange={(e) => setExpWeight(parseInt(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>5. Academic CGPA / Department Match</span>
                  <span className="text-[#2563EB] font-bold">{eduWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={eduWeight}
                  onChange={(e) => setEduWeight(parseInt(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={totalWeight !== 100}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                Save Weight Configurations
              </button>
            </div>
          </form>

          {/* Skill Dictionary Normalization Table */}
          <div className="p-8 rounded-3xl bg-white border border-[#E2E8F0] subtle-shadow space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#2563EB]" />
                NLP Skill Normalization Dictionary
              </h3>
              <p className="text-xs text-[#64748B]">
                Automatic canonical resolution converts varied resume abbreviations into standard skills
              </p>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="p-3">Resume Variant / Alias</th>
                    <th className="p-3">Canonical Industry Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleAliases.map((a, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600">{a.alias}</td>
                      <td className="p-3 font-semibold text-[#2563EB]">{a.canonical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
