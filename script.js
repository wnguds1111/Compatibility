// [파일 이름: script.js] - (최종 안정화 버전 / AI 번역 제거)

// --- [ 0. 핵심 변수 정의 ] ---
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

let currentTitle = "";


// --- [ 1. 데이터 정의 (별자리) ] ---
const zodiacSigns = [
    { name_kr: "염소자리", name_en: "Capricorn", start: "01-01", end: "01-19" },
    { name_kr: "물병자리", name_en: "Aquarius", start: "01-20", end: "02-18" },
    { name_kr: "물고기자리", name_en: "Pisces", start: "02-19", end: "03-20" },
    { name_kr: "양자리", name_en: "Aries", start: "03-21", end: "04-19" },
    { name_kr: "황소자리", name_en: "Taurus", start: "04-20", end: "05-20" },
    { name_kr: "쌍둥이자리", name_en: "Gemini", start: "05-21", end: "06-21" },
    { name_kr: "게자리", name_en: "Cancer", start: "06-22", end: "07-22" },
    { name_kr: "사자자리", name_en: "Leo", start: "07-23", end: "08-22" },
    { name_kr: "처녀자리", name_en: "Virgo", start: "08-23", end: "09-23" },
    { name_kr: "천칭자리", name_en: "Libra", start: "09-24", end: "10-22" },
    { name_kr: "전갈자리", name_en: "Scorpio", start: "10-23", end: "11-22" },
    { name_kr: "사수자리", name_en: "Sagittarius", start: "11-23", end: "12-24" },
    { name_kr: "염소자리", name_en: "Capricorn", start: "12-25", end: "12-31" }
];

// --- [ 2. 초기화 (Initialization) ] ---

// MBTI 셀렉트 박스 채우기
const mbtiTypes = ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", 
                   "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"];
mbtiTypes.forEach(type => {
    if (myMbtiSelect) myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    if (partnerMbtiSelect) partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
});


// --- [ 3. 이벤트 리스너 연결 ] ---

// 탭 메뉴 기능
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabId = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));
        
        button.classList.add("active");
        document.getElementById(tabId).classList.add("active");
    });
});

// MBTI 버튼 (Fetch 사용)
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

// 별자리 버튼 (JSON Fetch 사용)
if (astroButton) {
    astroButton.addEventListener("click", () => {
        const myDateRaw = document.getElementById("my-astro-date").value.trim();
        const partnerDateRaw = document.getElementById("partner-astro-date").value.trim();

        const dateRegex = /^\d{4}$/; 
        if (!dateRegex.test(myDateRaw) || !dateRegex.test(partnerDateRaw)) {
            alert("생년월일을 '월일' 4자리 숫자(예: 0321)로 정확히 입력해주세요.");
            return;
        }

        const mySignResult = getZodiacSign(myDateRaw);
        const partnerSignResult = getZodiacSign(partnerDateRaw);
        
        if (mySignResult.name_kr === "미확인" || partnerSignResult.name_kr === "미확인") {
             alert("유효하지 않은 월일이거나 날짜 형식에 오류가 있습니다. 다시 확인해주세요.");
            return;
        }

        const mySign_en = mySignResult.name_en;
        const partnerSign_en = partnerSignResult.name_en;
        const mySign_kr = mySignResult.name_kr;
        const partnerSign_kr = partnerSignResult.name_kr;
        
        const [sign1_en, sign2_en] = [mySign_en, partnerSign_en].sort(); 
        const fileName = `${sign1_en}-${sign2_en}.json`;
        const filePath = `./data/astro/${fileName}`;

        runFetch(filePath, null, `별자리 궁합: ${mySign_kr} & ${partnerSign_kr}`);
    });
}

// 상세 페이지 버튼 기능
if (backButton) {
    backButton.addEventListener("click", () => {
        resultPage.classList.add("hidden");
        mainPage.classList.remove("hidden");
        cardContainer.classList.remove("result-active");
        pageBody.classList.remove("result-active");
        window.scrollTo(0, 0);
    });
}

if (astroRedirectButton) {
    astroRedirectButton.addEventListener("click", (e) => {
        const targetTabId = e.target.dataset.targetTab;
        
        resultPage.classList.add("hidden");
        mainPage.classList.remove("hidden");
        cardContainer.classList.remove("result-active");
        pageBody.classList.remove("result-active");
        
        const targetButton = document.querySelector(`.tab-button[data-tab='${targetTabId}']`);
        if (targetButton) {
            targetButton.click();
        }
        window.scrollTo(0, 0);
    });
}


// --- [ 4. 함수 정의 ] ---

// MBTI/별자리 공통: Fetch 및 페이지 컨트롤
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
                const baseFileName = filePath.split('/').pop();
                const reverseFileName = reverseFilePath ? reverseFilePath.split('/').pop() : '';
                throw new Error(`데이터 파일을 찾을 수 없습니다.<br><br>깃허브 'data/mbti/' 또는 'data/astro/' 폴더에 '${baseFileName}' ${reverseFileName ? `또는 '${reverseFileName}'` : ''} 파일이 있는지 확인해주세요.`);
            }
            return response.json();
        })
        .then(data => {
            currentTitle = title; 
            showResult(data, title);
            mainPage.classList.add("hidden");
            resultPage.classList.remove("hidden");
            cardContainer.classList.add("result-active"); 
            pageBody.classList.add("result-active");
        })
        .catch(error => {
            console.error("데이터 로드 오류:", error);
            if (error instanceof SyntaxError) {
                alert(`[JSON 형식 오류] 데이터 파일(${filePath.split('/').pop()})에 주석(//)이나 쉼표(,) 오류가 있는지 확인해주세요.`);
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

// 별자리 헬퍼: MMDD 문자열을 받아 별자리 정보 객체를 반환합니다.
function getZodiacSign(mmddString) {
    const month = parseInt(mmddString.substring(0, 2));
    const day = parseInt(mmddString.substring(2, 4));
    
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return { name_kr: "미확인", name_en: "Unknown" };
    }
    
    const monthDay = mmddString.substring(0, 2) + '-' + mmddString.substring(2, 4); // MM-DD 형식으로 변환

    for (const sign of zodiacSigns) {
        if (sign.name_kr === "염소자리" && (monthDay >= "12-25" || monthDay <= "01-19")) {
            return { name_kr: sign.name_kr, name_en: sign.name_en };
        }
        if (monthDay >= sign.start && monthDay <= sign.end) {
            return { name_kr: sign.name_kr, name_en: sign.name_en };
        }
    }
    return { name_kr: "미확인", name_en: "Unknown" }; // 안전장치
}

// 공통: 상세 페이지 기능 - 결과 표시
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
    
    // (MBTI/Astro 버튼 텍스트 교체)
    if (title.includes("MBTI")) {
        document.querySelector(`#astro-redirect-button`).textContent = "🔮 별자리 궁합도 보러가기";
        document.querySelector(`#astro-redirect-button`).dataset.targetTab = "astrology";
    } else {
        document.querySelector(`#astro-redirect-button`).textContent = "🧠 MBTI 궁합도 보러가기";
        document.querySelector(`#astro-redirect-button`).dataset.targetTab = "mbti";
    }
    
    // SNS 공유 기능 연결 (결과 페이지 버튼)
    setupResultShareButtons(title);
    
    // Disqus 댓글창 로드 (결과 ID 생성)
    let identifier;
    if (title.includes("MBTI")) {
        const mbtiPair = title.split(': ')[1].split(' & ');
        identifier = [mbtiPair[0], mbtiPair[1]].sort().join('-');
    } else {
        const signPair = title.split(': ')[1].split(' & ');
        const signEn1 = zodiacSigns.find(s => s.name_kr === signPair[0]).name_en;
        const signEn2 = zodiacSigns.find(s => s.name_kr === signPair[1]).name_en;
        identifier = [signEn1, signEn2].sort().join('-');
    }
    loadDisqus(identifier);
}


// --- [ 5. Disqus 댓글 로드 함수 ] ---
function loadDisqus(identifier) {
    // 1. [필수] 기획자님의 Shortname 적용
    const disqus_shortname = 'lj123'; 

    var disqus_config = function () {
        this.page.url = window.location.href.split('?')[0] + '#' + identifier;
        this.page.identifier = identifier;
    };
    
    const disqusThread = document.getElementById('disqus_thread');
    if (disqusThread) {
        disqusThread.innerHTML = ''; 
    }
    
    const oldScript = document.getElementById('disqus-script');
    if (oldScript) {
        oldScript.remove();
    }
    
    var d = document, s = d.createElement('script');
    s.id = 'disqus-script';
    s.src = `https://` + disqus_shortname + `.disqus.com/embed.js`;
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
}


// --- [ 6. SNS 공유 기능 로직 ] ---
function setupResultShareButtons(title) {
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
