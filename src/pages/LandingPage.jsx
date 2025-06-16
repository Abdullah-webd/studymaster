import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  MessageCircle, 
  Trophy, 
  Users, 
  ChevronRight,
  Play,
  Star,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Past Questions',
      description: 'Access thousands of WAEC, NECO, and JAMB past questions with detailed solutions.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get instant help from our AI tutor for any educational question.'
    },
    {
      icon: MessageCircle,
      title: 'Peer Collaboration',
      description: 'Connect and chat with fellow students in real-time.'
    },
    {
      icon: Trophy,
      title: 'CBT Practice',
      description: 'Take computer-based tests that simulate real exam conditions.'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Questions Available' },
    { number: '10,000+', label: 'Active Students' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">StudyMaster</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Master Your 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600"> Exams </span>
                with AI
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Join thousands of students using StudyMaster to excel in WAEC, NECO, and JAMB. 
                Practice with past questions, get AI tutoring, and connect with peers.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  Start Learning Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 hover:border-primary-300 text-gray-700 font-semibold rounded-xl transition-colors">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Dashboard</h3>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  
                  {/* Mock Dashboard Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Recent CBT Score</p>
                        <p className="text-2xl font-bold text-primary-600">85%</p>
                      </div>
                      <Trophy className="h-8 w-8 text-primary-600" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Questions Solved</p>
                        <p className="text-lg font-bold text-secondary-600">1,247</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">Study Streak</p>
                        <p className="text-lg font-bold text-orange-600">12 days</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">Subject Performance</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Mathematics</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-16 h-2 bg-primary-600 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">80%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">English</span>
                          <div className="flex items-center">
                            <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                              <div className="w-18 h-2 bg-secondary-600 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">90%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.number}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-bold text-gray-900"
            >
              Everything You Need to Succeed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Comprehensive tools and resources designed for exam success
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              What Students Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Adebayo Johnson",
                role: "JAMB Candidate",
                content: "StudyMaster helped me improve my score from 180 to 275 in JAMB. The AI tutor is amazing!",
                rating: 5
              },
              {
                name: "Chioma Okafor",
                role: "WAEC Student",
                content: "The past questions database is comprehensive. I practiced over 2000 questions before my exam.",
                rating: 5
              },
              {
                name: "Ibrahim Hassan",
                role: "NECO Candidate",
                content: "Real-time chat with other students helped me understand difficult concepts better.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Excel in Your Exams?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of successful students and start your journey to academic excellence today.
            </p>
            <Link 
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started for Free
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold">StudyMaster</span>
              </div>
              <p className="text-gray-400">
                Empowering students to achieve academic excellence through AI-powered learning.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Past Questions</li>
                <li>CBT Practice</li>
                <li>AI Tutoring</li>
                <li>Peer Chat</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Exams</h3>
              <ul className="space-y-2 text-gray-400">
                <li>WAEC</li>
                <li>NECO</li>
                <li>JAMB</li>
                <li>Post-UTME</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StudyMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;