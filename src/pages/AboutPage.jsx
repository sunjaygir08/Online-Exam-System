import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GraduationCap, Code, BookOpen, User, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button.jsx';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-xl">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-display text-slate-900 tracking-tight">Smart Exam Hub</span>
            </Link>
            <Link to="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold font-display text-slate-900 mb-8">About the Project</h1>
            
            <div className="bg-brand-50 rounded-3xl p-8 mb-12 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 rounded-full bg-brand-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                <User className="w-16 h-16 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Sunjay Gir</h2>
                <p className="text-brand-700 font-medium mb-4">Student of BE. Computer System Engineer at DUET Karachi</p>
                <p className="text-slate-600 leading-relaxed">
                  I am Sunjay Gir, and this is my **3rd Semester Project** for the **Object Oriented Programming** course. 
                  Smart Exam Hub represents my vision for a more accessible and secure digital education landscape.
                </p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <Code className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 m-0">Technical Vision</h3>
                  </div>
                  <p className="text-slate-600">
                    Built using modern web technologies, this platform demonstrates the power of Object Oriented Design 
                    in solving complex real-world problems. The architecture focuses on scalability, security, 
                    and a seamless user experience for both students and educators.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 m-0">Core Functionalities</h3>
                  </div>
                  <ul className="text-slate-600 space-y-2 list-none p-0">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-600"></div>
                      AI-Powered Proctoring & Monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-600"></div>
                      Automated Instant Grading System
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-600"></div>
                      Secure Browser Lockdown Features
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-600"></div>
                      Comprehensive Performance Analytics
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-6">The Theory Behind Smart Exam Hub</h3>
              <p className="text-slate-600 mb-6">
                In the modern era of education, the transition from physical to digital assessments is inevitable. 
                However, this transition brings challenges regarding integrity and efficiency. Smart Exam Hub 
                addresses these by integrating Artificial Intelligence directly into the examination workflow.
              </p>
              <p className="text-slate-600 mb-12">
                By leveraging OOP principles like encapsulation, inheritance, and polymorphism, the system 
                manages complex data structures for questions, exams, and user roles with high maintainability. 
                The goal is to create an environment where technology serves as a bridge, not a barrier, to learning.
              </p>

              <div className="bg-slate-900 rounded-[2rem] p-10 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Have questions or feedback?</h3>
                <p className="text-slate-400 mb-8">
                  I'm always open to discussing the project or potential collaborations.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="px-10">
                    Contact us <Mail className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2025. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
