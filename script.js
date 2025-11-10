// [파일 이름: script.js] - 최종 통합 버전

// --- [ 0. 초기 설정 ] ---
const pageBody = document.body;
const cardContainer = document.querySelector(".card-container");
const loadingOverlay = document.getElementById("loading-overlay");
const resultContainer = document.getElementById("result-content");
const loadingText = document.getElementById("loading-text"); // 로딩 텍스트

const mbtiButton = document.getElementById("mbti-button");
// ... (나머지 버튼 정의) ...
const astroRedirectButton = document.getElementById("astro-redirect-button");

// [추가] 다국어 버튼 정의
const langKoButton = document.getElementById("lang-ko-button");
const langEnButton = document.getElementById("lang-en-button");
const langZhButton = document.getElementById("lang-zh-button");
const langJaButton = document.getElementById("lang-ja-button");

// [추가] 현재 결과 HTML을 저장할 변수 (번역 원본)
let currentResultHTML = ""; 
let currentTitle = "";
// [추가] 현재 언어 상태 (기본 한국어)
let currentLang = 'ko';

// [초기화] MBTI 셀렉트 박스 채우기 (이전과 동일)
const mbtiTypes = ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", 
                   "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"];
mbtiTypes.forEach(type => {
    myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
});


// --- [ 1. 탭 메뉴 및 궁합 기능 (기존 로직) ] ---
// (이전과 동일 - 변화 없음)

// --- [ 4. 핵심 기능: Fetch 및 페이지 컨트롤 ] ---
function runFetch(filePath, reverseFilePath, title) {
    loadingOverlay.classList.remove("hidden");
    loadingText.textContent = "궁합 데이터를 불러오는 중입니다..."; // 로딩 텍스트 초기화
    
    // ... (Fetch 로직은 이전과 동일 - 404/중복 파일 처리) ...
    
    fetch(filePath)
        // ... (중간 로직 생략) ...
        .then(data => {
            // 성공! 결과 표시 + '크기/정렬' 변경
            currentTitle = title; // 제목 저장
            showResult(data, title);
            mainPage.classList.add("hidden");
            resultPage.classList.remove("hidden");
            cardContainer.classList.add("result-active"); 
            pageBody.classList.add("result-active");
            
            // [추가] 기본 언어(ko)로 현재 페이지 텍스트를 저장합니다.
            currentResultHTML = resultContainer.innerHTML;
        })
        // ... (Catch 로직 생략) ...
        .finally(() => {
            loadingOverlay.classList.add("hidden");
            window.scrollTo(0, 0); 
        });
}

// [ 5. 상세 페이지 기능 - 결과 표시 ]
function showResult(result, title) {
    // ... (이전과 동일한 '블로그형' 긴 버전 표시 로직) ...
    const strengthsHTML = result.analysis.strengths.map(item => `<li>${item}</li>`).join("");
    // ... (나머지 HTML 변환 로직) ...

    const resultHTML = `
        <div class="result-card">
            <h2>${title}</h2>
            <h3>✨ ${result.score}점 - ${result.title} ✨</h3>
            <p>${result.summary}</p>
            // ... (나머지 HTML) ...
        </div>
    `;
    resultContainer.innerHTML = resultHTML;
    
    // [추가] SNS 공유 기능 연결 (결과 페이지 버튼)
    setupResultShareButtons(title);

    // ... (하단 버튼 로직은 동일) ...
}


// --- [ 7. 실시간 AI 번역 기능 (핵심) ] ---
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

    // 1. 로딩 시작 (분석 중 -> 번역 중)
    loadingOverlay.classList.remove("hidden");
    loadingText.textContent = `${languageMap[currentLang]}에서 ${targetLang}로 번역 중입니다...`;

    // 2. 번역 API 호출
    fetch(`./api/translate?text=${encodeURIComponent(currentResultHTML)}&targetLang=${targetLang}`)
        .then(res => res.json())
        .then(data => {
            if (data.translatedText) {
                // 3. 번역된 HTML로 교체
                resultContainer.innerHTML = data.translatedText;
                
                // 4. 언어 상태 업데이트
                document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`.lang-btn[data-lang='${targetLangCode}']`).classList.add('active');
                currentLang = targetLangCode;
                
                // [수정] 번역 후에도 공유 버튼이 다시 연결되도록 함
                setupResultShareButtons(document.querySelector('#result-content h2').textContent);

            } else {
                alert(`번역 오류: ${data.error || "알 수 없는 오류"}`);
            }
        })
        .catch(err => {
            console.error("Translation API Error:", err);
            alert("번역 서비스 연결에 실패했습니다. (OpenAI 키 또는 Vercel 프록시 확인)");
        })
        .finally(() => {
            loadingOverlay.classList.add("hidden");
            loadingText.textContent = "궁합 결과를 분석 중입니다..."; // 초기 텍스트로 복구
        });
}

// [추가] 탭 버튼에 이벤트 리스너 연결
langKoButton.addEventListener('click', () => setLanguage('ko'));
langEnButton.addEventListener('click', () => setLanguage('en'));
langZhButton.addEventListener('click', () => setLanguage('zh'));
langJaButton.addEventListener('click', () => setLanguage('ja'));


// --- [ 8. SNS 공유 기능 로직 ] ---
function setupResultShareButtons(title) {
    // 결과 페이지 하단 공유 버튼에 이벤트 연결
    const resultShareClipboard = document.getElementById('result-share-clipboard');
    const resultShareFacebook = document.getElementById('result-share-facebook');
    const resultShareTwitter = document.getElementById('result-share-twitter');
    const resultShareKakaotalk = document.getElementById('result-share-kakaotalk');

    const shareUrl = window.location.href; 
    const shareTitle = `[${title}] ${document.querySelector('#result-content h3').textContent}`;

    const buttons = [
        { btn: resultShareClipboard, platform: 'clipboard' },
        { btn: resultShareFacebook, platform: 'facebook' },
        { btn: resultShareTwitter, platform: 'twitter' },
        { btn: resultShareKakaotalk, platform: 'kakaotalk' }
    ];

    buttons.forEach(({ btn, platform }) => {
        if (btn) {
            btn.onclick = () => {
                shareResultLink(platform, shareTitle, shareUrl);
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
            // 실제 SDK 연동이 필요하지만, 여기서는 링크 복사로 대체
            navigator.clipboard.writeText(url);
            alert("🔗 카카오톡 공유를 위해 링크가 클립보드에 복사되었습니다.");
            break;
        case 'clipboard':
            navigator.clipboard.writeText(url);
            alert("🔗 궁합 결과 링크가 클립보드에 복사되었습니다.");
            break;
    }
}
