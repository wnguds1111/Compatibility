// [파일 이름: script.js]

// --- [ 0. 초기 설정 ] ---
// [수정] 페이지/로딩 요소를 모두 가져옵니다.
const mainPage = document.getElementById("main-page");
const resultPage = document.getElementById("result-page");
const loadingOverlay = document.getElementById("loading-overlay");
const resultContainer = document.getElementById("result-content");

const mbtiButton = document.getElementById("mbti-button");
const astroButton = document.getElementById("astro-button");
const backButton = document.getElementById("back-button");
const astroRedirectButton = document.getElementById("astro-redirect-button");

const myMbtiSelect = document.getElementById("my-mbti");
const partnerMbtiSelect = document.getElementById("partner-mbti");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// [초기화] MBTI 셀렉트 박스 채우기
const mbtiTypes = ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", 
                   "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"];
mbtiTypes.forEach(type => {
    myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
});

// --- [ 1. 탭 메뉴 기능 ] ---
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabId = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));
        
        button.classList.add("active");
        document.getElementById(tabId).classList.add("active");
    });
});

// --- [ 2. MBTI 궁합 기능 (Fetch + 페이지 전환) ] ---
mbtiButton.addEventListener("click", () => {
    const myMbti = myMbtiSelect.value;
    const partnerMbti = partnerMbtiSelect.value;

    // [수정] 파일 이름 정렬 (INFP-ENFJ.json만 찾도록)
    const [type1, type2] = [myMbti, partnerMbti].sort();
    const fileName = `${type1}-${type2}.json`;
    const filePath = `./data/mbti/${fileName}`;

    // [수정] 로딩 시작 -> fetch -> 페이지 전환
    runFetch(filePath, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
});

// --- [ 3. 별자리 궁합 기능 (Fetch + 페이지 전환) ] ---
astroButton.addEventListener("click", () => {
    const myDate = document.getElementById("my-astro-date").value;
    const partnerDate = document.getElementById("partner-astro-date").value;

    if (!myDate || !partnerDate) {
        alert("나와 상대방의 생년월일을 모두 입력해주세요!");
        return;
    }
    // (별자리 계산 로직은 나중에 추가 - 지금은 가짜 파일로 테스트)
    const fileName = "Aries-Leo.json"; // (임시)
    const filePath = `./data/astro/${fileName}`;

    runFetch(filePath, "별자리 궁합 (테스트)");
});

// --- [ 4. 핵심 기능: Fetch 및 페이지 컨트롤 ] ---
function runFetch(filePath, title) {
    // 1. 로딩 화면 보이기
    loadingOverlay.classList.remove("hidden");
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                // [수정] JSON 파일이 없을 때의 에러
                throw new Error(`데이터 파일을 찾을 수 없습니다. (경로: ${filePath})<br><br>깃허브 'data/mbti/' 폴더에 '${filePath.split('/').pop()}' 파일이 있는지, 파일 이름이 알파벳 순서로 정렬(예: ENFJ-INFP.json이 아닌 INFP-ENFJ.json)되어 있는지 확인해주세요.`);
            }
            return response.json();
        })
        .then(data => {
            // 2. 데이터로 결과 페이지 채우기
            showResult(data, title);
            
            // 3. 페이지 전환: 메인 숨기고, 결과 보이기
            mainPage.classList.add("hidden");
            resultPage.classList.remove("hidden");
        })
        .catch(error => {
            console.error("데이터 로드 오류:", error);
            // [수정] JSON 포맷 오류(주석 포함 등) 시 에러
            if (error instanceof SyntaxError) {
                alert("데이터 파일 형식(JSON)이 올바르지 않습니다. 파일에 주석(//)이나 쉼표(,) 오류가 있는지 확인해주세요.");
            } else {
                // 기타 오류 (파일 없음 등)
                resultContainer.innerHTML = `<div class="result-card"><h2>데이터 로드 오류</h2><p style="white-space: pre-wrap; word-wrap: break-word;">${error.message}</p></div>`;
                // 오류가 났으니 메인 페이지가 아닌 결과 페이지를 보여줌
                mainPage.classList.add("hidden");
                resultPage.classList.remove("hidden");
            }
        })
        .finally(() => {
            // 4. 로딩 화면 숨기기 (성공/실패 모든 경우)
            loadingOverlay.classList.add("hidden");
            // 페이지 상단으로 스크롤
            window.scrollTo(0, 0); 
        });
}

// [ 5. 상세 페이지 기능 ]
// 결과(result) 객체를 받아서 화면에 예쁘게 그려주는 함수
function showResult(result, title) {
    // (이전과 동일한 '블로그형' 긴 버전 표시 로직)
    const strengthsHTML = result.analysis.strengths.map(item => `<li>${item}</li>`).join("");
    const weaknessesHTML = result.analysis.weaknesses.map(item => `<li>${item}</li>`).join("");
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
    // resultContainer에 HTML 삽입
    resultContainer.innerHTML = resultHTML;
    
    // [추가] 현재 MBTI를 보고 있다면, '별자리 보러가기' 버튼을 보여줌
    if (title.includes("MBTI")) {
        astroRedirectButton.textContent = "🔮 별자리 궁합도 보러가기";
        astroRedirectButton.dataset.targetTab = "astrology";
    } else {
        astroRedirectButton.textContent = "🧠 MBTI 궁합도 보러가기";
        astroRedirectButton.dataset.targetTab = "mbti";
    }
}

// [ 6. 상세 페이지 버튼 기능 ]
// '목록으로 돌아가기' 버튼
backButton.addEventListener("click", () => {
    // 결과 페이지 숨기고, 메인 페이지 보이기
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    window.scrollTo(0, 0); // 상단으로 스크롤
});

// '다른 궁합 보러가기' 버튼
astroRedirectButton.addEventListener("click", (e) => {
    const targetTabId = e.target.dataset.targetTab;
    
    // 결과 페이지 숨기고, 메인 페이지 보이기
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    
    // 메인 페이지의 '특정 탭'을 열어줌
    showTab(targetTabId);
    window.scrollTo(0, 0); // 상단으로 스크롤
});
