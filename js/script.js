$(function(){
  // ===== 게임 변수 초기화 =====
  let score = 0;            // 플레이어의 현재 점수
  let miss = 0;             // 놓친 아이템 수
  let timeLeft = 60;        // 남은 게임 시간 (1분 = 초)
  let gameActive = true;    // 게임 진행 상태 확인
  let gameInterval;         // 떨어지는 아이템 생성 후 id 값 설정
  let timerInterval;        // 타이머 id


  const keyMap = {
    d:0,
    f:1,
    j:2,
    k:3,
  };


  /**
   * 게임 시작 함수
   * - 아이템 생성과 타이머를 시작한다.
   */

  function startGame(){
    // 새로운 아이템을 0.8초마다 생성해서 떨어트리기
    gameInterval = setInterval(아이템생성함수, 800);    // 1000 = 1초
    // 1초마다 타이머 업데이트하기
    timerInterval = setInterval(타이머함수, 1000);
  }

  /**
   * 타이머 업데이트 함수
   * - 매초마다 실행되어 남은 시간을 감소시킨다.
   * - 시간이 0이 되면 게임을 종료한다.
   */

  function 타이머함수(){
    timeLeft--;                  // 남은 시간 1초 감소
    $("#timer").text(timeLeft);  // 화면에 남은 시간 표시하기

    // 시간이 60초가 다 되면 게임 종료
    if (timeLeft <= 0) {
      endGame();
    }
  }

  /**
   * 게임 종료 함수
   * - 모든 인터벌을 정리하고, 최종 결과를 표시한다.
   */

  function endGame(){
    gameActive = false;           // 게임 상태 비활성화
    clearInterval(gameInterval);  // 떨어지는 아이템 생성 중지
    clearInterval(timerInterval); // 60초부터 떨어지는 시간 초 설정 중지

    // 최종 점수를 게임오버 모달에 표시
    $("#final-score").text(score);
    $("#final-miss").text(miss);
    $("#game-over").show();       // 게임 종료 표시
  }

  /**
   * 아이템 생성 함수
   * - 랜덤한 레인에 새로운 아이템을 생성하고, 아래로 떨어트린다.
   * - 아이템생성함수 -> createItems 함수명 변경하는 것을 추천
   */

  function 아이템생성함수(){
    // 0,1,2,3 중 랜덤으로 레인 선택하기
    const lane = Math.floor(Math.random() * 4);

    // 선택된 레인의 가로 너비 계산하기
    // 0~3번 레인 중에서 .eq = 동일한 레인의 가로 너비 길이 가져오기
    const width = $(".lane").eq(lane).width();

    // 새로운 아이템 생성하고 떨어트리기
    const item = $("<div class='note'>")
    .css({
      left:lane * width + "px",
      width:width + "px"
    }).data("lane", lane)                 // 아이템이 속한 레인 번호 저장

    // 게임 컨테이너에 아이템 추가
    $("#game-container").append(item);

    // 아이템을 아래로 떨어트리는 애니메이션 (2초)
    item.animate(
      {top:$("#game-container").height() + "px"}, 1000, "linear", function(){
        // 애니메이션 완료 시 (아이템이 높이 아래에 도착했을 때)
        if (gameActive) {
          $(this).remove();       // 현재 아이템 제거
          miss++;                 // 놓친 아이템 개수 증가
          $("#miss").text(miss);  // 놓친 아이템 개수 작성
        }
      }
    )
  }

  /**
   * 아이템 적중 시 시각적으로 적중했다는 효과를 생성하는 함수
   * @param {number} laneIndex - 효과를 표시할 레인 번호(0~3) 매개변수
   */

  function 성공함수(laneIndex){
    // 해당 레인의 위치 정보 가져오기
    const lane = $(".lane").eq(laneIndex);
    const laneOffset = lane.position();

    const effect = $("<div class='hit-effect'>").css({
      // left는 레인 중앙에 위치하도록 x좌표 계산 (효과 크기의 절반만큼 보정)
      left:laneOffset.left + lane.width() / 2 - 30 + "px",
      top:$("#game-container").height() - 120 + "px",
    });

    $("body").append(effect);
    setTimeout(()=>effect.remove(), 400)
  }



  /**
   * 키보드 입력 처리 함수
   * - d, f, j, k 키 입력을 감지하여 아이템 판정을 수행한다.
   */

  $(document).keydown(function(e){
    // 입력된 키를 소문자로 무조건 변환
    const key = e.key.toLowerCase();      // 소문자로 변환

    // 유효한 키가 아니라면 다른 키보드는 무시한다.
    // 객체에서 .hasOwnProperty(사용자가 작성한 키보드 입력 값을)
    //          가지고 있나요?
    if (!keyMap.hasOwnProperty(key)){     // 가지고 있지 않은게 사실이라면!
      return;                             // 아래 코드를 수행하지 못하도록 돌려보내기
    }

    // 입력된 키에 해당하는 레인 번호 가져오기
    const lane = keyMap[key];

    // 키모드가 누르는 판정선 위치를 계산
    // 현재 위치는 하단에서 80px 위로 설정한다.
    const judgeLine = $("#game-container").height() - 80;

    // 해당 레인의 모든 아이템을 검사해서 판정 수행
    $(".note").each(function(){
      // 현재 아이템이 입력된 키의 레인과 일치하는지 확인한다.
      if ($(this).data("lane")===lane){
        const notePos = $(this).position().top + 25;

        // 아이템이 판정선 근처에 있는지 확인 (50px 오차 범위 사이)
        if (Math.abs(notePos - judgeLine) < 50 ) {
          $(this).stop().remove();
          score++;
          $("#score").text(score);

          // 성공 시각 효과 실행
          성공함수(lane);

          // 해당 키 버튼에 성공 효과 클래스 추가하기
          // setTimeout을 이용해서 입력한 키보드 효과를 0.3초 후 누르고 떼는 설정에 대해서 CSS 제공
          $(".key").eq(lane).addClass("perfect");
          setTimeout(()=>$(".key").eq(lane).removeClass("perfect"), 300);

          return false;       // each를 중단 (하나의 아이템만 처리)
        }
      }
    })

    // 성공, 실패 상관없이 키 눌림 설정에 css 효과 표현하기
    // $(".key").eq(lane) - 현재 눌림을 당하는 키에 passed 클래스 추가하고,
    $(".key").eq(lane).addClass("passed");
    // 0.1초 후 눌림을 당하고, 눌림 당하기를 종료한 레인 키에 passed 클래스 제거한다.
    setTimeout(()=>$(".key").eq(lane).removeClass("passed"), 100);
  })

 $("#startBtn").click(startGame);
})