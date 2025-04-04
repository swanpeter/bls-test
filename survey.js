class SimidSurvey extends BaseSimidCreative {
  constructor() {
    super();
    this.surveyQuestions_ = [];
  }

  onStart(eventData) {
    super.onStart(eventData);
    this.surveyQuestions_ = JSON.parse(this.creativeData.adParameters);
    this.showQuestion();
  }

  showQuestion() {
    const questionData = this.surveyQuestions_[0];
    document.getElementById('current-question').textContent = questionData.question;

    const container = document.getElementById('right-button-container');
    container.innerHTML = ''; // Clear

    questionData.answers.forEach((answerText, index) => {
      const img = document.createElement('img');
      img.src = questionData.answer_imgs[index];
      img.alt = answerText;
      img.className = 'answer-img';
      img.onclick = () => this.submitAnswer(answerText);
      container.appendChild(img);
    });
  }

  submitAnswer(answer) {
    console.log('選択された回答:', answer);

    const suid = this.surveyQuestions_[0].suid;
    const cid = this.surveyQuestions_[0].cid;
    const aid = this.surveyQuestions_[0].aid;

    const url = `https://log.fnsdmp.jp/follow?suid=${suid}&cid=${cid}&aid=${aid}&answer=${encodeURIComponent(answer)}`;
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_TRACKING, {
      trackingUrls: [url]
    });

    // サンクスメッセージ表示 & スキップ
    document.getElementById('thanks').style.display = 'block';
    setTimeout(() => {
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
    }, 1500);
  }
}
