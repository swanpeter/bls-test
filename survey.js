/**
 * A sample SIMID ad that shows how to impliment a survey.
 */
class SimidSurvey extends BaseSimidCreative {
  constructor() {
    super();

    /**
     * The current Question being asked.
     * @private
     */
    this.currentQuestion_ = -1;
    /**
     * A list of questions to be asked. Default is no questions.
     * @private
     */
    this.surveyQuestions_ = [];
    this.clickedAnswers = [];
    this.hasThumbnail = false;
    // Is Multiple Answers Or Not
    this.isMultiple = false;
    // If or not the question was answered when multiple responses were given.
    this.isAnswered = false;
  }

  /**
   * store Answer Button Values
   */
  storeAnswers(event) {
    // clicked button
    let button = event.currentTarget;

    // If active class is already attached, delete (toggle operation)
    if (button.classList.contains('clicked')) {
      button.classList.remove('clicked');
    } else {
      button.classList.add('clicked');
    }
    // remove blank
    const value = button.value.trim();

    // `undefined` check
    if (!this.clickedAnswers) {
        this.clickedAnswers = [];
    }

    // Delete if already selected, otherwise add
    if (this.clickedAnswers.includes(value)) {
        this.clickedAnswers = this.clickedAnswers.filter(v => v !== value);
    } else {
        this.clickedAnswers.push(value);
    }
    // TODO: 639 DELETE
    // console.log('answers ARE :', this.clickedAnswers);
  }

  /**
   * Shows the current question
   */
  showQuestion() {
    // If isMultiple and the “answer” button is pressed, 
    // a "thanks-cover" is displayed and the player is returned after the specified number of seconds.
    if (this.isAnswered) {
      const element = document.getElementById('thanks-cover');
      element.classList.add('showing');
      // Hide after 2 seconds
      setTimeout(() => {
        element.classList.remove('showing');
        
        this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
        return;        
      }, 2000); 
    }

    // Currently "currentQuestion_" is no more than 1 is used.
    // const questionData = this.surveyQuestions_[0];
    // TODO: 639 check -> When 0 is specified thanks image is not displayed, return it.
    const questionData = this.surveyQuestions_[this.currentQuestion_];
    const questionElement = document.getElementById('current-question');
    questionElement.innerHTML = questionData.question;
    
    /**
     * 2023/08/02
     */
    // Set the number of choices
    const question_number = document.getElementById('number');
    question_number.value = questionData.answers.length;
    // Has Thumbnail Image Or Not
    this.hasThumbnail = questionData.thumbnail_img;
    // Is Multiple Answers Or Not
    this.isMultiple = questionData.answer_button_name;

    // Set the number of choice buttons
    this.setupButton(question_number.value, this.hasThumbnail, this.isMultiple);
    this.setupQuestion(questionData);
    document.getElementById('question').classList.add('showing');
  }

  /**
   * Generate RequestURL with TD or BQ
   * 
   * @param {*} type 
   * @param {*} suid 
   * @param {*} creative_id 
   * @param {*} lineitem_id 
   * @param {*} answer_value comma-separated If multiple answers 
   * @returns 
   */
  getSendUrl(type='bq', suid, creative_id, lineitem_id, answer_value) {
    // TD
    if (type === 'td') {
      return 'https://tokyo.in.treasuredata.com/postback/v3/event/010_fod_dl_spotx/follow_log'
        + '?td_format=pixel'
        + '&td_write_key=257/7acddee6a83dfe9aca2228920a2e586d7ed2e338'
        + '&td_global_id=td_global_id'
        + '&td_ip=td_ip'
        + '&td_ua=td_ua'
        + '&suid='       + suid 
        + '&cid='        + creative_id 
        + '&aid='        + lineitem_id 
        + '&bls_answer=' + answer_value 
        + '&ptag=XXX'
      ;
     // BQ
    } else {
      return 'https://log.fnsdmp.jp/follow'
        + '?suid='   + suid 
        + '&cid='    + creative_id 
        + '&aid='    + lineitem_id 
        + '&answer=' + answer_value
      ;
    }
  }

  /**
   * get answered value and creative_id
   * 2023/08/02
   * Only for single answers
   */
  makeUrl(e) {
    const answer_value = e.target.value;
    const suid = document.getElementById('suid').value;
    const creative_id = document.getElementById('cid').value;
    const lineitem_id = document.getElementById('aid').value;
    // BQ or TD
    const send_url = this.getSendUrl(
      'td', 
      suid, 
      creative_id, 
      lineitem_id, 
      answer_value
    );

    this.showNextQuestion(send_url);
  }

  /** @override */
  onStart(eventData) {
  super.onStart(eventData);
  this.surveyQuestions_ = JSON.parse(this.creativeData.adParameters);
  console.log('📊 adParameters:', this.surveyQuestions_); // ←追加
  this.showNextQuestion();
}


  /**
   * Shows the next question.
   * 
   * @param {*} send_url not null for single response
   * @returns 
   */
  showNextQuestion(send_url = null) {

    const suid = document.getElementById('suid').value;
    const creative_id = document.getElementById('cid').value;
    const lineitem_id = document.getElementById('aid').value;
    
    // set cover_img src path  
    // cover_img need to set before "remove('showing')"
    const _questionData = this.surveyQuestions_[0];        
    const coverImage = document.getElementById('cover_img_id');
    coverImage.src = _questionData.cover_img; 

    // For Multiple Answer
    const answerButton = document.getElementById('answer-button');
    const buttonWrapper = document.getElementById('button-wrapper');
    const confirmBtn = document.getElementById('answer-button');
    // this.isMultiple IS false HERE.
    if (_questionData.answer_button_name) {
        // 複数回答
        this.isMultiple = true;
        answerButton.textContent = _questionData.answer_button_name;
        // 「回答する」ボタンにsubmitイベントをバインド
        confirmBtn.onclick = this.showNextQuestion.bind(this);
    } else {
        // 単一回答の場合は回答するボタン用divを非表示
        buttonWrapper.style.display = 'none';
    }

    document.getElementById('question').classList.remove('showing');
    this.currentQuestion_ ++;

    // If isMultiple and the “answer” button is pressed, 
    // the isAnswered is true (currentQuestion_ count did not work!!!)
    if (this.currentQuestion_ >= this.surveyQuestions_.length) {
      // request URL 
      // parameters are comma-separated If multiple answers 
      let url = send_url
      // 複数回答
      if (this.isMultiple) {
        // For multiple responses, send_url is null, so define it here
        // BQ or TD
        let answerParam = this.clickedAnswers.length > 0 
        ? `${this.clickedAnswers.join(',')}` 
        : '';

        url = this.getSendUrl(
          'td', 
          suid, 
          creative_id, 
          lineitem_id, 
          answerParam
        );
      // 単一回答
      } else {
        // In the case of a single response, 
        // send_url is passed as an argument, so it is used as it is.
      }

      // Send Request HERE!!
      let url_message = {trackingUrls: [url]}
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_TRACKING, url_message)

      // isAnswered ON
      this.isAnswered = true;
      this.showQuestion();

      // If the user answers all the questions skip the rest of the ad.
      this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
      return;
    }
    setTimeout(() => this.showQuestion(), 1000);
  }

  /**
   * Set the number of choice buttons.
   * Change the click event depending on whether or not multiple responses are received.
   * @param {*} question_number 
   * @param {*} hasThumbnail 
   * @param {*} isMultiple 
   */
  setupButton(question_number, hasThumbnail, isMultiple) {
    const containerId = hasThumbnail ? 'right-button-container' : 'top-button-container';
    const container = document.getElementById(containerId);
    // Clear previous buttons
    container.innerHTML = '';
    // onClick Event
    let clickHandler;
    // Multiple Answers are given
    if (isMultiple) {
      clickHandler = this.storeAnswers.bind(this);
    // Single Answer are given
    } else {
      clickHandler = this.makeUrl.bind(this);
    }

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

    // チェックボックスのクリック時にラベルの色を変更
    checkbox.addEventListener('change', () => {
        label.classList.toggle('selected', checkbox.checked);
    });

    const span = document.createElement('span');
    span.className = 'checkmark';

    const text = document.createElement('span');
    text.className = 'survey-text';
    // answer button (.survey-text) text 
    // This is overridden by the value specified in setupQuestion
    text.textContent = `回答 ${index + 1}`;

    label.appendChild(checkbox);
    label.appendChild(span);
    label.appendChild(text);

    return label;
  }

  /**
   * Set value from json (ref: bls-clickbooster)
   * @param {*} questionData 
   */
  setupQuestion(questionData) {
    // Set thumbnail src path        
    const thumbnailImage = document.getElementById('thumbnail_img_id');

    if (thumbnailImage) {
      if (questionData && questionData.thumbnail_img && questionData.thumbnail_img.trim() !== '') {
        thumbnailImage.src = questionData.thumbnail_img;
      } else {
        document.getElementById('left-contents').classList.add('display-none'); 
      }
    }
    
    // An id for saving the suid
    const suid = document.getElementById('suid');
    suid.value = questionData.suid;
    // An id for saving the creative_id
    const creative_id = document.getElementById('cid');
    creative_id.value = questionData.cid;
    // An id for saving the lineitem_id
    const lineitem_id = document.getElementById('aid');
    lineitem_id.value = questionData.aid;
    // the lineitem_id belonging to BLS
    const origin_line_item_id = document.getElementById('origin_liid');
    origin_line_item_id.value = questionData.origin_liid;
    // ptag setting
    const ptag = document.getElementById('ptag');
    ptag.value = questionData.ptag;
    
    // index/value pairs
    // The pair is retained even if the placement changes.
    const answerPairs = questionData.answers.map(
      (answer, index) => ({ index, answer })
    );

    if (questionData.random_flg) {
      this.shuffleAnswerButtonOrder(answerPairs);
    }

    // チェックボックスの並びをシャッフルする
    const containerId = questionData.thumbnail_img ? 'right-button-container' : 'top-button-container';
    const container   = document.getElementById(containerId);

    // 親の <label> を取得
    const elements = answerPairs.map(pair => {
        const checkbox = document.getElementById('option' + pair.index);
        if (!checkbox) return null;
        // 親の label を取得
        const label = checkbox.parentElement;
        // 同階層の .survey-text を取得
        const textElement = label.querySelector('.survey-text');
        if (textElement) {
            // answer をセット
            textElement.textContent = pair.answer; 
        }
        return label;
    // null を除外
    }).filter(el => el !== null);

    // シャッフルした順に並び替え
    elements.forEach(el => container.appendChild(el));
  }

  /**
   * Randomize answer buttons order
   * @param {*} array 
   */
  shuffleAnswerButtonOrder(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
       // shuffule array elements
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  

}
