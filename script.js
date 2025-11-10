// [파일 이름: script.js] - (동적 크기/정렬 제어 버전)

// --- [ 0. 초기 설정 ] ---
// [수정] body와 .card-container를 제어하기 위해 추가
const pageBody = document.body;
const cardContainer = document.querySelector(".card-container");

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

// --- [ 2. MBTI 궁합 기능 ] ---
mbtiButton.addEventListener("click", () => {
    const myMbti = myMbtiSelect.value;
    const partnerMbti = partnerMbtiSelect.value;
    const [type1, type2] = [myMbti, partnerMbti].sort();
    const fileName = `${type1}-${type2}.json`;
    const filePath = `./data/mbti/${fileName}`;
    const reverseFilePath = `./data/mbti/${partnerMbti}-${myMbti}.json`;

    runFetch(filePath, reverseFilePath, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
});

// --- [ 3. 별자리 궁합 기능 ] ---
astroButton.addEventListener("click", () => {
    const fileName = "INFP-ENFJ.json"; // (임시 테스트용)
    const filePath = `./data/mbti/${fileName}`;
    alert("별자리 로직은 아직 연결되지 않아, 임시로 'INFP-ENFJ' 테스트 데이터를 불러옵니다.");
    runFetch(filePath, null, "별자리 궁합 (테스트)");
});

// --- [ 4. 핵심 기능: Fetch 및 페이지 컨트롤 ] ---
function runFetch(filePath, reverseFilePath, title) {
    loadingOverlay.classList.remove("hidden");
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                if (reverseFilePath) {
                    return fetch(reverseFilePath);
                } else {
                    throw new Error(`데이터 파일을 찾을 수 없습니다. (경로: ${filePath})`);
                }
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`데이터 파일을 찾을 수 없습니다.<br><br>깃허브 'data/mbti/' 폴더에 '${filePath.split('/').pop()}' 또는 '${reverseFilePath.split('/').pop()}' 파일이 있는지 확인해주세요.`);
            }
            return response.json();
        })
        .then(data => {
            showResult(data, title);
            // [수정] 페이지 전환 + '크기/정렬' 변경
            mainPage.classList.add("hidden");
            resultPage.classList.remove("hidden");
            cardContainer.classList.add("result-active"); // 카드를 1200px로
            pageBody.classList.add("result-active"); // body 정렬을 '위'로
        })
        .catch(error => {
            console.error("데이터 로드 오류:", error);
            if (error instanceof SyntaxError) {
                alert("데이터 파일 형식(JSON)이 올바르지 않습니다. 'data/mbti/' 폴더의 JSON 파일에 주석(//)이나 쉼표(,) 오류가 있는지 확인해주세요.");
            } else {
                resultContainer.innerHTML = `<div class="result-card"><h2>데이터 로드 오류</h2><p style="white-space: pre-wrap; word-wrap: break-word;">${error.message}</p></div>`;
                // [수정] 에러 시에도 '결과 페이지' 스타일 적용
                mainPage.classList.add("hidden");
                resultPage.classList.remove("hidden");
                cardContainer.classList.add("result-active");
                pageBody.classList.add("result-active");
            }
        })
        .finally(() => {
            loadingOverlay.classList.add("hidden");
            window.scrollTo(0, 0); 
        });
}

// [ 5. 상세 페이지 기능 ] (이하 동일)
function showResult(result, title) {
    // ... (이전과 동일한 '블로그형' 긴 버전 표시 로직) ...
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
    resultContainer.innerHTML = resultHTML;
    
    if (title.includes("MBTI")) {
        astroRedirectButton.textContent = "🔮 별자리 궁합도 보러가기";
        astroRedirectButton.dataset.targetTab = "astrology";
    } else {
        astroRedirectButton.textContent = "🧠 MBTI 궁합도 보러가기";
        astroRedirectButton.dataset.targetTab = "mbti";
    }
}

// [ 6. 상세 페이지 버튼 기능 ]
backButton.addEventListener("click", () => {
    // [수정] 페이지 전환 + '크기/정렬' 원상복구
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    cardContainer.classList.remove("result-active"); // 카드를 600px로
    pageBody.classList.remove("result-active"); // body 정렬을 '중앙'으로
    window.scrollTo(0, 0);
});

astroRedirectButton.addEventListener("click", (e) => {
    const targetTabId = e.target.dataset.targetTab;
    
    // [수정] 페이지 전환 + '크기/정렬' 원상복구
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    cardContainer.classList.remove("result-active");
    pageBody.classList.remove("result-active");
    
    document.querySelector(`.tab-button[data-tab='${targetTabId}']`).click();
    window.scrollTo(0, 0);
});
