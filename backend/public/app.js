// Global variables
let currentUser = null;
let currentExam = null;
let examTimer = null;
let timeLeft = 0;

// ==================== NAVIGATION ====================

function goToLanding() {
    document.getElementById('landingPage').style.display = 'block';
    document.getElementById('studentPage').style.display = 'none';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('resultPage').style.display = 'none';
}

function goToStudentLogin() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('studentPage').style.display = 'block';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('studentLoginForm').style.display = 'block';
    document.getElementById('studentRegisterForm').style.display = 'none';
    document.getElementById('studentTitle').textContent = 'Student Login';
}

function goToStudentRegister() {
    document.getElementById('studentLoginForm').style.display = 'none';
    document.getElementById('studentRegisterForm').style.display = 'block';
    document.getElementById('studentTitle').textContent = 'Create Student Account';
}

function goToAdminLogin() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('studentPage').style.display = 'none';
    document.getElementById('adminPage').style.display = 'block';
    document.getElementById('adminLoginForm').style.display = 'block';
    document.getElementById('adminRegisterForm').style.display = 'none';
    document.getElementById('adminTitle').textContent = 'Admin/Teacher Login';
}

function goToAdminRegister() {
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminRegisterForm').style.display = 'block';
    document.getElementById('adminTitle').textContent = 'Create Admin/Teacher Account';
}

// ==================== STUDENT AUTH ====================

document.getElementById('studentLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('studentLoginEmail').value;
    const password = document.getElementById('studentLoginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success && data.user.role === 'student') {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            alert('Invalid credentials or you are not a student!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed! Please try again.');
    }
});

document.getElementById('studentRegisterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('studentRegisterName').value;
    const email = document.getElementById('studentRegisterEmail').value;
    const password = document.getElementById('studentRegisterPassword').value;
    const confirmPassword = document.getElementById('studentRegisterConfirm').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword, role: 'student' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Account created successfully! Please sign in with your credentials.');
            goToStudentLogin();
            document.getElementById('studentLoginForm').reset();
        } else {
            alert('❌ ' + (data.message || 'Registration failed! Please try again.'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed! Please check your internet connection.');
    }
});

// ==================== ADMIN AUTH ====================

document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('adminLoginEmail').value;
    const password = document.getElementById('adminLoginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success && (data.user.role === 'admin' || data.user.role === 'teacher')) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showDashboard();
        } else {
            alert('Invalid credentials or you are not an admin or teacher!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed! Please try again.');
    }
});

document.getElementById('adminRegisterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('adminRegisterName').value;
    const email = document.getElementById('adminRegisterEmail').value;
    const role = document.getElementById('adminRegisterRole').value;
    const password = document.getElementById('adminRegisterPassword').value;
    const confirmPassword = document.getElementById('adminRegisterConfirm').value;
    
    if (!role) {
        alert('Please select a role!');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword, role })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Account created successfully! Please sign in with your credentials.');
            goToAdminLogin();
            document.getElementById('adminLoginForm').reset();
        } else {
            alert('❌ ' + (data.message || 'Registration failed! Please try again.'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed! Please check your internet connection.');
    }
});

// ==================== LOGOUT ====================

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    goToLanding();
}

// ==================== DASHBOARD ====================

function showDashboard() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('studentPage').style.display = 'none';
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('resultPage').style.display = 'none';
    
    document.getElementById('userName').textContent = currentUser.name + ' (' + currentUser.role + ')';
    
    // Show role-specific views
    document.getElementById('adminView').style.display = currentUser.role === 'admin' ? 'block' : 'none';
    document.getElementById('teacherView').style.display = currentUser.role === 'teacher' ? 'block' : 'none';
    document.getElementById('studentView').style.display = currentUser.role === 'student' ? 'block' : 'none';
    
    loadExams();
}

async function loadExams() {
    try {
        const response = await fetch('/api/exams');
        const exams = await response.json();
        
        // Display for admin/teacher
        if (currentUser.role === 'admin' || currentUser.role === 'teacher') {
            const examListHTML = exams.map(exam => `
                <div class="exam-card">
                    <h3>${exam.title}</h3>
                    <p><strong>Subject:</strong> ${exam.subject}</p>
                    <p><strong>Total Marks:</strong> ${exam.totalMarks}</p>
                    <p><strong>Passing Marks:</strong> ${exam.passingMarks}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Questions:</strong> ${exam.questions.length}</p>
                    <div class="buttons">
                        <button class="btn-delete" onclick="deleteExam(${exam.id})">Delete</button>
                    </div>
                </div>
            `).join('');
            
            if (currentUser.role === 'admin') {
                document.getElementById('examList').innerHTML = examListHTML || '<p>No exams yet</p>';
            } else {
                document.getElementById('teacherExams').innerHTML = examListHTML || '<p>No exams yet</p>';
            }
            
            loadStudentResults();
        }
        // Display for students
        else if (currentUser.role === 'student') {
            const availableExamsHTML = exams.map(exam => `
                <div class="exam-card">
                    <h3>${exam.title}</h3>
                    <p><strong>Subject:</strong> ${exam.subject}</p>
                    <p><strong>Total Marks:</strong> ${exam.totalMarks}</p>
                    <p><strong>Passing Marks:</strong> ${exam.passingMarks}</p>
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <div class="buttons">
                        <button class="btn-take" onclick="startExam(${exam.id})">Take Exam</button>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('availableExams').innerHTML = availableExamsHTML || '<p>No exams available</p>';
        }
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

async function loadStudentResults() {
    try {
        const response = await fetch(`/api/results/${currentUser.id}`);
        const results = await response.json();
        
        const resultsHTML = results.map(result => `
            <div class="exam-card">
                <p><strong>Exam ID:</strong> ${result.examId}</p>
                <p><strong>Marks:</strong> ${result.marksObtained}/${result.totalMarks}</p>
                <p><strong>Percentage:</strong> ${result.percentage}%</p>
                <p><strong>Status:</strong> ${result.isPassed ? '✅ PASSED' : '❌ FAILED'}</p>
            </div>
        `).join('');
        
        document.getElementById('studentResults').innerHTML = resultsHTML || '<p>No results yet</p>';
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// ==================== EXAM CREATION ====================

function showCreateExam() {
    document.getElementById('createExamModal').style.display = 'flex';
    document.getElementById('questionsList').innerHTML = '';
    questionCount = 0;
    addQuestion(); // Add one empty question
}

function closeModal() {
    document.getElementById('createExamModal').style.display = 'none';
}

let questionCount = 0;

function addQuestion() {
    questionCount++;
    const html = `
        <div class="question-input" id="question-${questionCount}">
            <h4>Question ${questionCount}</h4>
            <textarea placeholder="Question text" class="question-text" style="width:100%; padding:8px; border:2px solid #e0e0e0; border-radius:8px; font-family:inherit;"></textarea>
            
            <h5 style="margin-top:10px; color:#666;">Options:</h5>
            <div class="option-input">
                <input type="text" placeholder="Option 1" class="option-1">
                <input type="radio" name="correct-${questionCount}" value="0" class="correct-option">
            </div>
            <div class="option-input">
                <input type="text" placeholder="Option 2" class="option-2">
                <input type="radio" name="correct-${questionCount}" value="1" class="correct-option">
            </div>
            <div class="option-input">
                <input type="text" placeholder="Option 3" class="option-3">
                <input type="radio" name="correct-${questionCount}" value="2" class="correct-option">
            </div>
            <div class="option-input">
                <input type="text" placeholder="Option 4" class="option-4">
                <input type="radio" name="correct-${questionCount}" value="3" class="correct-option">
            </div>
            
            <input type="number" placeholder="Marks" value="1" class="question-marks" style="margin-top:10px;">
            <button type="button" onclick="removeQuestion(${questionCount})" class="btn-secondary" style="margin-top:10px; width:100%;">Remove Question</button>
        </div>
    `;
    
    document.getElementById('questionsList').innerHTML += html;
}

function removeQuestion(id) {
    const element = document.getElementById(`question-${id}`);
    if (element) element.remove();
}

document.getElementById('createExamForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('examTitle').value;
    const subject = document.getElementById('examSubject').value;
    const totalMarks = parseInt(document.getElementById('examMarks').value);
    const passingMarks = parseInt(document.getElementById('passingMarks').value);
    const duration = parseInt(document.getElementById('examDuration').value);
    
    // Collect questions
    const questions = [];
    document.querySelectorAll('.question-input').forEach((qDiv, index) => {
        const text = qDiv.querySelector('.question-text').value;
        const options = [
            qDiv.querySelector('.option-1').value,
            qDiv.querySelector('.option-2').value,
            qDiv.querySelector('.option-3').value,
            qDiv.querySelector('.option-4').value
        ];
        const correct = Array.from(qDiv.querySelectorAll('.correct-option')).findIndex(r => r.checked);
        const marks = parseInt(qDiv.querySelector('.question-marks').value) || 1;
        
        if (text && correct >= 0 && options.every(o => o)) {
            questions.push({
                text,
                options,
                correctAnswer: options[correct],
                marks
            });
        }
    });
    
    if (questions.length === 0) {
        alert('Please add at least one complete question!');
        return;
    }
    
    try {
        const response = await fetch('/api/exams/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                subject,
                questions,
                totalMarks,
                passingMarks,
                duration
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Exam created successfully!');
            closeModal();
            document.getElementById('createExamForm').reset();
            loadExams();
        }
    } catch (error) {
        console.error('Error creating exam:', error);
        alert('Failed to create exam! Please try again.');
    }
});

async function deleteExam(examId) {
    if (confirm('Are you sure you want to delete this exam?')) {
        alert('Delete functionality coming soon');
        // TODO: Implement delete
    }
}

// ==================== EXAM TAKING ====================

async function startExam(examId) {
    try {
        const response = await fetch('/api/exams');
        const exams = await response.json();
        currentExam = exams.find(e => e.id === examId);
        
        if (!currentExam) {
            alert('Exam not found!');
            return;
        }
        
        document.getElementById('examTitle').textContent = currentExam.title;
        
        // Display questions
        const questionsHTML = currentExam.questions.map((q, index) => `
            <div class="question-box">
                <h4>Q${index + 1}: ${q.text}</h4>
                <div class="options">
                    ${q.options.map((opt, idx) => `
                        <label>
                            <input type="radio" name="question-${index}" value="${opt}" required>
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        document.getElementById('questionsContainer').innerHTML = questionsHTML;
        document.getElementById('examForm').onsubmit = submitExam;
        
        document.getElementById('examModal').style.display = 'flex';
        
        // Start timer
        timeLeft = currentExam.duration * 60;
        startTimer();
        
    } catch (error) {
        console.error('Error loading exam:', error);
        alert('Failed to load exam! Please try again.');
    }
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    
    examTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(examTimer);
            alert('⏰ Time is up! Your exam is being submitted automatically...');
            document.getElementById('examForm').dispatchEvent(new Event('submit'));
        }
    }, 1000);
}

async function submitExam(e) {
    e.preventDefault();
    
    if (!confirm('Are you sure you want to submit your exam? You cannot change your answers after submission.')) return;
    
    clearInterval(examTimer);
    
    const answers = [];
    currentExam.questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="question-${index}"]:checked`);
        answers.push(selected ? selected.value : '');
    });
    
    try {
        const response = await fetch('/api/results/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                examId: currentExam.id,
                answers,
                studentId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResults(data.result);
        }
    } catch (error) {
        console.error('Error submitting exam:', error);
        alert('Failed to submit exam! Please try again.');
    }
}

function showResults(result) {
    document.getElementById('examModal').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('resultPage').style.display = 'block';
    
    document.getElementById('resultExamName').textContent = currentExam.title;
    document.getElementById('resultMarks').textContent = `${result.marksObtained}/${result.totalMarks}`;
    document.getElementById('resultPercentage').textContent = `${result.percentage}%`;
    
    const statusElement = document.getElementById('resultStatus');
    if (result.isPassed) {
        statusElement.textContent = '🎉 CONGRATULATIONS! You Passed!';
        statusElement.className = 'passed';
    } else {
        statusElement.textContent = '📚 You need to study more. Try again!';
        statusElement.className = 'failed';
    }
}

function goToDashboard() {
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadExams();
}

// ==================== INIT ====================

window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
});
