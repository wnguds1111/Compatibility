// [파일 이름: script.js] - (ReferenceError 최종 수정 및 복구 버전)

// --- [ 0. 핵심 변수 정의 (파일 맨 위) ] ---
// 이 변수들은 HTML 요소에 대한 참조입니다. 누락되면 안 됩니다!
const pageBody = document.body;
const cardContainer = document.querySelector(".card-container");

const mainPage = document.getElementById("main-page");
const resultPage = document.getElementById("result-page");
const loadingOverlay = document.getElementById("loading-overlay");
const resultContainer = document.getElementById("result-content");
const loadingText = document.getElementById("loading-text"); 

const mbtiButton = document.getElementById("mbti-button");
const astroButton = document.getElementById("astro-button");
const backButton = document.getElementById("back-button");
const astroRedirectButton = document.getElementById("astro-redirect-button");

const myMbtiSelect = document.getElementById("my-mbti");
const partnerMbtiSelect = document.getElementById("partner-mbti");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

// [추가] 다국어 버튼 정의 (null 체크를 위해 DOM이 로드된 후 시도)
const langKoButton = document.getElementById("lang-ko-button");
const langEnButton = document.getElementById("lang-en-button");
const langZhButton = document.getElementById("lang-zh-button");
const langJaButton = document.getElementById("lang-ja-button");


// [초기화] MBTI 셀렉트 박스 채우기 (이전과 동일)
const mbtiTypes = ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", 
                   "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"];
mbtiTypes.forEach(type => {
    // [수정] null 체크 추가: myMbtiSelect이 null이 아닐 때만 실행
    if (myMbtiSelect) {
        myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    }
    if (partnerMbtiSelect) {
        partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    }
});


// [추가] 현재 결과 HTML을 저장할 변수 (번역 원본)
let currentResultHTML = ""; 
let currentTitle = "";
let currentLang = 'ko'; // 기본 언어


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
if (mbtiButton) {
    mbtiButton.addEventListener("click", () => {
        const myMbti = myMbtiSelect.value;
        const partnerMbti = partnerMbtiSelect.value;
        
        const [type1, type2] = [myMbti, partnerMbti].sort();
        const fileName = `${type1}-${type2}.json`;
        const filePath = `./data/mbti/${fileName}`;
        const reverseFilePath = `./data/mbti/${partnerMbti}-${myMbti}.json`; // 404 대비

        runFetch(filePath, reverseFilePath, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
    });
}

// --- [ 3. 별자리 궁합 기능 ] ---
if (astroButton) {
    astroButton.addEventListener("click", () => {
        const fileName = "INFP-ENFJ.json"; // (임시 테스트용)
        const filePath = `./data/mbti/${fileName}`;
        alert("별자리 로직은 아직 연결되지 않아, 임시로 'INFP-ENFJ' 테스트 데이터를 불러옵니다.");
        runFetch(filePath, null, "별자리 궁합 (테스트)");
    });
}


// --- [ 4. 핵심 기능: Fetch 및 페이지 컨트롤 ] ---
function runFetch(filePath, reverseFilePath, title) {
    loadingOverlay.classList.remove("hidden");
    loadingText.textContent = "궁합 데이터를 불러오는 중입니다...";
    
    fetch(filePath)
        .then(response => {
            if (!response.ok && reverseFilePath) {
                return fetch(reverseFilePath);
            } else if (!response.ok) {
                 throw new Error(`데이터 파일을 찾을 수 없습니다. (경로: ${filePath})`);
            }
            return response;
        })
        .then(response => {
            if (!response.ok) {
                // [404 오류 메시지 수정]
                const baseFileName = filePath.split('/').pop();
                const reverseFileName = reverseFilePath ? reverseFilePath.split('/').pop() : '';
                throw new Error(`데이터 파일을 찾을 수 없습니다.<br><br>깃허브 'data/mbti/' 폴더에 '${baseFileName}' ${reverseFileName ? `또는 '${reverseFileName}'` : ''} 파일이 있는지 확인해주세요.`);
            }
            return response.json();
        })
        .then(data => {
            // 4. 성공! 결과 표시 + '크기/정렬' 변경
            currentTitle = title; 
            showResult(data, title);
            mainPage.classList.add("hidden");
            resultPage.classList.remove("hidden");
            cardContainer.classList.add("result-active"); 
            pageBody.classList.add("result-active");
        })
        .catch(error => {
            // 5. 실패 처리
            console.error("데이터 로드 오류:", error);
            if (error instanceof SyntaxError) {
                alert("데이터 파일 형식(JSON)이 올바르지 않습니다. 파일에 주석(//)이나 쉼표(,) 오류가 있는지 확인해주세요.");
            } else {
                resultContainer.innerHTML = `<div class="result-card"><h2>데이터 로드 오류</h2><p style="white-space: pre-wrap; word-wrap: break-word;">${error.message}</p></div>`;
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

// [ 5. 상세 페이지 기능 ]
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
    
    // [핵심 추가] 결과 HTML을 전역 변수에 저장합니다.
    currentResultHTML = resultHTML;

    if (title.includes("MBTI")) {
        // ... (하단 버튼 로직) ...
        document.querySelector(`#astro-redirect-button`).textContent = "🔮 별자리 궁합도 보러가기";
        document.querySelector(`#astro-redirect-button`).dataset.targetTab = "astrology";
    } else {
        // ... (하단 버튼 로직) ...
        document.querySelector(`#astro-redirect-button`).textContent = "🧠 MBTI 궁합도 보러가기";
        document.querySelector(`#astro-redirect-button`).dataset.targetTab = "mbti";
    }
    
    // [추가] SNS 공유 기능 연결 (결과 페이지 버튼)
    setupResultShareButtons(title);
}

// [ 6. 상세 페이지 버튼 기능 ]
backButton.addEventListener("click", () => {
    // ... (이전과 동일) ...
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    cardContainer.classList.remove("result-active");
    pageBody.classList.remove("result-active");
    window.scrollTo(0, 0);
});

astroRedirectButton.addEventListener("click", (e) => {
    // ... (이전과 동일) ...
    const targetTabId = e.target.dataset.targetTab;
    
    resultPage.classList.add("hidden");
    mainPage.classList.remove("hidden");
    cardContainer.classList.remove("result-active");
    pageBody.classList.remove("result-active");
    
    document.querySelector(`.tab-button[data-tab='${targetTabId}']`).click();
    window.scrollTo(0, 0);
});


// --- [ 7. 실시간 AI 번역 기능 (핵심) ] ---
// (이전 답변에 드렸던 setLanguage 함수 및 이벤트 리스너 로직 여기에 포함)
function setLanguage(targetLangCode) {
    const languageMap = {
        'ko': 'Korean',
        'en': 'English',
        'zh': 'Chinese (Simplified)',
        'ja': 'Japanese'
    };
    
    const targetLang = languageMap[targetLangCode];
    
    if (!currentResultHTML) {
        alert("MBTI 궁합 결과를 먼저 확인해주세요.");
        return;
    }

    if (currentLang === targetLangCode) {
        // 이미 해당 언어일 경우
        return; 
    }

    loadingOverlay.classList.remove("hidden");
    loadingText.textContent = `${languageMap[currentLang]}에서 ${targetLang}로 번역 중입니다...`;

    fetch(`./api/translate?text=${encodeURIComponent(currentResultHTML)}&targetLang=${targetLang}`)
        .then(res => res.json())
        .then(data => {
            if (data.translatedText) {
                resultContainer.innerHTML = data.translatedText;
                
                document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.lang-btn[data-lang='${targetLangCode}']`).classList.add('active');
                currentLang = targetLangCode;
                
                setupResultShareButtons(document.querySelector('#result-content h2').textContent);

            } else {
                alert(`번역 오류: ${data.error || "알 수 없는 오류"}`);
            }
        })
        .catch(err => {
            console.error("Translation API Error:", err);
            alert("번역 서비스 연결에 실패했습니다. (OpenAI 키 확인)");
        })
        .finally(() => {
            loadingOverlay.classList.add("hidden");
            loadingText.textContent = "궁합 결과를 분석 중입니다..."; // 초기 텍스트로 복구
        });
}

// [ 8. SNS 공유 기능 로직 ]
function setupResultShareButtons(title) {
    // ... (이전과 동일) ...
    const resultShareClipboard = document.getElementById('result-share-clipboard');
    const shareUrl = window.location.href; 
    
    const buttons = [
        { btn: document.getElementById('result-share-facebook'), platform: 'facebook' },
        { btn: document.getElementById('result-share-twitter'), platform: 'twitter' },
        { btn: document.getElementById('result-share-kakaotalk'), platform: 'kakaotalk' },
        { btn: resultShareClipboard, platform: 'clipboard' }
    ];

    buttons.forEach(({ btn, platform }) => {
        if (btn) {
            btn.onclick = () => {
                shareResultLink(platform, title, shareUrl);
            };
        }
    });
}

function shareResultLink(platform, title, url) {
    const finalUrl = encodeURIComponent(url);
    const finalTitle = encodeURIComponent(title);

    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${finalUrl}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${finalTitle}&url=${finalUrl}`, '_blank');
            break;
        case 'kakaotalk':
            navigator.clipboard.writeText(url);
            alert("🔗 카카오톡 공유를 위해 링크가 클립보드에 복사되었습니다.");
            break;
        case 'clipboard':
            navigator.clipboard.writeText(url);
            alert("🔗 궁합 결과 링크가 클립보드에 복사되었습니다.");
            break;
    }
}

// [추가] 언어 선택 버튼에 이벤트 리스너 연결
if (langKoButton) langKoButton.addEventListener('click', () => setLanguage('ko'));
if (langEnButton) langEnButton.addEventListener('click', () => setLanguage('en'));
if (langZhButton) langZhButton.addEventListener('click', () => setLanguage('zh'));
if (langJaButton) langJaButton.addEventListener('click', () => setLanguage('ja'));
