class SimidSurvey extends BaseSimidCreative {
  constructor() {
    super();
    this.setupSurveyUI();
  }

  setupSurveyUI() {
    const adParams = JSON.parse(this.creativeData.adParameters)[0];

    const questionText = adParams.question;
    const answers = adParams.answers;

    const questionEl = document.getElementById('current-question');
    if (questionEl) {
      questionEl.innerText = questionText;
    }

    const container = document.getElementById('right-button-container');
    container.innerHTML = '';

    answers.forEach((text, index) => {
      const div = document.createElement('div');
      div.className = `survey-checkbox-label B${index}`;
      div.innerHTML = `
        <label>
          <input type="checkbox" class="survey-checkbox" id="chk${index}" name="q" value="${text}">
          <span class="checkmark"></span>
          <span class="survey-text">${text}</span>
        </label>
      `;
      container.appendChild(div);
    });

    const answerButton = document.getElementById('answer-button');
    answerButton.innerText = adParams.answer_button_name || '回答する';
    answerButton.onclick = () => this.submitSurvey();
  }

  submitSurvey() {
    const selected = Array.from(document.querySelectorAll('input[name="q"]:checked'))
      .map(el => el.value);

    console.log('選択された回答:', selected);

    const thanks = document.getElementById('thanks-cover');
    if (thanks) {
      thanks.classList.add('showing');
    }

    this.protocol.sendMessage({
      type: 'creativeStopped'
    });
  }
}
