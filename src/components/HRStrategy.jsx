import React, { useState, useEffect } from 'react';
import { 
  Target, Users, GraduationCap, TrendingUp, DollarSign, 
  ChevronDown, ChevronUp, CheckSquare, Square, Save, Loader2, FileText,
  BarChart2, UserPlus, Heart, Zap, Map, PieChart
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const HRStrategy = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [progressData, setProgressData] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(null);

  // --- DEFINISI 8 MODUL STRATEGIS HR (ENTERPRISE GRADE) ---
  const strategies = [
    {
      id: 'workforce_analytics',
      title: '1. Workforce Analytics & Planning',
      icon: BarChart2,
      color: 'blue',
      description: 'Perencanaan jumlah tenaga kerja berbasis data & prediksi kebutuhan masa depan.',
      steps: [
        'Data Collection (Kumpulkan data historis)',
        'Data Integration (Satukan sumber data)',
        'Analysis (Analisa rasio & tren)',
        'Insights Generation (Temukan pola)',
        'Action Planning (Rencana pemenuhan)'
      ],
      metrics: ['Headcount Planning Dashboard', 'Skill Gap Analysis', 'Attrition Prediction Model']
    },
    {
      id: 'talent_acquisition',
      title: '2. Talent Acquisition Intelligence',
      icon: UserPlus,
      color: 'indigo',
      description: 'Sistem rekrutmen cerdas dari sourcing hingga onboarding.',
      steps: [
        'Requisition (Permintaan SDM)',
        'Sourcing (Pencarian Kandidat)',
        'Screening (Seleksi Awal)',
        'Interview Process',
        'Offering & Negotiation',
        'Onboarding Process'
      ],
      metrics: ['Recruitment Funnel Analytics', 'Candidate Quality Scoring', 'Hiring Manager Performance']
    },
    {
      id: 'performance_mgmt',
      title: '3. Performance Management System',
      icon: TrendingUp,
      color: 'green',
      description: 'Pengelolaan kinerja berkelanjutan dan penyelarasan tujuan (OKR/KPI).',
      steps: [
        'Goal Setting (KPI/OKR)',
        'Continuous Feedback Loop',
        'Mid-Year Review',
        'Annual Review & Calibration',
        'Rating Distribution',
        'Reward Allocation'
      ],
      metrics: ['Performance Distribution (Bell Curve)', 'Goal Alignment Tracker', '9-Box Grid Talent Review']
    },
    {
      id: 'learning_dev',
      title: '4. Learning & Development Intelligence',
      icon: GraduationCap,
      color: 'yellow',
      description: 'Pengembangan kompetensi dan perencanaan karir berbasis gap analysis.',
      steps: [
        'Training Needs Analysis (TNA)',
        'Program Design & Curriculum',
        'Enrollment & Delivery',
        'Assessment & Scoring',
        'Impact Measurement',
        'ROI Analysis'
      ],
      metrics: ['Training Effectiveness Dashboard', 'Career Path Simulator', 'Leadership Pipeline Analysis']
    },
    {
      id: 'comp_ben',
      title: '5. Compensation & Benefits Analytics',
      icon: DollarSign,
      color: 'red',
      description: 'Strategi remunerasi kompetitif dan optimalisasi total rewards.',
      steps: [
        'Market Benchmarking',
        'Salary Structure Design',
        'Individual Compensation Review',
        'Budget Allocation',
        'Merit/Bonus Distribution',
        'Analysis & Adjustment'
      ],
      metrics: ['Compensation Competitiveness (Compa-ratio)', 'Total Rewards Optimization', 'Budget Planning & Forecasting']
    },
    {
      id: 'engagement_culture',
      title: '6. Employee Engagement & Culture',
      icon: Heart,
      color: 'pink',
      description: 'Pengukuran keterlibatan karyawan dan kesehatan budaya organisasi.',
      steps: [
        'Survey Design',
        'Distribution & Collection',
        'Data Analysis',
        'Action Planning',
        'Implementation',
        'Progress Monitoring'
      ],
      metrics: ['Engagement Score (eNPS)', 'Sentiment Analysis (NLP)', 'Action Plan Tracker']
    },
    {
      id: 'strategic_planning',
      title: '7. Strategic Workforce Planning',
      icon: Map,
      color: 'purple',
      description: 'Penyelarasan strategi SDM dengan visi jangka panjang bisnis.',
      steps: [
        'Business Strategy Review',
        'Workforce Supply Analysis',
        'Workforce Demand Forecast',
        'Gap Analysis',
        'Strategy Development',
        'Monitoring & Adjustment'
      ],
      metrics: ['Scenario Planning Tool', 'Critical Role Analysis', 'Diversity & Inclusion Metrics']
    },
    {
      id: 'hr_ops',
      title: '8. HR Operations Efficiency',
      icon: Zap,
      color: 'orange',
      description: 'Optimalisasi proses operasional HR dan layanan karyawan.',
      steps: [
        'Request Submission',
        'Routing & Assignment',
        'Processing',
        'Approval Workflow',
        'Execution',
        'Closure & Analytics'
      ],
      metrics: ['Service Level Tracking (SLA)', 'Process Automation ROI', 'Ticket Resolution Metrics']
    }
  ];

  // --- 1. LOAD DATA DARI SUPABASE ---
  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          setLoading(false);
          return;
      }

      const { data, error } = await supabase
        .from('strategy_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
          // Ignore error if table not ready, just log
          console.error('Error fetching strategy:', error.message);
      } else {
          const progressMap = {};
          data.forEach(item => {
            progressMap[item.strategy_id] = item;
          });
          setProgressData(progressMap);
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. ACTION: CHECKLIST ---
  const handleToggleStep = async (strategyId, stepIndex) => {
    const currentData = progressData[strategyId] || { completed_steps: [] };
    let newSteps = [...(currentData.completed_steps || [])];

    if (newSteps.includes(stepIndex)) {
      newSteps = newSteps.filter(idx => idx !== stepIndex);
    } else {
      newSteps.push(stepIndex);
    }

    // Optimistic Update
    setProgressData(prev => ({
      ...prev,
      [strategyId]: { ...prev[strategyId], completed_steps: newSteps, status: 'active' }
    }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('strategy_progress')
        .upsert({
          user_id: user.id,
          strategy_id: strategyId,
          completed_steps: newSteps,
          status: 'active',
          updated_at: new Date()
        }, { onConflict: 'user_id, strategy_id' });
    } catch (error) {
      console.error('Gagal simpan step:', error.message);
    }
  };

  // --- 3. ACTION: NOTES ---
  const handleSaveNote = async (strategyId, noteText) => {
    setSavingNote(strategyId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentSteps = progressData[strategyId]?.completed_steps || [];

      await supabase
        .from('strategy_progress')
        .upsert({
          user_id: user.id,
          strategy_id: strategyId,
          notes: noteText,
          completed_steps: currentSteps,
          status: 'active'
        }, { onConflict: 'user_id, strategy_id' });
      
      setProgressData(prev => ({
        ...prev,
        [strategyId]: { ...prev[strategyId], notes: noteText }
      }));

    } catch (error) {
      console.error('Gagal simpan catatan:', error.message);
    } finally {
      setTimeout(() => setSavingNote(null), 1000);
    }
  };

  // Helper Styles
  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', progress: 'bg-blue-600' },
      indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', progress: 'bg-indigo-600' },
      green: { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', progress: 'bg-emerald-600' },
      yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', progress: 'bg-yellow-500' },
      red: { bg: 'bg-rose-600', light: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', progress: 'bg-rose-600' },
      pink: { bg: 'bg-pink-600', light: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', progress: 'bg-pink-600' },
      purple: { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', progress: 'bg-purple-600' },
      orange: { bg: 'bg-orange-600', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', progress: 'bg-orange-600' },
    };
    return colors[color] || colors.blue;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat Sistem Strategis...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Strategic Blueprint</h1>
        <p className="text-gray-600">Peta jalan transformasi HR Enterprise: Dari Operasional ke Strategis.</p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const colors = getColorClasses(strategy.color);
          const myProgress = progressData[strategy.id] || { completed_steps: [] };
          const percent = Math.round((myProgress.completed_steps.length / strategy.steps.length) * 100);

          return (
            <div key={strategy.id} className={`${colors.light} border ${colors.border} rounded-xl p-4 relative overflow-hidden transition-all hover:shadow-md cursor-default`}>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/60 ${colors.text}`}>
                  {percent}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-xs md:text-sm line-clamp-2 min-h-[2.5em]">
                {strategy.title.split('. ')[1]}
              </h3>
              
              {/* Progress Bar Mini */}
              <div className="w-full bg-gray-200/50 rounded-full h-1 mt-3">
                <div className={`${colors.progress} h-1 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Accordion */}
      <div className="space-y-4">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const colors = getColorClasses(strategy.color);
          const isExpanded = expandedSection === strategy.id;
          
          const myData = progressData[strategy.id] || { completed_steps: [], notes: '' };
          const completedSteps = myData.completed_steps || [];
          const progressPercent = Math.round((completedSteps.length / strategy.steps.length) * 100);

          return (
            <div key={strategy.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : strategy.id)}
                className={`w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colors.bg} text-white shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-bold text-gray-800">{strategy.title}</h2>
                    <p className="text-sm text-gray-500 hidden md:block">{strategy.description}</p>
                    {/* Mobile Progress Text */}
                    <div className="md:hidden flex items-center gap-2 mt-1">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className={`${colors.progress} h-1.5 rounded-full`} style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Progress</span>
                      <div className="font-bold text-gray-700">{progressPercent}% Selesai</div>
                    </div>
                    {/* Circular Progress Placeholder could go here */}
                  </div>
                  {isExpanded ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 border-t border-gray-100 animate-fade-in">
                  <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* KOLOM 1: CHECKLIST ALUR PROSES */}
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Target className="w-4 h-4" /> Alur Bisnis Proses
                        </h3>
                        <div className="space-y-3">
                          {strategy.steps.map((step, idx) => {
                            const isDone = completedSteps.includes(idx);
                            return (
                              <div 
                                key={idx} 
                                onClick={() => handleToggleStep(strategy.id, idx)}
                                className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer border transition-all group ${
                                  isDone 
                                    ? 'bg-green-50 border-green-200 shadow-sm' 
                                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                }`}
                              >
                                <div className={`flex-shrink-0 transition-colors ${isDone ? 'text-green-600' : 'text-gray-300 group-hover:text-indigo-400'}`}>
                                  {isDone ? <CheckSquare className="w-6 h-6"/> : <Square className="w-6 h-6"/>}
                                </div>
                                <div className="flex-1">
                                  <span className={`text-sm font-medium ${isDone ? 'text-green-800' : 'text-gray-700'}`}>
                                    {step}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* KOLOM 2: KOMPONEN & NOTES */}
                    <div className="space-y-6">
                      
                      {/* Komponen Utama / Metrics */}
                      <div className={`rounded-xl p-5 border ${colors.light} ${colors.border}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${colors.text}`}>
                          <PieChart className="w-4 h-4" /> Komponen Utama
                        </h3>
                        <ul className="space-y-2">
                          {strategy.metrics.map((metric, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.bg}`}></div>
                              <span>{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Notes Section */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Catatan Implementasi
                        </h3>
                        <textarea
                          className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                          rows="6"
                          placeholder={`Catatan strategi untuk ${strategy.title}...`}
                          defaultValue={myData.notes || ''}
                          onBlur={(e) => handleSaveNote(strategy.id, e.target.value)}
                        ></textarea>
                        <div className="mt-2 text-right h-5">
                          {savingNote === strategy.id && (
                            <span className="text-xs text-indigo-600 flex items-center justify-end gap-1 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin"/> Menyimpan...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HRStrategy;