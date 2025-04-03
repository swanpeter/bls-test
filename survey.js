/**
 * A sample SIMID ad that shows how to implement a survey.
 */
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
    if (!this.clickedAnswers) {
      this.clickedAnswers = [];
    }
    if (this.clickedAnswers.includes(value)) {
      this.clickedAnswers = this.clickedAnswers.filter(v => v !== value);
    } else {
      this.clickedAnswers.push(value);
    }
  }

  showQuestion() {
    if (this.isAnswered) {
      const element = document.getElementById('thanks-cover');
      element.classList.add('showing');
      setTimeout(() => {
        element.classList.remove('showing');
        this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      }, 2000);
    }

    const questionData = this.surveyQuestions_[this.currentQuestion_];
    const questionElement = document.getElementById('current-question');
    questionElement.innerHTML = questionData.question;

    const question_number = document.getElementById('number');
    question_number.value = questionData.answers.length;
    this.hasThumbnail = questionData.thumbnail_img;
    this.isMultiple = questionData.answer_button_name;

    this.setupButton(question_number.value, this.hasThumbnail, this.isMultiple);
    this.setupQuestion(questionData);
    document.getElementById('question').classList.add('showing');
  }

  getSendUrl(type = 'bq', suid, creative_id, lineitem_id, answer_value) {
    if (type === 'td') {
      return 'https://tokyo.in.treasuredata.com/postback/v3/event/010_fod_dl_spotx/follow_log'
        + '?td_format=pixel'
        + '&td_write_key=257/7acddee6a83dfe9aca2228920a2e586d7ed2e338'
        + '&td_global_id=td_global_id'
        + '&td_ip=td_ip'
        + '&td_ua=td_ua'
        + '&suid=' + suid
        + '&cid=' + creative_id
        + '&aid=' + lineitem_id
        + '&bls_answer=' + answer_value
        + '&ptag=XXX';
    } else {
      return 'https://log.fnsdmp.jp/follow'
        + '?suid=' + suid
        + '&cid=' + creative_id
        + '&aid=' + lineitem_id
        + '&answer=' + answer_value;
    }
  }

  makeUrl(e) {
    const answer_value = e.target.value;
    const suid = document.getElementById('suid').value;
    const creative_id = document.getElementById('cid').value;
    const lineitem_id = document.getElementById('aid').value;
    const send_url = this.getSendUrl('td', suid, creative_id, lineitem_id, answer_value);
    this.showNextQuestion(send_url);
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
  }

  onStart(eventData) {
    super.onStart(eventData);
    this.surveyQuestions_ = JSON.parse(this.creativeData.adParameters);
    this.showNextQuestion();
  }

  showNextQuestion(send_url = null) {
    const suid = document.getElementById('suid').value;
    const creative_id = document.getElementById('cid').value;
    const lineitem_id = document.getElementById('aid').value;

    const _questionData = this.surveyQuestions_[0];
    const coverImage = document.getElementById('cover_img_id');
    if (coverImage && _questionData.cover_img) {
      coverImage.src = _questionData.cover_img;
    }

    const answerButton = document.getElementById('answer-button');
    const buttonWrapper = document.getElementById('button-wrapper');
    const confirmBtn = document.getElementById('answer-button');

    if (_questionData.answer_button_name) {
      this.isMultiple = true;
      answerButton.textContent = _questionData.answer_button_name;
      confirmBtn.onclick = () => {
        this.showNextQuestion();
        this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      };
    } else {
      buttonWrapper.style.display = 'none';
    }

    document.getElementById('question').classList.remove('showing');
    this.currentQuestion_++;

    if (this.currentQuestion_ >= this.surveyQuestions_.length) {
      let url = send_url;
      if (this.isMultiple) {
        let answerParam = this.clickedAnswers.length > 0 ? `${this.clickedAnswers.join(',')}` : '';
        url = this.getSendUrl('td', suid, creative_id, lineitem_id, answerParam);
      }
      let url_message = { trackingUrls: [url] };
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_TRACKING, url_message);
      this.isAnswered = true;
      this.showQuestion();
      return;
    }
    setTimeout(() => this.showQuestion(), 1000);
  }

  setupButton(question_number, hasThumbnail, isMultiple) {
    const containerId = hasThumbnail ? 'right-button-container' : 'top-button-container';
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    let clickHandler = isMultiple ? this.storeAnswers.bind(this) : this.makeUrl.bind(this);
    for (let i = 0; i < question_number; i++) {
      container.appendChild(this.createButton(i, clickHandler));
    }
  }

  createButton(index, clickHandler) {
    const label = document.createElement('label');
    label.className = 'survey-checkbox-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'option' + index;
    checkbox.className = 'survey-checkbox';
    checkbox.value = index;
    checkbox.onclick = clickHandler;
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
    const thumbnailImage = document.getElementById('thumbnail_img_id');
    if (thumbnailImage && questionData.thumbnail_img) {
      thumbnailImage.src = questionData.thumbnail_img;
    } else {
      document.getElementById('left-contents').classList.add('display-none');
    }
    document.getElementById('suid').value = questionData.suid;
    document.getElementById('cid').value = questionData.cid;
    document.getElementById('aid').value = questionData.aid;
    document.getElementById('origin_liid').value = questionData.origin_liid;
    document.getElementById('ptag').value = questionData.ptag;
    const answerPairs = questionData.answers.map((answer, index) => ({ index, answer }));
    if (questionData.random_flg) {
      this.shuffleAnswerButtonOrder(answerPairs);
    }
    const containerId = questionData.thumbnail_img ? 'right-button-container' : 'top-button-container';
    const container = document.getElementById(containerId);
    const elements = answerPairs.map(pair => {
      const checkbox = document.getElementById('option' + pair.index);
      if (!checkbox) return null;
      const label = checkbox.parentElement;
      const textElement = label.querySelector('.survey-text');
      if (textElement) textElement.textContent = pair.answer;
      return label;
    }).filter(el => el !== null);
    elements.forEach(el => container.appendChild(el));
  }

  shuffleAnswerButtonOrder(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
