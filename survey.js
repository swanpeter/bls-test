class SimidSurvey extends BaseSimidCreative {
  constructor() {
    super();
    this.currentQuestion_ = -1;
    this.surveyQuestions_ = [];
    this.clickedAnswers = [];
    this.hasThumbnail = false;
    this.isMultiple = false;
    this.isAnswered = false;
  }

  storeAnswers(event) {
    let button = event.currentTarget;
    button.classList.toggle('clicked');
    const value = button.value.trim();
    if (!this.clickedAnswers) this.clickedAnswers = [];

    if (this.clickedAnswers.includes(value)) {
      this.clickedAnswers = this.clickedAnswers.filter(v => v !== value);
    } else {
      this.clickedAnswers.push(value);
    }
  }

  showQuestion() {
    if (this.isAnswered) {
      const element = document.getElementById('thanks-cover');
      if (element) {
        element.classList.add('showing');
        setTimeout(() => {
          element.classList.remove('showing');
          this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
        }, 2000);
      }
    }

    const questionData = this.surveyQuestions_[this.currentQuestion_];
    const questionElement = document.getElementById('current-question');
    if (questionElement && questionData) questionElement.innerHTML = questionData.question;

    const question_number = document.getElementById('number');
    if (question_number) question_number.value = questionData.answers.length;
    this.hasThumbnail = questionData.thumbnail_img;
    this.isMultiple = questionData.answer_button_name;

    this.setupButton(questionData.answers.length, this.hasThumbnail, this.isMultiple);
    this.setupQuestion(questionData);
    const qWrap = document.getElementById('question');
    if (qWrap) qWrap.classList.add('showing');
  }

  getSendUrl(type = 'bq', suid, cid, aid, answer_value) {
    if (type === 'td') {
      return `https://tokyo.in.treasuredata.com/postback/v3/event/010_fod_dl_spotx/follow_log?td_format=pixel&td_write_key=257/7acddee6a83dfe9aca2228920a2e586d7ed2e338&td_global_id=td_global_id&td_ip=td_ip&td_ua=td_ua&suid=${suid}&cid=${cid}&aid=${aid}&bls_answer=${answer_value}&ptag=XXX`;
    } else {
      return `https://log.fnsdmp.jp/follow?suid=${suid}&cid=${cid}&aid=${aid}&answer=${answer_value}`;
    }
  }

  makeUrl(e) {
    const value = e.target.value;
    const suid = document.getElementById('suid')?.value;
    const cid = document.getElementById('cid')?.value;
    const aid = document.getElementById('aid')?.value;
    const url = this.getSendUrl('td', suid, cid, aid, value);
    this.showNextQuestion(url);
  }

  onStart(eventData) {
    super.onStart(eventData);
    try {
      this.surveyQuestions_ = JSON.parse(this.creativeData.adParameters);
    } catch (e) {
      console.error("adParameters parse error", e);
    }
    this.showNextQuestion();
  }

  showNextQuestion(send_url = null) {
    const suid = document.getElementById('suid')?.value || '';
    const cid = document.getElementById('cid')?.value || '';
    const aid = document.getElementById('aid')?.value || '';

    const data = this.surveyQuestions_[0];
    const coverImage = document.getElementById('cover_img_id');
    if (coverImage) coverImage.src = data.cover_img;

    const answerButton = document.getElementById('answer-button');
    const confirmBtn = answerButton;
    if (data.answer_button_name) {
      this.isMultiple = true;
      answerButton.textContent = data.answer_button_name;
      confirmBtn.onclick = this.showNextQuestion.bind(this);
    } else {
      document.getElementById('button-wrapper').style.display = 'none';
    }

    const qElem = document.getElementById('question');
    if (qElem) qElem.classList.remove('showing');
    this.currentQuestion_++;

    if (this.currentQuestion_ >= this.surveyQuestions_.length) {
      let url = send_url;
      if (this.isMultiple) {
        const answerParam = this.clickedAnswers.join(',');
        url = this.getSendUrl('td', suid, cid, aid, answerParam);
      }

      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_TRACKING, { trackingUrls: [url] });
      this.isAnswered = true;
      this.showQuestion();
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      return;
    }

    setTimeout(() => this.showQuestion(), 1000);
  }

  setupButton(count, hasThumbnail, isMultiple) {
    const containerId = hasThumbnail ? 'right-button-container' : 'top-button-container';
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const handler = isMultiple ? this.storeAnswers.bind(this) : this.makeUrl.bind(this);

    for (let i = 0; i < count; i++) {
      container.appendChild(this.createButton(i, handler));
    }
  }

  createButton(index, handler) {
    const label = document.createElement('label');
    label.className = 'survey-checkbox-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'option' + index;
    checkbox.className = 'survey-checkbox';
    checkbox.value = index;
    checkbox.onclick = handler;

    checkbox.addEventListener('change', () => {
      label.classList.toggle('selected', checkbox.checked);
    });

    const span = document.createElement('span');
    span.className = 'checkmark';

    const text = document.createElement('span');
    text.className = 'survey-text';
    text.textContent = `回答 ${index + 1}`;

    label.appendChild(checkbox);
    label.appendChild(span);
    label.appendChild(text);

    return label;
  }

  setupQuestion(questionData) {
    const thumb = document.getElementById('thumbnail_img_id');
    if (thumb && questionData.thumbnail_img) {
      thumb.src = questionData.thumbnail_img;
    }

    document.getElementById('suid').value = questionData.suid;
    document.getElementById('cid').value = questionData.cid;
    document.getElementById('aid').value = questionData.aid;
    document.getElementById('origin_liid').value = questionData.origin_liid;
    document.getElementById('ptag').value = questionData.ptag;

    const pairs = questionData.answers.map((a, i) => ({ index: i, answer: a }));
    if (questionData.random_flg) this.shuffleAnswerButtonOrder(pairs);

    const containerId = questionData.thumbnail_img ? 'right-button-container' : 'top-button-container';
    const container = document.getElementById(containerId);

    const elements = pairs.map(pair => {
      const checkbox = document.getElementById('option' + pair.index);
      if (!checkbox) return null;
      const label = checkbox.parentElement;
      const text = label.querySelector('.survey-text');
      if (text) text.textContent = pair.answer;
      return label;
    }).filter(el => el);

    elements.forEach(el => container.appendChild(el));
  }

  shuffleAnswerButtonOrder(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
