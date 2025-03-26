let currentUser = null;
let currentToken = null;

// Toggle between login and register forms
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Authentication Functions
async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('user-role').value;

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showLogin();
        } else {
            alert(`Registration failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            currentToken = data.token;
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            loadDashboard();
        } else {
            alert(`Login failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function loadDashboard() {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `Welcome, ${currentUser.username} (${currentUser.role})`;

    const createExamBtn = document.createElement('button');
    createExamBtn.textContent = 'Create New Exam';
    createExamBtn.onclick = () => showCreateExamSection();
    userInfo.appendChild(createExamBtn);

    loadAvailableExams();
}

async function loadAvailableExams() {
    const examList = document.getElementById('exam-list');
    examList.innerHTML = '<h3>Available Exams</h3>';

    try {
        const response = await fetch('http://localhost:3000/available-exams', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const exams = await response.json();
        exams.forEach(exam => {
            const examDiv = document.createElement('div');
            examDiv.className = 'exam-item';
            examDiv.innerHTML = `
                <h4>${exam.title}</h4>
                <p>${exam.description}</p>
                <small>Duration: ${exam.duration} minutes</small>
            `;
            examDiv.onclick = () => startExam(exam.id);
            examList.appendChild(examDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function showCreateExamSection() {
    document.getElementById('exam-list').style.display = 'none';
    document.getElementById('create-exam-section').style.display = 'block';
}

function addQuestionField() {
    const container = document.getElementById('question-container');
    const questionEntry = document.createElement('div');
    questionEntry.className = 'question-entry';
    questionEntry.innerHTML = `
        <textarea placeholder="Question Text"></textarea>
        <input type="text" placeholder="Option 1">
        <input type="text" placeholder="Option 2">
        <input type="text" placeholder="Option 3">
        <input type="text" placeholder="Option 4">
        <select class="correct-option">
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
        </select>
    `;
    container.appendChild(questionEntry);
}

async function submitExam() {
    const title = document.getElementById('exam-title').value;
    const description = document.getElementById('exam-description').value;
    const duration = document.getElementById('exam-duration').value;

    const questionEntries = document.querySelectorAll('.question-entry');
    const questions = Array.from(questionEntries).map(entry => {
        const questionText = entry.querySelector('textarea').value;
        const options = Array.from(entry.querySelectorAll('input[type="text"]')).map(input => input.value);
        const correctOption = entry.querySelector('.correct-option').value;

        return {
            text: questionText,
            options: options,
            correctOption: parseInt(correctOption)
        };
    });

    try {
        const response = await fetch('http://localhost:3000/create-exam', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ title, description, duration, questions })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Exam created successfully!');
            loadAvailableExams();
            document.getElementById('create-exam-section').style.display = 'none';
            document.getElementById('exam-list').style.display = 'block';
        } else {
            alert(`Exam creation failed: ${data.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function startExam(examId) {
    document.getElementById('exam-list').style.display = 'none';
    document.getElementById('take-exam-section').style.display = 'block';

    try {
        const response = await fetch(`http://localhost:3000/exam/${examId}`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        const questions = await response.json();
        const questionsContainer = document.getElementById('exam-questions');
        questionsContainer.innerHTML = '';

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `
                <h4>${question.question_text}</h4>
                <div>
                    <input type="radio" name="q${index}" value="0"> ${question.option1}<br>
                    <input type="radio" name="q${index}" value="1"> ${question.option2}<br>
                    <input type="radio" name="q${index}" value="2"> ${question.option3}<br>
                    <input type="radio" name="q${index}" value="3"> ${question.option4}
                </div>
            `;
            questionsContainer.appendChild(questionDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function submitExamAnswers() {
    const answers = Array.from(document.querySelectorAll('input[type="radio"]:checked'))
        .map(radio => parseInt(radio.value));

    const examId = 1; // This would dynamically come from the current exam context

    try {
        const response = await fetch('http://localhost:3000/submit-exam', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ examId, answers })
        });

        const result = await response.json();
        alert(`Exam submitted! Your score: ${result.score.toFixed(2)}%`);
        
        document.getElementById('take-exam-section').style.display = 'none';
        document.getElementById('exam-list').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}
