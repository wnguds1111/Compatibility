// [파일 이름: script.js]
// 'fetch'로 로컬 데이터 파일을 불러오는 방식으로 변경

// --- [ 0. 초기 설정 ] ---
const mbtiButton = document.getElementById("mbti-button");
const astroButton = document.getElementById("astro-button");
const resultArea = document.getElementById("result-area");
const myMbtiSelect = document.getElementById("my-mbti");
const partnerMbtiSelect = document.getElementById("partner-mbti");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// [초기화] MBTI 셀렉트 박스 채우기 (데이터 파일 대신 직접 목록 제공)
const mbtiTypes = ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", 
                   "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"];
mbtiTypes.forEach(type => {
    myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
});

// --- [ 1. 탭 메뉴 기능 ] ---
function showTab(tabId) {
    tabButtons.forEach(button => button.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add("active");
    document.getElementById(tabId).classList.add("active");
    resultArea.innerHTML = "";
}

// --- [ 2. MBTI 궁합 기능 (Fetch 사용) ] ---
mbtiButton.addEventListener("click", () => {
    const myMbti = myMbtiSelect.value;
    const partnerMbti = partnerMbtiSelect.value;

    // 결과를 표시하기 전에 '로딩 중' 메시지를 띄웁니다.
    resultArea.innerHTML = `<div class="result-card"><p>궁합 데이터를 불러오는 중입니다...</p></div>`;

    // '창고'에서 궁합 파일을 'fetch'로 가져옵니다.
    // (A-B, B-A 순서를 정해줍니다. 예: INFP-ENFJ)
    const [type1, type2] = [myMbti, partnerMbti].sort();
    const fileName = `${type1}-${type2}.json`;
    
    fetch(`./data/mbti/${fileName}`)
        .then(response => {
            if (!response.ok) {
                // 파일을 찾지 못하면 (예: ENFJ-INFP.json은 없고 INFP-ENFJ.json만 있을 때)
                // 순서를 바꿔서 다시 시도
                const reverseFileName = `${partnerMbti}-${myMbti}.json`;
                return fetch(`./data/mbti/${reverseFileName}`);
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`'${fileName}' 또는 '${partnerMbti}-${myMbti}.json' 파일을 'data/mbti/' 폴더에 만들어주세요.`);
            }
            return response.json();
        })
        .then(data => {
            // 'data'는 INFP-ENFJ.json 파일의 '내용물(객체)'입니다.
            showResult(data, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
        })
        .catch(error => {
            console.error("데이터 로드 오류:", error);
            resultArea.innerHTML = `<div class="result-card"><h2>오류</h2><p>${error.message}</p></div>`;
        });
});

// --- [ 3. 별자리 궁합 기능 (Fetch 사용) ] ---
// (MBTI와 동일한 원리로, './data/astro/...' 파일을 fetch 합니다.)
// (이 부분은 나중에 추가)

// --- [ 4. 공통 헬퍼 함수 (결과 표시) ] ---
function showResult(result, title) {
    // [핵심] '5분 분량'의 긴~ 데이터를 표시하기 위해
    // 'analysis', 'deepDive' 등 모든 객체를 HTML로 변환
    
    // 1. 강점/약점 리스트(배열)를 HTML (<li>)로 변환
    const strengthsHTML = result.analysis.strengths.map(item => `<li>${item}</li>`).join("");
    const weaknessesHTML = result.analysis.weaknesses.map(item => `<li>${item}</li>`).join("");
    
    // 2. 조언 리스트(배열)를 HTML (<li>)로 변환
    const myTipsHTML = result.actionableAdvice.forMyType_Tips.map(item => `<li>${item}</li>`).join("");
    const partnerTipsHTML = result.actionableAdvice.forPartnerType_Tips.map(item => `<li>${item}</li>`).join("");

    const resultHTML = `
        <div class="result-card">
            <h2>${title}</h2>
            <h3>✨ ${result.score}점 - ${result.title} ✨</h3>
            <p>${result.summary}</p>
            
            <h3>📈 궁합 상세 분석</h3>
            <h4>강점 (Strengths)</h4>
            <ul>${strengthsHTML}</ul>
            <h4>약점 (Weaknesses)</h4>
            <ul>${weaknessesHTML}</ul>
            
            <h3>❤️ 관계 심층 탐구</h3>
            <p><strong>사랑의 언어:</strong> ${result.deepDive.loveLanguage}</p>
            <p><strong>갈등 스타일:</strong> ${result.deepDive.conflictStyle}</p>
            <p><strong>관계 목표:</strong> ${result.deepDive.relationshipGoals}</p>

            <h3>🤝 좋은 관계를 위한 조언</h3>
            <h4>${result.actionableAdvice.forMyType_Header}</h4>
            <ul>${myTipsHTML}</ul>
            <h4>${result.actionableAdvice.forPartnerType_Header}</h4>
            <ul>${partnerTipsHTML}</ul>

            <h3>🎉 상황별 궁합</h3>
            <p><strong>직장에서:</strong> ${result.funScenarios.workRelationship}</p>
            <p><strong>휴가지에서:</strong> ${result.funScenarios.onAVacation}</p>
        </div>
    `;
    resultArea.innerHTML = resultHTML;
}

// (index.html, style.css는 이전과 동일하게 사용)
