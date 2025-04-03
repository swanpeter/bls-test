class SimidSurvey extends BaseSimidCreative {
  constructor() {
    super();
    this.setupSurveyUI();
  }

  setupSurveyUI() {
    const questionText = '「フジドラWINTER」キャンペーンを知ったきっかけは何ですか？';
    const answers = [
      '地上波やSNS上の告知',
      'TVer内の表示',
      'フジドラWINTERを知らない',
      '知人やSNSなどの情報や口コミ'
    ];

    const questionEl = document.getElementById('current-question');
    questionEl.innerText = questionText;

    const container = document.getElementById('right-button-container');
    answers.forEach((text, index) => {
      const div = document.createElement('label');
      div.className = 'survey-checkbox-label';
      div.innerHTML = `
        <input type="checkbox" class="survey-checkbox" name="q" value="${text}">
        <span class="checkmark"></span>
        <span class="survey-text">${text}</span>
      `;
      container.appendChild(div);
    });

    const answerButton = document.getElementById('answer-button');
    answerButton.onclick = () => this.submitSurvey();
  }

  submitSurvey() {
    const selected = Array.from(document.querySelectorAll('input[name="q"]:checked'))
      .map(el => el.value);

    console.log('選択された回答:', selected);

    const thanks = document.getElementById('thanks-cover');
    thanks.classList.add('showing');

    this.protocol.sendMessage({
      type: 'creativeStopped'
    });
  }
}
