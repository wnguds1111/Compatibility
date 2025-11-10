// [파일 이름: script.js]

// --- [ 0. 초기 설정 ] ---

// HTML의 핵심 요소들을 미리 찾아둡니다.
const mbtiButton = document.getElementById("mbti-button");
const astroButton = document.getElementById("astro-button");
const resultArea = document.getElementById("result-area");

const myMbtiSelect = document.getElementById("my-mbti");
const partnerMbtiSelect = document.getElementById("partner-mbti");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// [초기화] MBTI 셀렉트 박스에 16가지 유형 채우기
// (compatibilityData.js에 있는 mbtiTypes 배열 사용)
mbtiTypes.forEach(type => {
    myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
});


// --- [ 1. 탭 메뉴 기능 ] ---

function showTab(tabId) {
    // 1. 모든 탭 버튼과 콘텐츠에서 'active' 클래스를 제거
    tabButtons.forEach(button => button.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    // 2. 클릭된 탭 버튼과 그에 맞는 콘텐츠에 'active' 클래스를 추가
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
    
    // 3. 탭을 바꿀 때마다 이전 결과는 지웁니다.
    resultArea.innerHTML = "";
}


// --- [ 2. MBTI 궁합 기능 ] ---

mbtiButton.addEventListener("click", () => {
    const myMbti = myMbtiSelect.value;
    const partnerMbti = partnerMbtiSelect.value;

    // 데이터 파일(compatibilityData.js)에서 궁합 정보를 찾습니다.
    let result = null;
    
    // A->B 또는 B->A 순서로 데이터를 찾습니다. (데이터 효율화를 위해)
    if (mbtiCompatibility[myMbti] && mbtiCompatibility[myMbti][partnerMbti]) {
        result = mbtiCompatibility[myMbti][partnerMbti];
    } else if (mbtiCompatibility[partnerMbti] && mbtiCompatibility[partnerMbti][myMbti]) {
        result = mbtiCompatibility[partnerMbti][myMbti];
    }

    // 결과 표시
    showResult(result, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
});


// --- [ 3. 별자리 궁합 기능 ] ---

astroButton.addEventListener("click", () => {
    const myDate = document.getElementById("my-astro-date").value;
    const partnerDate = document.getElementById("partner-astro-date").value;

    if (!myDate || !partnerDate) {
        alert("나와 상대방의 생년월일을 모두 입력해주세요!");
        return;
    }

    // 생년월일로 별자리를 찾아냅니다. (아래 helper 함수 사용)
    const mySign = getZodiacSign(myDate);
    const partnerSign = getZodiacSign(partnerDate);

    // 데이터 파일(compatibilityData.js)에서 궁합 정보를 찾습니다.
    let result = null;
    if (astrologyCompatibility[mySign] && astrologyCompatibility[mySign][partnerSign]) {
        result = astrologyCompatibility[mySign][partnerSign];
    } else if (astrologyCompatibility[partnerSign] && astrologyCompatibility[partnerSign][mySign]) {
        result = astrologyCompatibility[partnerSign][mySign];
    }

    // 결과 표시
    showResult(result, `별자리 궁합: ${mySign} & ${partnerSign}`);
});


// --- [ 4. 공통 헬퍼 함수 ] ---

// 결과(result) 객체를 받아서 화면에 예쁘게 그려주는 함수
function showResult(result, title) {
    if (result) {
        // 기획자님이 요청하신 '상황별 조언'을 모두 포함
        const resultHTML = `
            <div class="result-card">
                <h2>${title}</h2>
                <p><strong>✨ 궁합 점수: ${result.score}점 - ${result.title}</strong></p>
                
                <h3>❤️ 연인 관계일 때</h3>
                <p>${result.asLovers || "데이터가 없습니다."}</p>
                
                <h3>💡 소개팅 상황이라면?</h3>
                <p>${result.blindDateTips || "데이터가 없습니다."}</p>
                
                <h3>🤝 좋은 관계를 위한 조언</h3>
                <p>${result.relationshipTips || "데이터가 없습니다."}</Vercel 
            </div>
        `;
        resultArea.innerHTML = resultHTML;
    } else {
        // 일치하는 데이터가 없을 경우
        resultArea.innerHTML = `
            <div class="result-card">
                <h2>오류</h2>
                <p>궁합 정보를 찾을 수 없습니다. (데이터 파일에 해당 조합이 비어있습니다.)</p>
            </div>
        `;
    }
}

// 생년월일(YYYY-MM-DD)을 별자리 이름으로 바꿔주는 함수
function getZodiacSign(dateString) {
    // 날짜 문자열에서 월(MM)과 일(DD)만 'MM-DD' 형태로 추출
    const monthDay = dateString.substring(5); // 예: "1990-10-30" -> "10-30"
    
    // compatibilityData.js에 있는 zodiacSigns 배열을 순회하며 맞는 별자리를 찾음
    for (const sign of zodiacSigns) {
        // '염소자리'는 12-25~12-31 과 01-01~01-19 두 구간에 걸쳐있음
        if (sign.name === "염소자리" && (monthDay >= "12-25" || monthDay <= "01-19")) {
            return "염소자리";
        }
        if (monthDay >= sign.start && monthDay <= sign.end) {
            return sign.name;
        }
    }
    // 기본값 (보통 염소자리가 됨)
    return "염소자리";
}
