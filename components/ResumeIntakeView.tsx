
import React, { useState } from 'react';
import { ResumeProfile } from '../types';
import { generateResumeProfile } from '../services/geminiService';
import LoadingSpinner from './shared/LoadingSpinner';
import { BriefcaseIcon } from './shared/IconComponents';
import { useCredits } from '../contexts/CreditContext';
import { TOOL_COSTS } from '../constants';

interface ResumeIntakeViewProps {
  onProfileGenerated: (profile: ResumeProfile) => void;
}

const placeholderResume = `John Doe\njohn.doe@email.com | 555-123-4567 | linkedin.com/in/johndoe\n\nProfessional Summary\nA highly motivated Senior Software Engineer with over 8 years of experience in building scalable web applications. Proficient in React, Node.js, and cloud-native technologies.\n\nWork Experience\nSenior Software Engineer | Tech Corp | Aug 2020 - Present\n- Led a team of 5 engineers to develop a new microservices architecture.\n- Reduced API latency by 30% through performance optimization.\n\nSoftware Engineer | Web Solutions Inc. | Jun 2016 - Jul 2020\n- Developed and maintained front-end components using React and Redux.\n- Collaborated with UX/UI designers to implement responsive designs.\n\nEducation\nBachelor of Science in Computer Science | State University | 2016\n\nSkills\nJavaScript, React, Node.js, Python, AWS, Docker, Kubernetes`;

const ResumeIntakeView: React.FC<ResumeIntakeViewProps> = ({ onProfileGenerated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const { credits, spendCredits, showPaywall } = useCredits();
  const cost = TOOL_COSTS['ROBERTA'] ?? 0;

  const handleGenerate = async () => {
    if (credits < cost) {
      showPaywall();
      return;
    }

    setIsLoading(true);
    setError(null);
    setProfile(null);
    try {
      const result = await generateResumeProfile(text || placeholderResume);
      spendCredits(cost);
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (profile) {
        onProfileGenerated(profile);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-dark-card shadow-lg rounded-xl border border-dark-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <BriefcaseIcon className="w-8 h-8 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-white">Step 1: Resume Intake</h2>
              <p className="text-dark-text-secondary">Paste your resume to begin the optimization process.</p>
            </div>
          </div>
          <div className="mb-4 p-3 bg-yellow-900/40 border border-yellow-500/50 text-yellow-300 rounded-lg text-sm">
             <strong>Note:</strong> This tool provides suggestions and is not a guarantee of employment. Always tailor your resume to specific job applications.
           </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderResume}
            className="w-full h-60 p-4 bg-gray-900 border border-dark-border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none transition-shadow duration-200 resize-y"
            disabled={isLoading || !!profile}
          />
          <p className="text-sm text-dark-text-secondary mt-2">
            Paste your full resume text, or leave blank to use the example.
          </p>
        </div>

        {!profile && (
            <div className="bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-4">
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-6 py-2 bg-accent text-gray-900 font-semibold rounded-lg hover:bg-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
            >
                {isLoading ? <LoadingSpinner size={20} /> : <BriefcaseIcon className="w-5 h-5" />}
                {isLoading ? 'Parsing...' : `Parse Resume (-${cost} Credits)`}
            </button>
            </div>
        )}
        
        {error && <div className="p-4 bg-red-900/50 text-red-300 m-6 rounded-lg">{error}</div>}

        {profile && (
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-white">Review Your Parsed Resume</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {/* This could be built out with editable fields like other tools, but for simplicity, we'll show it as read-only. */}
                <DisplaySection title="Contact Info">
                    <p>{profile.contactInfo.name}</p>
                    <p>{profile.contactInfo.email} | {profile.contactInfo.phone}</p>
                    <p>{profile.contactInfo.linkedin}</p>
                </DisplaySection>
                <DisplaySection title="Professional Summary">
                    <p>{profile.summary}</p>
                </DisplaySection>
                 <DisplaySection title="Work Experience">
                    {profile.workExperience.map((job, idx) => (
                        <div key={idx} className="mb-2">
                            <h4 className="font-bold text-dark-text">{job.role} at {job.company}</h4>
                            <p className="text-sm text-dark-text-secondary">{job.duration}</p>
                            <ul className="list-disc pl-5 mt-1">
                                {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        </div>
                    ))}
                </DisplaySection>
                <DisplaySection title="Education">
                     {profile.education.map((edu, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-dark-text">{edu.degree}</h4>
                            <p className="text-sm text-dark-text-secondary">{edu.institution} ({edu.year})</p>
                        </div>
                     ))}
                </DisplaySection>
                 <DisplaySection title="Skills">
                    <p>{profile.skills.join(', ')}</p>
                </DisplaySection>
            </div>
             <p className="text-sm text-dark-text-secondary mt-2">Parsed resume is read-only for now. You can get feedback in the chat step!</p>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleProceed}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors duration-200"
                >
                    Proceed to Optimization
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DisplaySection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-accent/80 text-sm mb-1 block">{title}</h4>
        <div className="p-3 bg-gray-900/70 border border-dark-border rounded-lg text-dark-text">
            {children}
        </div>
    </div>
);

export default ResumeIntakeView;
