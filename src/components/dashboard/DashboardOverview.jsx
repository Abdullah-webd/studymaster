import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Brain, 
  Trophy,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [cbtResults, setCbtResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCBTResults();
  }, []);

  const fetchCBTResults = async () => {
    try {
      const response = await api.get('https://studymaster-production.up.railway.app/cbt/results');
      setCbtResults(response.data);
    } catch (error) {
      console.error('Error fetching CBT results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceStats = () => {
    if (cbtResults.length === 0) {
      return {
        averageScore: 0,
        totalTests: 0,
        improvementTrend: 0,
        weakSubjects: [],
        strongSubjects: []
      };
    }

    const totalTests = cbtResults.length;
    const averageScore = cbtResults.reduce((sum, result) => 
      sum + result.score.overall.percentage, 0) / totalTests;

    // Calculate improvement trend (last 5 vs previous 5)
    const recent = cbtResults.slice(0, 5);
    const previous = cbtResults.slice(5, 10);
    
    let improvementTrend = 0;
    if (recent.length > 0 && previous.length > 0) {
      const recentAvg = recent.reduce((sum, r) => sum + r.score.overall.percentage, 0) / recent.length;
      const previousAvg = previous.reduce((sum, r) => sum + r.score.overall.percentage, 0) / previous.length;
      improvementTrend = recentAvg - previousAvg;
    }

    // Group by subject
    const subjectScores = {};
    cbtResults.forEach(result => {
      if (!subjectScores[result.subject]) {
        subjectScores[result.subject] = [];
      }
      subjectScores[result.subject].push(result.score.overall.percentage);
    });

    const weakSubjects = [];
    const strongSubjects = [];

    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      if (avg < 60) {
        weakSubjects.push({ subject, average: avg });
      } else if (avg >= 80) {
        strongSubjects.push({ subject, average: avg });
      }
    });

    return {
      averageScore,
      totalTests,
      improvementTrend,
      weakSubjects,
      strongSubjects
    };
  };

  const stats = getPerformanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-primary-100">Ready to continue your learning journey?</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageScore > 0 ? `${Math.round(stats.averageScore)}%` : 'No data'}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Trophy className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          {stats.improvementTrend !== 0 && (
            <div className="mt-4 flex items-center">
              {stats.improvementTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${stats.improvementTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(Math.round(stats.improvementTrend))}% from last tests
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tests Taken</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-full">
              <BookOpen className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Credits</p>
              <p className="text-2xl font-bold text-gray-900">{user?.credits || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">0 days</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weak Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          
          {stats.weakSubjects.length > 0 ? (
            <div className="space-y-3">
              {stats.weakSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-gray-900">{subject.subject}</span>
                  <span className="text-red-600 font-semibold">{Math.round(subject.average)}%</span>
                </div>
              ))}
              <p className="text-sm text-gray-600 mt-3">
                Focus on these subjects to improve your overall performance.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {stats.totalTests === 0 
                  ? "Take some CBT tests to see your weak areas" 
                  : "Great job! No weak areas identified."
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Strong Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Strong Subjects</h3>
          </div>
          
          {stats.strongSubjects.length > 0 ? (
            <div className="space-y-3">
              {stats.strongSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-900">{subject.subject}</span>
                  <span className="text-green-600 font-semibold">{Math.round(subject.average)}%</span>
                </div>
              ))}
              <p className="text-sm text-gray-600 mt-3">
                Keep up the excellent work in these subjects!
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {stats.totalTests === 0 
                  ? "Take some CBT tests to identify your strong subjects" 
                  : "Keep practicing to build your strengths!"
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent CBT Results</h3>
        
        {cbtResults.length > 0 ? (
          <div className="space-y-3">
            {cbtResults.slice(0, 5).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{result.subject} - {result.examType}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    result.score.overall.percentage >= 70 ? 'text-green-600' : 
                    result.score.overall.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(result.score.overall.percentage)}%
                  </p>
                  <p className="text-sm text-gray-500">{result.score.overall.grade}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No CBT tests taken yet</p>
            <p className="text-sm text-gray-400">Start with the CBT tab to take your first test!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardOverview;