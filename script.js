// Example questions
const questions = [
    {
        question: "What is the capital of France?",
        options: ["Paris", "Berlin", "Madrid", "Rome"],
        correctAnswer: "Paris"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars"
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4"
    }
];

// Store the user answers
let userAnswers = [];

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('login-form').style.display = 'none';
        loadExam();
    } else {
        document.getElementById('error-message').innerText = 'Invalid username or password';
    }
}

// Load the questions for the exam
function loadExam() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';  // Clear any previous questions

    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <p>${question.question}</p>
            ${question.options.map(option => `
                <label>
                    <input type="radio" name="question-${index}" value="${option}">
                    ${option}
                </label><br>
            `).join('')}
        `;
        questionContainer.appendChild(questionDiv);
    });

    // Show the exam page and hide the login page
    document.getElementById('exam-page').style.display = 'block';
}

// Submit the exam and calculate results
function submitExam() {
    let score = 0;
    
    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
        
        if (selectedOption) {
            userAnswers[index] = selectedOption.value;
            if (userAnswers[index] === question.correctAnswer) {
                score++;
            }
        }
    });

    // Display the results
    document.getElementById('exam-page').style.display = 'none';
    document.getElementById('results-page').style.display = 'block';
    document.getElementById('results').innerText = `You scored ${score} out of ${questions.length}`;
}

// Logout function
function logout() {
    // Reset user data
    userAnswers = [];

    // Show login form again
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}
