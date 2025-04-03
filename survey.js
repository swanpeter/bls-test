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

    // 質問文の表示
    const questionEl = document.getElementById('current-question');
    if (questionEl) {
      questionEl.innerText = questionText;
    }

    // 選択肢の生成
    const container = document.getElementById('right-button-container');
    if (container) {
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
    }

    // 回答ボタン
    const answerButton = document.getElementById('answer-button');
    if (answerButton) {
      answerButton.innerText = '回答する';
      answerButton.onclick = () => this.submitSurvey();
    }
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
