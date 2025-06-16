import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, ChevronRight, MessageCircle, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PastQuestionsTab = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [filters, setFilters] = useState({
    examType: 'WAEC',
    subject: '',
    year: '',
    type: 'objective'
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [filters.examType]);

  useEffect(() => {
    if (filters.subject) {
      fetchYears();
    }
  }, [filters.examType, filters.subject]);

  useEffect(() => {
    if (filters.examType && filters.subject && filters.year) {
      fetchQuestions();
    }
  }, [filters]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get(`/questions/subjects/${filters.examType}`);
      setSubjects(response.data);
      setFilters(prev => ({ ...prev, subject: '', year: '' }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await api.get(`/questions/years/${filters.examType}/${filters.subject}`);
      setYears(response.data);
      setFilters(prev => ({ ...prev, year: '' }));
    } catch (error) {
      console.error('Error fetching years:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/questions', { params: filters });
      setQuestions(response.data);
      console.log(response.data);
      setCurrentQuestion(0);
      setSelectedAnswer('');
      setShowAnswer(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Error loading questions');
    } finally {
      setLoading(false);
    }
  };

  const getFullAnswerText = (optionCode, optionsArray) => {
  const letter = optionCode?.split(' ')[1]; // Get 'B' from 'Option B'
  if (!letter) return null;
  return optionsArray.find(opt => opt.trim().startsWith(`${letter}.`));
};


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer('');
      setShowAnswer(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const showCorrectAnswer = () => {
    setShowAnswer(true);
  };

  const askAI = async () => {
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    try {
      const response = await api.post('/ai/ask', { question: aiQuestion });
      setAiResponse(response.data.answer);
    } catch (error) {
      toast.error('Error getting AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Past Questions</h1>
          <p className="text-gray-600">Practice with real exam questions</p>
        </div>
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="btn-secondary flex items-center"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI Help
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Type
            </label>
            <select
              value={filters.examType}
              onChange={(e) => handleFilterChange('examType', e.target.value)}
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
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="input-field"
              disabled={subjects.length === 0}
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="input-field"
              disabled={years.length === 0}
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="objective">Objective</option>
              <option value="theory">Theory</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Display */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
          <span className="ml-2 text-gray-600">Loading questions...</span>
        </div>
      ) : questions.length > 0 ? (
        <div className="card p-6">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {filters.examType} • {filters.subject} • {filters.year}
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentQ?.question}
            </h3>

            {/* Objective Question Options */}
            {currentQ?.questionType === 'objective' && currentQ?.options && (
  <div className="space-y-3">
    {currentQ.options.map((fullOption, index) => {
      // Split label and value
      const [label, ...rest] = fullOption.split('.');
      const optionValue = rest.join('.').trim();
      const optionKey = fullOption; // Use full text as unique key & comparison base

      return (
        <button
          key={index}
          onClick={() => handleAnswerSelect(optionKey)}
          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
            selectedAnswer === optionKey
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${
            showAnswer && optionKey === currentQ.answer
              ? 'border-green-500 bg-green-50'
              : showAnswer && selectedAnswer === optionKey && optionKey !== currentQ.answer
              ? 'border-red-500 bg-red-50'
              : ''
          }`}
        >
          <span className="font-medium text-gray-700">{label}.</span>
          <span className="ml-2">{optionValue}</span>
        </button>
      );
    })}
  </div>
)}


            {/* Theory Question */}
            {currentQ?.type === 'theory' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Theory Question:</p>
                <p className="text-gray-900">{currentQ.question}</p>
              </div>
            )}
          </div>

          {/* Answer Controls */}
          {currentQ?.questionType === 'objective' && (
  <div className="mb-6">
    {!showAnswer ? (
      <button
        onClick={showCorrectAnswer}
        disabled={!selectedAnswer}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Show Answer
      </button>
    ) : (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800">
          <strong>Correct Answer:</strong>{' '}
          {getFullAnswerText(currentQ.answer, currentQ.options)}
        </p>
        {selectedAnswer === getFullAnswerText(currentQ.answer, currentQ.options) ? (
          <p className="text-green-600 mt-1">✓ Correct!</p>
        ) : (
          <p className="text-red-600 mt-1">
            ✗ Your answer: {selectedAnswer}
          </p>
        )}
      </div>
    )}
  </div>
)}


          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              {currentQuestion + 1} / {questions.length}
            </span>

            <button
              onClick={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
          <p className="text-gray-600">
            {!filters.subject || !filters.year 
              ? 'Please select exam type, subject, and year to view questions'
              : 'No questions available for the selected filters'
            }
          </p>
        </div>
      )}

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
            <button
              onClick={() => setShowAIChat(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a question about this topic
              </label>
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask anything about the current subject or question..."
                className="w-full h-24 input-field resize-none"
              />
            </div>

            <button
              onClick={askAI}
              disabled={aiLoading || !aiQuestion.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Getting answer...
                </div>
              ) : (
                'Ask AI'
              )}
            </button>

            {aiResponse && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">AI Response:</h4>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PastQuestionsTab;