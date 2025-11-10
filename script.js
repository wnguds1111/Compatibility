// [파일 이름: script.js]
// 'fetch'로 로컬 데이터 파일을 불러오는 방식으로 변경 + 로딩/상세페이지 추가

// --- [ 0. 초기 설정 ] ---
const mbtiButton = document.getElementById("mbti-button");
const astroButton = document.getElementById("astro-button");
// const resultArea = document.getElementById("result-area"); // 이제 이 요소는 사용하지 않습니다.

const myMbtiSelect = document.getElementById("my-mbti");
const partnerMbtiSelect = document.getElementById("partner-mbti");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// 새로 추가된 요소들
const loadingOverlay = document.getElementById("loading-overlay");
const detailPageOverlay = document.getElementById("detail-page-overlay");
const detailResultArea = document.getElementById("detail-result-area"); // 상세 페이지 내 결과 영역

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
    closeDetailPage(); // 탭 전환 시 상세 페이지 닫기
    // resultArea.innerHTML = ""; // 기존 resultArea는 사용하지 않음
}

// --- [ 2. 로딩 화면 제어 ] ---
function showLoading() {
    loadingOverlay.style.display = "flex"; // 로딩 화면 보이기
}

function hideLoading() {
    loadingOverlay.style.display = "none"; // 로딩 화면 숨기기
}

// --- [ 3. 상세 페이지 제어 ] ---
function showDetailPage() {
    detailPageOverlay.style.display = "flex"; // 상세 페이지 보이기
    // 상세 페이지가 열릴 때 최상단으로 스크롤
    detailPageOverlay.scrollTo(0, 0); 
}

function closeDetailPage() {
    detailPageOverlay.style.display = "none"; // 상세 페이지 숨기기
    // 상세 페이지를 닫을 때 메인 컨테이너 최상단으로 스크롤 (선택 사항)
    document.querySelector(".container").scrollTo(0,0);
}

// '별자리 궁합도 확인하기' 버튼 클릭 시
function goToAstrologyTab() {
    closeDetailPage(); // 상세 페이지 닫기
    showTab('astrology'); // 별자리 탭으로 전환
    // 별자리 탭으로 스크롤 (선택 사항)
    document.getElementById('astrology').scrollIntoView({ behavior: 'smooth' });
}


// --- [ 4. MBTI 궁합 기능 (Fetch 사용) ] ---
mbtiButton.addEventListener("click", () => {
    const myMbti = myMbtiSelect.value;
    const partnerMbti = partnerMbtiSelect.value;

    showLoading(); // 로딩 화면 시작

    const [type1, type2] = [myMbti, partnerMbti].sort();
    const fileName = `${type1}-${type2}.json`;
    
    fetch(`./data/mbti/${fileName}`)
        .then(response => {
            if (!response.ok) {
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
            hideLoading(); // 로딩 화면 종료
            showResult(data, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
            showDetailPage(); // 상세 페이지 열기
        })
        .catch(error => {
            hideLoading(); // 로딩 화면 종료
            console.error("데이터 로드 오류:", error);
            detailResultArea.innerHTML = `
                <div class="result-card">
                    <h2>오류 발생</h2>
                    <p>궁합 정보를 불러오는 데 실패했습니다. 파일이름: ${fileName}</p>
                    <p>${error.message}</p>
                </div>
            `;
            showDetailPage(); // 오류 페이지도 상세 페이지로 보여줌
        });
});

// --- [ 5. 별자리 궁합 기능 (Fetch 사용) ] ---
// (이 부분은 MBTI와 동일한 원리로, './data/astro/...' 파일을 fetch 합니다.)
// (나중에 추가할 때, MBTI 버튼 클릭 로직과 유사하게 showLoading, hideLoading, showDetailPage를 포함하면 됩니다)
astroButton.addEventListener("click", () => {
    // 임시 로딩 & 상세 페이지 표시
    showLoading();
    setTimeout(() => { // 실제 fetch처럼 보이도록 딜레이
        hideLoading();
        detailResultArea.innerHTML = `<div class="result-card"><h2>별자리 궁합 준비 중!</h2><p>이 기능도 곧 멋진 상세 페이지로 찾아올게요!</p></div>`;
        showDetailPage();
    }, 1500);
});

// --- [ 6. 공통 헬퍼 함수 (결과 표시) ] ---
function showResult(result, title) {
    const strengthsHTML = result.analysis.strengths.map(item => `<li>${item}</li>`).join("");
    const weaknessesHTML = result.analysis.weaknesses.map(item => `<li>${item}</li>`).join("");
    
    const myTipsHTML = result.actionableAdvice.forMyType_Tips.map(item => `<li>${item}</li>`).join("");
    const partnerTipsHTML = result.actionableAdvice.forPartnerType_Tips.map(item => `<li>${item}</li>`).join("");

    const resultHTML = `
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
    `;
    detailResultArea.innerHTML = resultHTML; // 결과를 상세 페이지 영역에 표시
}
