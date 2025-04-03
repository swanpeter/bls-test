
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

    document.getElementById('current-question').innerText = questionText;

    const container = document.getElementById('right-button-container');
    answers.forEach((text, index) => {
      const div = document.createElement('div');
      div.className = `survey-checkbox-label B${index}`;
      div.innerHTML = `
        <input type="checkbox" class="survey-checkbox" id="chk${index}" name="q" value="${text}">
        <span class="checkmark"></span>
        <span class="survey-text">${text}</span>
      `;
      container.appendChild(div);
    });

    const answerButton = document.getElementById('answer-button');
    answerButton.innerText = '回答する';
    answerButton.onclick = () => this.submitSurvey();
  }

  submitSurvey() {
    const selected = Array.from(document.querySelectorAll('input[name="q"]:checked'))
      .map(el => el.value);

    console.log('選択された回答:', selected);

    // ありがとうございました画面表示
    const thanks = document.getElementById('thanks-cover');
    thanks.classList.add('showing');

    // SIMIDに完了通知（任意）
    this.protocol.sendMessage({
      type: 'creativeStopped'
    });
  }
}
