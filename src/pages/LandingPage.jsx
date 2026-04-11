import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Zap, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '../components/Button.jsx';

export const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-xl">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-display text-slate-900 tracking-tight">Smart Exam Hub</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Features</a>
              <Link to="/about" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">About</Link>
              <Link to="/contact" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">Contact</Link>
              {user ? (
                <Link to={`/${user.role}/dashboard`}>
                  <Button variant="outline" className="border-brand-200 text-brand-600 hover:bg-brand-50">Dashboard</Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button>Start Now</Button>
                </Link>
              )}
            </div>

            <div className="md:hidden">
              <button
                type="button"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-slate-100 px-4 py-6 space-y-4"
          >
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium">Features</a>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium">About</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-slate-600 font-medium">Contact</Link>
            {user ? (
              <Link to={`/${user.role}/dashboard`} onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full border-brand-200 text-brand-600">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Start Now</Button>
              </Link>
            )}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Examination Platform</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold font-display text-slate-900 leading-[1.1] mb-6">
                The Smart Way to <span className="text-brand-600">Examine</span> & Learn.
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                Secure, reliable, and automated examination system designed for modern educational institutions. 
                Experience AI-proctoring and instant grading.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-start">
                {user ? (
                  <Link to={`/${user.role}/dashboard`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 px-8 text-lg">
                      Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 px-8 text-lg">
                      Start Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="mt-10 flex items-center gap-6 text-slate-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">Trusted by 10,000+ Students</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-brand-600/5 absolute -inset-4 transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-[0_0_50px_-12px_rgba(37,99,235,0.3)] border border-slate-200 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=800&auto=format&fit=crop" 
                  alt="Student taking an online examination on a laptop" 
                  className="w-full h-full object-cover opacity-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-brand-50/30"></div>
                
                {/* Eye-catching Live Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl border border-white/50 z-10">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Live Proctoring</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg p-5 rounded-2xl shadow-2xl border border-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">Active Exam</p>
                      <p className="text-lg font-bold text-slate-900 leading-tight">Advanced Mathematics II</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time Remaining</p>
                      <p className="text-xl font-mono font-bold text-brand-600">45:20</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-brand-600 tracking-wide uppercase mb-3">Features</h2>
            <p className="text-4xl font-bold font-display text-slate-900 mb-4">Everything you need for secure exams</p>
            <p className="text-lg text-slate-600">Our platform combines cutting-edge AI with intuitive design to provide the best examination experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "AI Proctoring",
                desc: "Real-time monitoring using advanced AI to detect suspicious behavior and ensure exam integrity."
              },
              {
                icon: Zap,
                title: "Auto-Grading",
                desc: "Instant results for multiple-choice and short-answer questions with detailed performance analytics."
              },
              {
                icon: CheckCircle,
                title: "Secure Exams",
                desc: "Browser lockdown and encrypted data transmission to prevent unauthorized access and leaks."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="text-brand-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/10 blur-3xl rounded-full -ml-32 -mb-32"></div>
            
            <h2 className="text-4xl lg:text-5xl font-bold font-display text-white mb-6 relative z-10">
              Ready to modernize your <br className="hidden sm:block" /> examination process?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of institutions worldwide using Smart Exam Hub to deliver better assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              {user ? (
                <Link to={`/${user.role}/dashboard`}>
                  <Button size="lg" className="h-14 px-10">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg" className="h-14 px-10">Start Now</Button>
                </Link>
              )}
              <Link to="/contact">
                <Button variant="outline" size="lg" className="h-14 px-10 border-slate-700 text-white hover:bg-slate-800">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-brand-600 w-6 h-6" />
            <span className="text-xl font-bold font-display text-slate-900">Smart Exam Hub</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://github.com/sunjaygir08/Online-Exam-System" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2">
              <span className="text-sm font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
