// [파일 이름: script.js] - (404 버그 최종 수정 버전)

// --- [ 0. 초기 설정 ] ---
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

    // [수정] .sort() 로직을 제거하고, 두 가지 경로를 직접 만듭니다. (버그 수정)
    // 경로 1: 내가-상대방.json (예: ENFJ-INFP.json)
    const filePath1 = `./data/mbti/${myMbti}-${partnerMbti}.json`;
    
    // 경로 2: 상대방-나.json (예: INFP-ENFJ.json)
    const filePath2 = `./data/mbti/${partnerMbti}-${myMbti}.json`;

    // [수정] runFetch에 두 경로를 전달합니다.
    runFetch(filePath1, filePath2, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
});

// --- [ 3. 별자리 궁합 기능 (Fetch + 페이지 전환) ] ---
astroButton.addEventListener("click", () => {
    const fileName = "INFP-ENFJ.json"; // (임시 테스트용)
    const filePath = `./data/mbti/${fileName}`;
    alert("별자리 로직은 아직 연결되지 않아, 임시로 'INFP-ENFJ' 테스트 데이터를 불러옵니다.");
    runFetch(filePath, null, "별자리 궁합 (테스트)");
});

// --- [ 4. 핵심 기능: Fetch 및 페이지 컨트롤 ] ---
function runFetch(filePath, reverseFilePath, title) {
    loadingOverlay.classList.remove("hidden");
    
    fetch(filePath) // 1. 첫 번째 (내가-상대방) 파일 시도
        .then(response => {
            if (!response.ok) {
                // 2. 404가 떴다면, '반대 순서' 파일(reverseFilePath)을 다시 시도
                if (reverseFilePath) {
                    return fetch(reverseFilePath);
                } else {
                    throw new Error(`데이터 파일을 찾을 수 없습니다. (경로: ${filePath})`);
                }
            }
            return response;
        })
        .then(response => {
            // 3. 두 번째 시도(반대 순서)마저 실패한 경우
            if (!response.ok) {
                // [수정] 오류 메시지가 정확한 파일명을 보여주도록 수정
                throw new Error(`데이터 파일을 찾을 수 없습니다.<br><br>깃허브 'data/mbti/' 폴더에 '${filePath.split('/').pop()}' 또는 '${reverseFilePath.split('/').pop()}' 파일이 있는지 확인해주세요.`);
            }
            // 4. 둘 중 하나라도 성공하면 JSON으로 변환
            return response.json();
        })
        .then(data => {
            // 5. 성공! 결과 표시
            showResult(data, title);
            mainPage.classList.add("hidden");
            resultPage.classList.remove("hidden");
            cardContainer.classList.add("result-active");
            pageBody.classList.add("result-active");
        })
        .catch(error => {
            // 6. 실패 처리 (JSON 파싱 오류, 404 오류 등)
            console.error("데이터 로드 오류:", error);
            if (error instanceof SyntaxError) {
                alert("데이터 파일 형식(JSON)이 올바르지 않습니다. 'data/mbti/' 폴더의 JSON 파일에 주석(//)이나 쉼표(,) 오류가 있는지 확인해주세요.");
            } else {
                resultContainer.innerHTML = `<div class="result-card"><h2>데이터 로드 오류</h2><p style="white-space: pre-wrap; word-wrap: break-word;">${error.message}</p></div>`;
                mainPage.classList.add("hidden");
                resultPage.classList.remove("hidden");
                cardContainer.classList.add("result-active");
                pageBody.classList.add("result-active");
            }
        })
        .finally(() => {
            // 7. 로딩 화면 숨기기
            loadingOverlay.classList.add("hidden");
            window.scrollTo(0, 0); 
        });
}

// [ 5. 상세 페이지 기능 ] (이하 동일)
function showResult(result, title) {
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

// [ 6. 상세 페이지 버튼 기능 ] (이하 동일)
backButton.addEventListener("click", () => {
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    cardContainer.classList.remove("result-active");
    pageBody.classList.remove("result-active");
    window.scrollTo(0, 0);
});

astroRedirectButton.addEventListener("click", (e) => {
    const targetTabId = e.target.dataset.targetTab;
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    cardContainer.classList.remove("result-active");
    pageBody.classList.remove("result-active");
    
    document.querySelector(`.tab-button[data-tab='${targetTabId}']`).click();
    window.scrollTo(0, 0);
});
