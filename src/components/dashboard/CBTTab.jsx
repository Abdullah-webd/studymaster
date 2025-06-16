import { useState, useEffect } from 'react';
import { Monitor, Clock, Trophy, Play, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CBTTab = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState('WAEC');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cbtSession, setCbtSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchResults();
  }, [selectedExam]);

  useEffect(() => {
    let timer;
    if (cbtSession && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitCBT();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cbtSession, timeLeft]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get(`/questions/subjects/${selectedExam}`);
      setSubjects(response.data);
      console.log('Fetched subjects:', response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get('/cbt/results');
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const startCBT = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    try {
      const response = await api.get(`/cbt/questions/${selectedExam}/${selectedSubject}`);

      console.log('CBT questions:', response.data);
      const { objectives, theories } = response.data;

      setCbtSession({
        examType: selectedExam,
        subject: selectedSubject,
        objectives,
        theories,
        allQuestions: [...objectives, ...theories]
      });

      setCurrentQuestion(0);
      setAnswers({});
      setTimeLeft(90 * 60); // 90 minutes
      setShowModal(false);
    } catch (error) {
      toast.error('Error starting CBT session');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < cbtSession.allQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitCBT = async () => {
  if (!cbtSession) return;

  const submissionAnswers = Object.entries(answers).map(([questionId, answer]) => {
    // Handle objective question formatting
    const question = cbtSession.allQuestions.find(q => q._id === questionId);
    let formattedAnswer = answer;

    if (question.questionType === 'objective') {
      // Map raw answer (e.g. 'A') to "Option A"
      const index = question.options.indexOf(answer);
      if (index !== -1) {
        const optionLetter = String.fromCharCode(65 + index); // 65 = A
        formattedAnswer = `Option ${optionLetter}`;
      }
    }

    return {
      questionId,
      userAnswer: formattedAnswer,
      timeSpent: 0 // you can replace with actual tracking if needed
    };
  });

  console.log('Submitting CBT answers:', submissionAnswers);

  try {
    const response = await api.post('/cbt/submit', {
      examType: cbtSession.examType,
      subject: cbtSession.subject,
      answers: submissionAnswers,
      timeTaken: (90 * 60) - timeLeft
    });

    toast.success('CBT submitted successfully!');
    setShowResults(response.data.result);
    setCbtSession(null);
    fetchResults();
  } catch (error) {
    toast.error('Error submitting CBT');
  }
};


  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  if (cbtSession) {
    const currentQ = cbtSession.allQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / cbtSession.allQuestions.length) * 100;

    return (
      <div className="space-y-6">
        {/* CBT Header */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {cbtSession.examType} - {cbtSession.subject}
              </h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {cbtSession.allQuestions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-red-600">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <button
                onClick={submitCBT}
                className="btn-primary"
              >
                Submit CBT
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="card p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentQ.questionType === 'objective' ? 'Objective' : 'Theory'}
              </span>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentQ.question}
            </h3>

            {/* Objective Options */}
            {currentQ.questionType === 'objective' && currentQ.options && (
  <div className="space-y-3">
    {currentQ.options.map((option, index) => (
      <label
        key={index}
        className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer"
      >
        <input
          type="radio"
          name={`question-${currentQ._id}`}
          value={option}
          checked={answers[currentQ._id] === option}
          onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
          className="mr-3"
        />
        <span>{option}</span>
      </label>
    ))}
  </div>
)}

            {/* Theory Answer */}
            {currentQ.questionType
 === 'theory' && (
              <textarea
                value={answers[currentQ._id] || ''}
                onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                placeholder="Write your answer here..."
                className="w-full h-32 input-field resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center space-x-2">
              {answers[currentQ._id] && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span className="text-sm text-gray-500">
                {Object.keys(answers).length} of {cbtSession.allQuestions.length} answered
              </span>
            </div>

            <button
              onClick={nextQuestion}
              disabled={currentQuestion === cbtSession.allQuestions.length - 1}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Computer-Based Test</h1>
          <p className="text-gray-600">Practice with timed CBT sessions</p>
        </div>
      </div>

      {/* Start CBT Section */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Monitor className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Start New CBT Session</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type
            </label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="input-field"
            >
              <option value="WAEC">WAEC</option>
              <option value="NECO">NECO</option>
              <option value="JAMB">JAMB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedSubject}
            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 mr-2" />
            Start CBT Session
          </button>
        </div>
      </div>

      {/* Recent Results */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <Trophy className="h-6 w-6 text-secondary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.slice(0, 5).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {result.subject} - {result.examType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(result.completedAt).toLocaleDateString()} • 
                    {Math.floor(result.timeTaken / 60)} minutes
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getGradeColor(result.score.overall.grade)}`}>
                    {Math.round(result.score.overall.percentage)}%
                  </p>
                  <p className={`text-sm font-medium ${getGradeColor(result.score.overall.grade)}`}>
                    Grade {result.score.overall.grade}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No CBT sessions completed yet</p>
            <p className="text-sm text-gray-400">Start your first CBT session to see results here</p>
          </div>
        )}
      </div>

      {/* Start CBT Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start CBT Session</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Exam:</span>
                <span className="font-medium">{selectedExam}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{selectedSubject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">90 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">50 Objectives + 7 Theory</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Important:</strong> Once started, the timer cannot be paused. 
                Make sure you have a stable internet connection.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={startCBT}
                className="flex-1 btn-primary"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">CBT Completed!</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="text-center">
                <p className={`text-3xl font-bold ${getGradeColor(showResults.grade)}`}>
                  {Math.round(showResults.score.overall.percentage)}%
                </p>
                <p className={`text-lg font-medium ${getGradeColor(showResults.grade)}`}>
                  Grade {showResults.grade}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Objectives:</span>
                  <span>{showResults.score.objectives.correct}/{showResults.score.objectives.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Theory:</span>
                  <span>{showResults.score.theory.answered}/{showResults.score.theory.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Taken:</span>
                  <span>{Math.floor(showResults.timeTaken / 60)} minutes</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowResults(false)}
              className="w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CBTTab;